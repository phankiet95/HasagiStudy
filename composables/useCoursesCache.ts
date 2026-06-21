const DB_NAME = 'hasagi-courses-cache'
const DB_VERSION = 1
const STORE_NAME = 'courses'

interface CourseCacheEntry {
  key: string
  orgSlug: string
  courses: any[]
  cachedAt: number
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
    req.onerror = () => { dbPromise = null; reject(req.error) }
  })
  return dbPromise
}

export function useCoursesCache() {
  async function saveCourses(orgSlug: string, courses: any[]): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const entry: CourseCacheEntry = { key: orgSlug, orgSlug, courses, cachedAt: Date.now() }
      const req = store.put(entry)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  async function getCourses(orgSlug: string): Promise<any[] | null> {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(orgSlug)
      req.onsuccess = () => resolve((req.result as CourseCacheEntry | undefined)?.courses ?? null)
      req.onerror = () => resolve(null)
    })
  }

  return { saveCourses, getCourses }
}
