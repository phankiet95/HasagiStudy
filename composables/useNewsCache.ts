import { openDB, idbGet, idbPut, idbGetAll } from './useOfflineLesson'

export interface NewsEntry {
  key: string
  orgSlug: string
  slug: string
  title: string
  cover_url: string | null
  content: string
  published_at: string | null
  cachedAt: string
  mediaUrls: string[]
}

interface MediaEntry {
  url: string
  blob: Blob
  mimeType: string
  size: number
  lessonKey: string
}

function extractMediaUrls(content: string, coverUrl?: string | null): string[] {
  const urls = new Set<string>()
  if (coverUrl) urls.add(coverUrl)
  const regex = /<(?:img|video|audio|source)[^>]+src="(https?:\/\/[^"]+)"/gi
  let match
  while ((match = regex.exec(content)) !== null) urls.add(match[1])
  return Array.from(urls)
}

export function applyNewsObjectUrls(content: string, coverUrl: string | null, objectUrls: Map<string, string>) {
  let result = content
  for (const [original, obj] of objectUrls) result = result.replaceAll(original, obj)
  const newCover = coverUrl ? (objectUrls.get(coverUrl) ?? coverUrl) : null
  return { content: result, cover_url: newCover }
}

export function useNewsCache() {
  const saveArticle = async (orgSlug: string, article: any) => {
    try {
      const db = await openDB()
      const key = `news:${orgSlug}/${article.slug}`
      const mediaUrls = extractMediaUrls(article.content || '', article.cover_url)

      const tx = db.transaction('news', 'readwrite')
      await idbPut(tx.objectStore('news'), {
        key, orgSlug,
        slug: article.slug,
        title: article.title,
        cover_url: article.cover_url,
        content: article.content || '',
        published_at: article.published_at,
        cachedAt: new Date().toISOString(),
        mediaUrls,
      } as NewsEntry)

      // Cache media blobs in background (don't block render)
      for (const url of mediaUrls) {
        try {
          const checkTx = db.transaction('media', 'readonly')
          const existing = await idbGet<MediaEntry>(checkTx.objectStore('media'), url)
          if (existing) continue
          const res = await fetch(url, { mode: 'cors' })
          if (!res.ok) continue
          const blob = await res.blob()
          const putTx = db.transaction('media', 'readwrite')
          await idbPut(putTx.objectStore('media'), { url, blob, mimeType: blob.type, size: blob.size, lessonKey: key })
        } catch { /* skip failed media */ }
      }
    } catch { /* ignore cache errors */ }
  }

  const getArticle = async (orgSlug: string, slug: string): Promise<NewsEntry | null> => {
    try {
      const db = await openDB()
      const tx = db.transaction('news', 'readonly')
      const entry = await idbGet<NewsEntry>(tx.objectStore('news'), `news:${orgSlug}/${slug}`)
      return entry ?? null
    } catch { return null }
  }

  const getCachedList = async (orgSlug: string): Promise<NewsEntry[]> => {
    try {
      const db = await openDB()
      const tx = db.transaction('news', 'readonly')
      const all = await idbGetAll<NewsEntry>(tx.objectStore('news'))
      return all
        .filter(e => e.orgSlug === orgSlug)
        .sort((a, b) =>
          new Date(b.published_at || b.cachedAt).getTime() -
          new Date(a.published_at || a.cachedAt).getTime()
        )
    } catch { return [] }
  }

  const getArticleWithMedia = async (orgSlug: string, slug: string) => {
    const article = await getArticle(orgSlug, slug)
    if (!article) return null
    const objectUrls = new Map<string, string>()
    try {
      const db = await openDB()
      for (const url of article.mediaUrls) {
        const tx = db.transaction('media', 'readonly')
        const media = await idbGet<MediaEntry>(tx.objectStore('media'), url)
        if (media?.blob) objectUrls.set(url, URL.createObjectURL(media.blob))
      }
    } catch { /* use original urls */ }
    return { article, objectUrls }
  }

  const isArticleCached = async (orgSlug: string, slug: string): Promise<boolean> => {
    try {
      const db = await openDB()
      const tx = db.transaction('news', 'readonly')
      const entry = await idbGet(tx.objectStore('news'), `news:${orgSlug}/${slug}`)
      return !!entry
    } catch { return false }
  }

  return { saveArticle, getArticle, getCachedList, getArticleWithMedia, isArticleCached }
}
