import { defineStore } from 'pinia'

export interface StudyStudent {
  id: string
  fullName: string
  username: string
  avatarUrl: string
  orgId: string
}

export const useStudyStore = defineStore('study', {
  state: () => ({
    orgSlug: null as string | null,
    orgName: '',
    orgLogo: '',
    orgDescription: '',
    sessionToken: null as string | null,
    student: null as StudyStudent | null,
  }),

  actions: {
    setOrg(slug: string, name: string, logo: string, description: string) {
      this.orgSlug = slug
      this.orgName = name
      this.orgLogo = logo
      this.orgDescription = description
      if (process.client) {
        localStorage.setItem('study_org_slug', slug)
        localStorage.setItem('study_org_name', name)
        localStorage.setItem('study_org_logo', logo)
        localStorage.setItem('study_org_description', description)
      }
    },

    setSession(token: string, student: StudyStudent) {
      this.sessionToken = token
      this.student = student
      if (process.client && this.orgSlug) {
        localStorage.setItem(`lms_session_${this.orgSlug}`, token)
        localStorage.setItem(`lms_student_${this.orgSlug}`, JSON.stringify(student))
      }
    },

    clearSession() {
      if (process.client && this.orgSlug) {
        localStorage.removeItem(`lms_session_${this.orgSlug}`)
        localStorage.removeItem(`lms_student_${this.orgSlug}`)
      }
      this.sessionToken = null
      this.student = null
    },

    clearAll() {
      this.clearSession()
      if (process.client) {
        localStorage.removeItem('study_org_slug')
        localStorage.removeItem('study_org_name')
        localStorage.removeItem('study_org_logo')
        localStorage.removeItem('study_org_description')
      }
      this.orgSlug = null
      this.orgName = ''
      this.orgLogo = ''
      this.orgDescription = ''
    },

    loadFromStorage() {
      if (!process.client) return
      const slug = localStorage.getItem('study_org_slug')
      if (slug) {
        this.orgSlug = slug
        this.orgName = localStorage.getItem('study_org_name') || ''
        this.orgLogo = localStorage.getItem('study_org_logo') || ''
        this.orgDescription = localStorage.getItem('study_org_description') || ''
        const token = localStorage.getItem(`lms_session_${slug}`)
        const raw = localStorage.getItem(`lms_student_${slug}`)
        if (token && raw) {
          try {
            this.sessionToken = token
            this.student = JSON.parse(raw)
          } catch {
            this.sessionToken = null
            this.student = null
          }
        }
      }
    },
  },
})
