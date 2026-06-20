<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useStudyStore } from '~/composables/useStudyStore'

const store = useStudyStore()
onMounted(() => {
  store.loadFromStorage()
})
</script>
