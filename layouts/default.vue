<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Main content with bottom padding for nav -->
    <main class="flex-1 pb-16" style="padding-bottom: calc(4rem + env(safe-area-inset-bottom, 0px))">
      <slot />
    </main>

    <!-- Bottom navigation -->
    <nav class="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 flex"
      style="padding-bottom: env(safe-area-inset-bottom, 0px)">
      <NuxtLink to="/courses"
        class="flex-1 flex flex-col items-center justify-center gap-0.5 h-16 transition-colors"
        :class="isCourses ? 'text-[#054743]' : 'text-gray-400 hover:text-gray-600'">
        <!-- Book icon (outline → filled when active) -->
        <svg v-if="!isCourses" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
        </svg>
        <span class="text-sm font-medium">Khóa học</span>
        <div v-if="isCourses" class="w-1 h-1 rounded-full bg-[#054743] mt-0.5" />
      </NuxtLink>

      <NuxtLink to="/news"
        class="flex-1 flex flex-col items-center justify-center gap-0.5 h-16 transition-colors"
        :class="isNews ? 'text-[#054743]' : 'text-gray-400 hover:text-gray-600'">
        <svg v-if="!isNews" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
        </svg>
        <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path fill-rule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 003 3h15a3 3 0 01-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125zM12 9.75a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H12zm-.75-2.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5H12a.75.75 0 01-.75-.75zM6 12.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5H6zm-.75 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5H6a.75.75 0 01-.75-.75zM6 6.75a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 00.75-.75v-3A.75.75 0 009 6.75H6z" clip-rule="evenodd" />
          <path d="M18.75 6.75h1.875c.621 0 1.125.504 1.125 1.125V18a1.5 1.5 0 01-3 0V6.75z" />
        </svg>
        <span class="text-sm font-medium">Tin tức</span>
        <div v-if="isNews" class="w-1 h-1 rounded-full bg-[#054743] mt-0.5" />
      </NuxtLink>

      <NuxtLink to="/settings"
        class="flex-1 flex flex-col items-center justify-center gap-0.5 h-16 transition-colors"
        :class="isSettings ? 'text-[#054743]' : 'text-gray-400 hover:text-gray-600'">
        <!-- User icon -->
        <svg v-if="!isSettings" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm font-medium">Hồ sơ</span>
        <div v-if="isSettings" class="w-1 h-1 rounded-full bg-[#054743] mt-0.5" />
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup>
const route = useRoute()
const isCourses = computed(() => route.path.startsWith('/courses'))
const isNews = computed(() => route.path.startsWith('/news'))
const isSettings = computed(() => route.path === '/settings')
</script>
