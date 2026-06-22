const DB_NAME = 'hasagi-study-offline'
const DB_VERSION = 2

interface LessonEntry {
  key: string
  orgSlug: string
  courseSlug: string
  lessonSlug: string
  data: any
  mediaUrls: string[]
  downloadedAt: string
}

interface MediaEntry {
  url: string
  blob: Blob
  mimeType: string
  size: number
  lessonKey: string
}

export interface DownloadState {
  status: 'idle' | 'downloading' | 'done' | 'error'
  progress: number
  downloaded: number
  total: number
  errorMessage?: string
}

export interface DownloadProgress {
  downloaded: number
  total: number
  currentUrl: string
}

// Shared reactive state across all uses of this composable
const downloadStates = reactive<Record<string, DownloadState>>({})

let dbPromise: Promise<IDBDatabase> | null = null

export function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('lessons')) {
        db.createObjectStore('lessons', { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media', { keyPath: 'url' })
      }
      if (!db.objectStoreNames.contains('news')) {
        db.createObjectStore('news', { keyPath: 'key' })
      }
    }
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
    req.onerror = () => { dbPromise = null; reject(req.error) }
  })
  return dbPromise
}

export function idbGet<T>(store: IDBObjectStore, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const req = store.get(key)
    req.onsuccess = () => resolve(req.result as T)
    req.onerror = () => reject(req.error)
  })
}

export function idbPut(store: IDBObjectStore, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = store.put(value)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

function idbDelete(store: IDBObjectStore, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = store.delete(key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export function idbGetAll<T>(store: IDBObjectStore): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror = () => reject(req.error)
  })
}

function idbIndex(store: IDBObjectStore, indexName: string, value: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const index = store.index(indexName)
    const req = index.getAll(value)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// Collect all media URLs from a lesson API response
export function collectMediaUrls(lessonApiData: any): string[] {
  const urls: Set<string> = new Set()
  const lesson = lessonApiData?.lesson
  if (!lesson) return []

  const meta = lesson.metadata || {}

  // Videos
  for (const v of meta.videos || []) if (v?.url) urls.add(v.url)

  // Documents (PDFs)
  for (const d of meta.documents || []) if (d?.url) urls.add(d.url)

  // Quiz question media
  for (const q of meta.quiz?.quizQuestionList || []) {
    if (q?.media?.url) urls.add(q.media.url)
  }

  // Flashcard media
  for (const f of meta.flashcards || []) {
    if (f?.media?.url) urls.add(f.media.url)
    if (f?.termVoice?.url) urls.add(f.termVoice.url)
    if (f?.definitionVoice?.url) urls.add(f.definitionVoice.url)
    for (const ev of f?.exampleVoices || []) {
      if (ev?.url) urls.add(ev.url)
    }
  }

  // Inline images in HTML content
  const imgRegex = /src="(https?:\/\/[^"]+)"/g
  let match
  const content = lesson.content || ''
  while ((match = imgRegex.exec(content)) !== null) {
    urls.add(match[1])
  }

  return [...urls]
}

// Replace CDN URLs in lesson data with ObjectURLs (for offline rendering)
function applyObjectUrls(lessonApiData: any, urlMap: Map<string, string>): any {
  if (urlMap.size === 0) return lessonApiData
  const data = JSON.parse(JSON.stringify(lessonApiData))
  const lesson = data.lesson
  const meta = lesson.metadata || {}

  const remap = (url: string) => urlMap.get(url) || url

  for (const v of meta.videos || []) if (v?.url) v.url = remap(v.url)
  for (const d of meta.documents || []) if (d?.url) d.url = remap(d.url)
  for (const q of meta.quiz?.quizQuestionList || []) {
    if (q?.media?.url) q.media.url = remap(q.media.url)
  }
  for (const f of meta.flashcards || []) {
    if (f?.media?.url) f.media.url = remap(f.media.url)
    if (f?.termVoice?.url) f.termVoice.url = remap(f.termVoice.url)
    if (f?.definitionVoice?.url) f.definitionVoice.url = remap(f.definitionVoice.url)
    for (const ev of f?.exampleVoices || []) {
      if (ev?.url) ev.url = remap(ev.url)
    }
  }

  let content = lesson.content || ''
  for (const [cdnUrl, objUrl] of urlMap) {
    content = content.split(cdnUrl).join(objUrl)
  }
  lesson.content = content

  return data
}

async function fetchBlob(url: string): Promise<{ blob: Blob; mimeType: string; size: number }> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const blob = await res.blob()
  return {
    blob,
    mimeType: res.headers.get('content-type') || blob.type || 'application/octet-stream',
    size: blob.size,
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('network-timeout')), ms),
    ),
  ])
}

export function useOfflineLesson() {
  const isLessonOffline = async (key: string): Promise<boolean> => {
    try {
      const db = await openDB()
      return new Promise((resolve) => {
        const tx = db.transaction('lessons', 'readonly')
        const req = tx.objectStore('lessons').get(key)
        req.onsuccess = () => resolve(!!req.result)
        req.onerror = () => resolve(false)
      })
    } catch {
      return false
    }
  }

  const getOfflineLesson = async (key: string): Promise<any | null> => {
    try {
      const db = await openDB()
      const tx = db.transaction('lessons', 'readonly')
      const entry = await idbGet<LessonEntry>(tx.objectStore('lessons'), key)
      return entry?.data ?? null
    } catch {
      return null
    }
  }

  const getOfflineObjectUrls = async (key: string): Promise<Map<string, string>> => {
    const urlMap = new Map<string, string>()
    try {
      const db = await openDB()
      const tx = db.transaction(['lessons', 'media'], 'readonly')
      const entry = await idbGet<LessonEntry>(tx.objectStore('lessons'), key)
      if (!entry?.mediaUrls?.length) return urlMap

      const mediaStore = tx.objectStore('media')
      for (const url of entry.mediaUrls) {
        const m = await idbGet<MediaEntry>(mediaStore, url)
        if (m?.blob) urlMap.set(url, URL.createObjectURL(m.blob))
      }
    } catch {
      // Return partial map
    }
    return urlMap
  }

  const downloadLesson = async (
    params: { orgSlug: string; courseSlug: string; lessonSlug: string; sessionToken: string },
    onProgress?: (p: DownloadProgress) => void,
  ): Promise<void> => {
    const { orgSlug, courseSlug, lessonSlug, sessionToken } = params
    const key = `${orgSlug}/${courseSlug}/${lessonSlug}`

    downloadStates[lessonSlug] = { status: 'downloading', progress: 0, downloaded: 0, total: 0 }

    try {
      // 1. Fetch lesson data
      const lessonApiData = await $fetch<any>('/api/lms/lesson-detail', {
        query: { orgSlug, courseSlug, lessonSlug },
        headers: { 'x-lms-session': sessionToken },
      })

      // 2. Collect media URLs
      const mediaUrls = collectMediaUrls(lessonApiData)
      const total = mediaUrls.length
      downloadStates[lessonSlug].total = total

      // 3. Download media blobs (3 concurrent)
      const db = await openDB()
      let downloaded = 0

      const downloadOne = async (url: string) => {
        try {
          const { blob, mimeType, size } = await fetchBlob(url)
          const tx = db.transaction('media', 'readwrite')
          await idbPut(tx.objectStore('media'), { url, blob, mimeType, size, lessonKey: key } as MediaEntry)
        } catch {
          // Skip failed media silently
        }
        downloaded++
        const progress = total > 0 ? Math.round((downloaded / total) * 100) : 100
        downloadStates[lessonSlug].downloaded = downloaded
        downloadStates[lessonSlug].progress = progress
        onProgress?.({ downloaded, total, currentUrl: url })
      }

      // Batched concurrent downloads (3 at a time)
      for (let i = 0; i < mediaUrls.length; i += 3) {
        await Promise.all(mediaUrls.slice(i, i + 3).map(downloadOne))
      }

      // 4. Save lesson JSON
      const tx = db.transaction('lessons', 'readwrite')
      await idbPut(tx.objectStore('lessons'), {
        key,
        orgSlug,
        courseSlug,
        lessonSlug,
        data: lessonApiData,
        mediaUrls,
        downloadedAt: new Date().toISOString(),
      } as LessonEntry)

      downloadStates[lessonSlug] = { status: 'done', progress: 100, downloaded, total }
    } catch (e: any) {
      const msg = e?.message?.includes('QuotaExceeded')
        ? 'Bộ nhớ đầy, vui lòng xóa bài học cũ'
        : 'Tải thất bại, vui lòng thử lại'
      downloadStates[lessonSlug] = { status: 'error', progress: 0, downloaded: 0, total: 0, errorMessage: msg }
      throw e
    }
  }

  const deleteOfflineLesson = async (key: string): Promise<void> => {
    try {
      const db = await openDB()

      // Get media URLs before deleting lesson
      const lessonTx = db.transaction('lessons', 'readonly')
      const entry = await idbGet<LessonEntry>(lessonTx.objectStore('lessons'), key)

      if (entry?.mediaUrls?.length) {
        const mediaTx = db.transaction('media', 'readwrite')
        const mediaStore = mediaTx.objectStore('media')
        for (const url of entry.mediaUrls) {
          await idbDelete(mediaStore, url)
        }
      }

      const delTx = db.transaction('lessons', 'readwrite')
      await idbDelete(delTx.objectStore('lessons'), key)

      const lessonSlug = key.split('/').pop() || key
      delete downloadStates[lessonSlug]
    } catch {
      // Ignore cleanup errors
    }
  }

  const getOfflineCourseData = async (orgSlug: string, courseSlug: string): Promise<{
    course: any; chapters: any[]; allLessons: any[]; downloadedSlugs: string[]
  } | null> => {
    try {
      const db = await openDB()
      const tx = db.transaction('lessons', 'readonly')
      const all = await idbGetAll<LessonEntry>(tx.objectStore('lessons'))
      const prefix = `${orgSlug}/${courseSlug}/`
      const entries = all.filter(e => e.key?.startsWith(prefix))
      if (!entries.length) return null
      const first = entries.find(e => e.data?.course)
      if (!first) return null
      return {
        course: first.data.course,
        chapters: first.data.chapters || [],
        allLessons: first.data.allLessons || [],
        downloadedSlugs: entries.map(e => e.lessonSlug),
      }
    } catch {
      return null
    }
  }

  const initDownloadStates = async (orgSlug: string, courseSlug: string, lessonSlugs: string[]) => {
    try {
      const db = await openDB()
      const tx = db.transaction('lessons', 'readonly')
      const store = tx.objectStore('lessons')
      for (const slug of lessonSlugs) {
        const key = `${orgSlug}/${courseSlug}/${slug}`
        const entry = await idbGet<LessonEntry>(store, key)
        if (entry) {
          downloadStates[slug] = { status: 'done', progress: 100, downloaded: 0, total: 0 }
        } else if (!downloadStates[slug]) {
          downloadStates[slug] = { status: 'idle', progress: 0, downloaded: 0, total: 0 }
        }
      }
    } catch {
      // Non-critical
    }
  }

  return {
    downloadStates,
    downloadLesson,
    deleteOfflineLesson,
    getOfflineLesson,
    getOfflineObjectUrls,
    getOfflineCourseData,
    isLessonOffline,
    initDownloadStates,
    collectMediaUrls,
    applyObjectUrls,
  }
}
