<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Header -->
    <div class="green-background px-4 pt-6 pb-5">
      <div class="flex items-center gap-3 max-w-2xl mx-auto">
        <div class="w-9 h-9 rounded-xl overflow-hidden bg-white/30 flex-shrink-0 flex items-center justify-center">
          <img v-if="store.orgLogo" :src="store.orgLogo" class="w-full h-full object-contain" />
          <span v-else class="text-sm font-black green-primary">{{ store.orgName?.[0]?.toUpperCase() }}</span>
        </div>
        <div>
          <p class="text-[11px] font-semibold green-second uppercase tracking-widest">{{ store.orgName }}</p>
          <h1 class="text-xl font-bold green-primary leading-tight">Tin tức</h1>
        </div>
      </div>
    </div>

    <!-- Offline banner -->
    <div v-if="isOffline" class="mx-4 mt-4 flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
      <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M8.111 8.111A3 3 0 0012 15a3 3 0 003-3 3 3 0 00-.111-.889M21 12a9 9 0 01-9 9m-6.343-2.657A9 9 0 013 12c0-2.48 1.007-4.729 2.636-6.364" />
      </svg>
      <span class="font-medium">Đang xem offline</span>
      <span class="text-amber-500 text-xs">— Chỉ hiển thị bài đã đọc</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-28 gap-3">
      <svg class="animate-spin w-8 h-8 text-leaf-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>

    <!-- Empty state -->
    <div v-else-if="news.length === 0" class="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div class="w-16 h-16 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
        </svg>
      </div>
      <p class="text-gray-600 font-semibold text-base">{{ isOffline ? 'Chưa có bài viết được lưu' : 'Chưa có tin tức nào' }}</p>
      <p class="text-gray-400 text-sm mt-1.5 leading-relaxed">{{ isOffline ? 'Đọc bài viết khi có mạng để lưu offline' : 'Tổ chức chưa đăng tin tức nào' }}</p>
    </div>

    <!-- News list -->
    <div v-else class="max-w-2xl mx-auto px-4 py-5 space-y-4">

      <!-- Featured first article -->
      <NuxtLink :to="`/news/${news[0].slug}`"
        class="block rounded-2xl overflow-hidden shadow-md active:scale-[0.99] transition-transform bg-white">
        <div class="relative">
          <div class="w-full aspect-[16/9] bg-gradient-to-br from-leaf-100 to-leaf-200 overflow-hidden">
            <img v-if="news[0].cover_url" :src="news[0].cover_url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-16 h-16 text-leaf-300" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
            </div>
          </div>
          <!-- Featured badge -->
          <div class="absolute top-3 left-3">
            <span class="dark-green-button text-[11px] font-bold px-2.5 py-1 rounded-full shadow">Mới nhất</span>
          </div>
          <div v-if="news[0].cached" class="absolute top-3 right-3">
            <span class="text-[10px] font-semibold bg-white/90 text-leaf-700 px-2 py-0.5 rounded-full border border-leaf-200 shadow-sm">Đã lưu</span>
          </div>
        </div>
        <div class="p-4">
          <h2 class="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2">{{ news[0].title }}</h2>
          <div class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
            <span class="text-xs text-gray-400">{{ formatDate(news[0].published_at) }}</span>
          </div>
        </div>
      </NuxtLink>

      <!-- Remaining articles -->
      <div v-if="news.length > 1" class="space-y-3">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Tất cả bài viết</p>
        <NuxtLink
          v-for="item in news.slice(1)"
          :key="item.slug"
          :to="`/news/${item.slug}`"
          class="flex gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden active:scale-[0.99] transition-transform"
        >
          <!-- Thumbnail -->
          <div class="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-leaf-50 to-leaf-100 overflow-hidden">
            <img v-if="item.cover_url" :src="item.cover_url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-7 h-7 text-leaf-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 py-3 pr-3 flex flex-col justify-between">
            <div>
              <p class="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-1.5">{{ item.title }}</p>
              <div class="flex items-center gap-1.5">
                <svg class="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
                <span class="text-[11px] text-gray-400">{{ formatDate(item.published_at) }}</span>
              </div>
            </div>
            <div v-if="item.cached" class="mt-2">
              <span class="text-[10px] font-semibold text-leaf-600 bg-leaf-50 px-2 py-0.5 rounded-full border border-leaf-200">Đã lưu offline</span>
            </div>
          </div>
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useStudyStore } from '~/composables/useStudyStore'
import { useNewsCache } from '~/composables/useNewsCache'

const store = useStudyStore()
const { getCachedList, isArticleCached } = useNewsCache()

const news = ref([])
const loading = ref(true)
const isOffline = ref(false)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(async () => {
  if (!store.orgSlug) return navigateTo('/connect')

  isOffline.value = !navigator.onLine

  if (!navigator.onLine) {
    news.value = await getCachedList(store.orgSlug)
    loading.value = false
    return
  }

  try {
    const { news: data } = await $fetch('/api/lms/news-list', {
      query: { orgSlug: store.orgSlug },
    })

    const withCache = await Promise.all(
      data.map(async (item) => ({
        ...item,
        cached: await isArticleCached(store.orgSlug, item.slug),
      }))
    )
    news.value = withCache
  } catch {
    isOffline.value = true
    news.value = await getCachedList(store.orgSlug)
  } finally {
    loading.value = false
  }
})
</script>
