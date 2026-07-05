<template>
  <VitePwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { useStudyStore } from '~/composables/useStudyStore'
import { useAppLocale } from '~/composables/useAppLocale'

const store = useStudyStore()
const { initLocale } = useAppLocale()
const pwaInstallPrompt = useState('pwaInstallPrompt', () => null)

onMounted(() => {
  initLocale()
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
