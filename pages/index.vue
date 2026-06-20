<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="flex flex-col items-center gap-3">
      <svg class="animate-spin w-10 h-10 text-indigo-500" fill="none" viewBox="0 0 24 24">
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
    return navigateTo('/connect')
  }

  if (!store.sessionToken) {
    return navigateTo('/login')
  }

  const student = await validateSession(store.sessionToken)
  if (student) {
    store.student = student
    return navigateTo('/courses')
  } else {
    store.clearSession()
    return navigateTo('/login')
  }
})
</script>
