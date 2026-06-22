const DB_NAME = 'hasagi-courses-cache'
const DB_VERSION = 2
const STORE_COURSES = 'courses'
const STORE_COURSE_DETAIL = 'course-details'

interface CourseCacheEntry {
  key: string
  orgSlug: string
  courses: any[]
  cachedAt: number
}

interface CourseDetailCacheEntry {
  key: string
  course: any
  chapters: any[]
  cachedAt: number
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_COURSES)) {
        db.createObjectStore(STORE_COURSES, { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains(STORE_COURSE_DETAIL)) {
        db.createObjectStore(STORE_COURSE_DETAIL, { keyPath: 'key' })
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
      const tx = db.transaction(STORE_COURSES, 'readwrite')
      const store = tx.objectStore(STORE_COURSES)
      const entry: CourseCacheEntry = { key: orgSlug, orgSlug, courses, cachedAt: Date.now() }
      const req = store.put(entry)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  async function getCourses(orgSlug: string): Promise<any[] | null> {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_COURSES, 'readonly')
      const store = tx.objectStore(STORE_COURSES)
      const req = store.get(orgSlug)
      req.onsuccess = () => resolve((req.result as CourseCacheEntry | undefined)?.courses ?? null)
      req.onerror = () => resolve(null)
    })
  }

  async function saveCourseDetail(orgSlug: string, courseSlug: string, course: any, chapters: any[]): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_COURSE_DETAIL, 'readwrite')
      const store = tx.objectStore(STORE_COURSE_DETAIL)
      const entry: CourseDetailCacheEntry = {
        key: `${orgSlug}/${courseSlug}`,
        course,
        chapters,
        cachedAt: Date.now(),
      }
      const req = store.put(entry)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  }

  async function getCourseDetail(orgSlug: string, courseSlug: string): Promise<{ course: any; chapters: any[] } | null> {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_COURSE_DETAIL, 'readonly')
      const store = tx.objectStore(STORE_COURSE_DETAIL)
      const req = store.get(`${orgSlug}/${courseSlug}`)
      req.onsuccess = () => {
        const result = req.result as CourseDetailCacheEntry | undefined
        if (!result) return resolve(null)
        resolve({ course: result.course, chapters: result.chapters })
      }
      req.onerror = () => resolve(null)
    })
  }

  return { saveCourses, getCourses, saveCourseDetail, getCourseDetail }
}
