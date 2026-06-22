<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="flex flex-col items-center gap-3">
      <svg class="animate-spin w-10 h-10 text-leaf-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <p class="text-gray-400 text-sm">Đang khởi động...</p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'blank' })

import { useStudyStore } from '~/composables/useStudyStore'
import { useLmsStudent } from '~/composables/useLmsStudent'

const store = useStudyStore()
const { validateSession } = useLmsStudent()

onMounted(async () => {
  store.loadFromStorage()

  if (!store.orgSlug) {
    // Preserve query params (e.g. ?org=xxx) — may be in window.location but hidden from
    // route.query when the SW's navigateFallback serves / HTML instead of /connect
    const query = Object.fromEntries(new URLSearchParams(window.location.search))
    return navigateTo({ path: '/connect', query })
  }
  if (!store.sessionToken) return navigateTo('/login')

  // Offline: trust the stored session and go straight to courses
  if (!navigator.onLine) {
    return navigateTo('/courses')
  }

  try {
    const student = await validateSession(store.sessionToken)
    if (student) {
      store.student = student
      return navigateTo('/courses')
    } else {
      store.clearSession()
      return navigateTo('/login')
    }
  } catch {
    // Network error but has session — go to courses, show cached data
    return navigateTo('/courses')
  }
})
</script>
