import { ref } from 'vue'

// Module-level singleton — shared reactively across all component imports
const unreadCount = ref(0)

function storageKey(orgSlug: string) {
  return `news_read:${orgSlug}`
}

function totalKey(orgSlug: string) {
  return `news_total:${orgSlug}`
}

function getReadSlugs(orgSlug: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(orgSlug))
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

export function useNewsRead() {
  const isRead = (orgSlug: string, slug: string): boolean => {
    return getReadSlugs(orgSlug).has(slug)
  }

  const markAsRead = (orgSlug: string, slug: string) => {
    const slugs = getReadSlugs(orgSlug)
    if (slugs.has(slug)) return
    slugs.add(slug)
    try {
      localStorage.setItem(storageKey(orgSlug), JSON.stringify([...slugs]))
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch {}
  }

  // Call after fetching the news list from server with the authoritative total count
  const refreshUnread = (orgSlug: string, serverTotal?: number) => {
    try {
      if (serverTotal !== undefined) {
        localStorage.setItem(totalKey(orgSlug), String(serverTotal))
      }
      const total = parseInt(localStorage.getItem(totalKey(orgSlug)) || '0')
      const readCount = getReadSlugs(orgSlug).size
      unreadCount.value = Math.max(0, total - readCount)
    } catch {
      unreadCount.value = 0
    }
  }

  return { isRead, markAsRead, refreshUnread, unreadCount }
}
