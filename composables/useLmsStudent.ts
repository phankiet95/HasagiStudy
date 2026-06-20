import type { StudyStudent } from './useStudyStore'

export const useLmsStudent = () => {
  const login = async (orgSlug: string, username: string, password: string): Promise<{ sessionToken: string; student: StudyStudent }> => {
    const data = await $fetch<{ sessionToken: string; student: StudyStudent }>('/api/lms/student-login', {
      method: 'POST',
      body: { orgSlug, username, password },
    })
    return data
  }

  const validateSession = async (token: string): Promise<StudyStudent | null> => {
    try {
      const { student } = await $fetch<{ student: StudyStudent }>('/api/lms/student-session', {
        method: 'POST',
        body: { sessionToken: token },
      })
      return student
    } catch (e: any) {
      // HTTP error (4xx/5xx) = session genuinely invalid → return null so caller clears it
      // Network error (no status) = offline/unreachable → re-throw so caller can fall back to offline
      if (e?.statusCode || e?.status || e?.response?.status) return null
      throw e
    }
  }

  return { login, validateSession }
}
