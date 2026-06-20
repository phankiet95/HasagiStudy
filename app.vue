<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useStudyStore } from '~/composables/useStudyStore'

const store = useStudyStore()
const pwaInstallPrompt = useState('pwaInstallPrompt', () => null)

onMounted(() => {
  store.loadFromStorage()

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    pwaInstallPrompt.value = e
  })

  window.addEventListener('appinstalled', () => {
    pwaInstallPrompt.value = null
  })
})
</script>
