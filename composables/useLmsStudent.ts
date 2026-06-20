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
    } catch {
      return null
    }
  }

  return { login, validateSession }
}
