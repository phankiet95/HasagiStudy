<template>
  <div class="min-h-screen bg-white flex flex-col">

    <!-- Header -->
    <div class="green-background px-4 pt-6 pb-5">
      <div class="flex items-center gap-3 max-w-2xl mx-auto">
        <NuxtLink to="/news" class="flex-shrink-0">
          <div class="w-9 h-9 rounded-xl bg-white/30 hover:bg-white/50 flex items-center justify-center transition-colors">
            <svg class="w-4 h-4 green-primary" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </div>
        </NuxtLink>

        <div class="w-9 h-9 rounded-xl overflow-hidden bg-white/30 flex-shrink-0 flex items-center justify-center">
          <img v-if="store.orgLogo" :src="store.orgLogo" class="w-full h-full object-contain" />
          <span v-else class="text-sm font-black green-primary">{{ store.orgName?.[0]?.toUpperCase() }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[11px] font-semibold green-second uppercase tracking-widest truncate">{{ store.orgName }}</p>
          <h1 class="text-xl font-bold green-primary leading-tight">Tin tức</h1>
        </div>

        <div v-if="isOfflineMode" class="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-600 text-xs font-semibold rounded-full border border-amber-500/30 flex-shrink-0">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M8.111 8.111A3 3 0 0012 15a3 3 0 003-3 3 3 0 00-.111-.889M21 12a9 9 0 01-9 9m-6.343-2.657A9 9 0 013 12c0-2.48 1.007-4.729 2.636-6.364" />
          </svg>
          Offline
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <svg class="animate-spin w-8 h-8 text-leaf-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>

    <!-- Not found -->
    <div v-else-if="!article" class="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <p class="text-gray-700 font-semibold">Không tìm thấy bài viết</p>
      <p class="text-gray-400 text-sm mt-1 leading-relaxed">{{ isOfflineMode ? 'Bài viết này chưa được lưu offline' : 'Bài viết không tồn tại hoặc chưa được đăng' }}</p>
      <NuxtLink to="/news" class="mt-5 inline-flex items-center gap-2 px-4 py-2.5 dark-green-button text-sm font-semibold rounded-xl">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Về trang tin tức
      </NuxtLink>
    </div>

    <!-- Article -->
    <article v-else class="flex-1 max-w-2xl mx-auto w-full">

      <!-- Hero: cover with gradient overlay + title -->
      <div v-if="article.cover_url" class="relative w-full">
        <div class="aspect-[4/3] sm:aspect-video overflow-hidden bg-gray-200">
          <img :src="article.cover_url" class="w-full h-full object-cover" />
        </div>
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <!-- Title on image -->
        <div class="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-20">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-5 h-5 rounded-md overflow-hidden bg-white/20 flex-shrink-0 flex items-center justify-center">
              <img v-if="store.orgLogo" :src="store.orgLogo" class="w-full h-full object-contain" />
              <span v-else class="text-[9px] font-black text-white">{{ store.orgName?.[0]?.toUpperCase() }}</span>
            </div>
            <span class="text-white/80 text-xs font-semibold">{{ store.orgName }}</span>
            <span class="text-white/40">·</span>
            <span class="text-white/60 text-xs">{{ formatDate(article.published_at) }}</span>
          </div>
          <h1 class="text-white text-xl sm:text-2xl font-bold leading-snug drop-shadow-lg">{{ article.title }}</h1>
        </div>
      </div>

      <!-- Hero: no cover → colored header -->
      <div v-else class="green-background px-5 pt-8 pb-8">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-6 h-6 rounded-lg overflow-hidden bg-white/50 flex-shrink-0 flex items-center justify-center border border-white/30">
            <img v-if="store.orgLogo" :src="store.orgLogo" class="w-full h-full object-contain" />
            <span v-else class="text-[10px] font-black green-primary">{{ store.orgName?.[0]?.toUpperCase() }}</span>
          </div>
          <span class="text-xs font-semibold green-second">{{ store.orgName }}</span>
          <span class="text-gray-400">·</span>
          <span class="text-xs green-second opacity-70">{{ formatDate(article.published_at) }}</span>
        </div>
        <h1 class="text-2xl font-bold green-primary leading-snug">{{ article.title }}</h1>
      </div>

      <!-- Meta strip (only shown when cover exists, since meta is in header otherwise) -->
      <div v-if="article.cover_url" class="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
        <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
        </svg>
        <span class="text-xs text-gray-500">{{ formatDate(article.published_at) }}</span>
        <div class="w-px h-3 bg-gray-300" />
      </div>

      <!-- Content -->
      <div
        class="px-5 pt-6 pb-4 prose prose-base max-w-none
          prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mt-6 prose-headings:mb-3
          prose-p:text-gray-700 prose-p:leading-[1.85] prose-p:my-4
          prose-a:text-leaf-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900 prose-strong:font-semibold
          prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:leading-relaxed prose-li:my-1
          prose-img:rounded-2xl prose-img:shadow-md prose-img:w-full prose-img:my-5
          prose-video:rounded-2xl prose-video:w-full prose-video:my-5
          prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-leaf-500
            prose-blockquote:bg-leaf-50 prose-blockquote:rounded-r-2xl prose-blockquote:px-5
            prose-blockquote:py-3 prose-blockquote:text-gray-600 prose-blockquote:my-5
          prose-hr:border-gray-100 prose-hr:my-6
          prose-code:bg-gray-100 prose-code:rounded prose-code:px-1.5 prose-code:text-sm"
        v-html="renderedContent"
      />

    </article>

  </div>
</template>

<script setup>
import { useStudyStore } from '~/composables/useStudyStore'
import { useNewsCache, applyNewsObjectUrls } from '~/composables/useNewsCache'

const route = useRoute()
const store = useStudyStore()
const { getArticleWithMedia, saveArticle } = useNewsCache()

const article = ref(null)
const loading = ref(true)
const isOfflineMode = ref(false)
let objectUrls = new Map()

const renderedContent = computed(() => {
  if (!article.value) return ''
  if (objectUrls.size === 0) return article.value.content
  const { content } = applyNewsObjectUrls(article.value.content, null, objectUrls)
  return content
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(async () => {
  if (!store.orgSlug) return navigateTo('/connect')

  const slug = route.params.slug

  if (!navigator.onLine) {
    const cached = await getArticleWithMedia(store.orgSlug, slug)
    if (cached) {
      objectUrls = cached.objectUrls
      const { content, cover_url } = applyNewsObjectUrls(cached.article.content, cached.article.cover_url, objectUrls)
      article.value = { ...cached.article, content, cover_url }
      isOfflineMode.value = true
    }
    loading.value = false
    return
  }

  try {
    const { article: data } = await $fetch('/api/lms/news-detail', {
      query: { orgSlug: store.orgSlug, slug },
    })
    article.value = data
    saveArticle(store.orgSlug, data)
  } catch {
    const cached = await getArticleWithMedia(store.orgSlug, slug)
    if (cached) {
      objectUrls = cached.objectUrls
      const { content, cover_url } = applyNewsObjectUrls(cached.article.content, cached.article.cover_url, objectUrls)
      article.value = { ...cached.article, content, cover_url }
      isOfflineMode.value = true
    }
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  for (const url of objectUrls.values()) URL.revokeObjectURL(url)
})
</script>
