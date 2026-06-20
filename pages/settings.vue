<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-5 py-5">
      <h1 class="text-2xl font-bold text-gray-900">Hồ sơ</h1>
    </div>

    <div class="px-4 py-5 space-y-4">

      <!-- Student card -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-leaf-400 to-leaf-400 flex items-center justify-center flex-shrink-0">
            <img v-if="store.student?.avatarUrl" :src="store.student.avatarUrl" class="w-full h-full object-cover" />
            <span v-else class="text-2xl font-black text-white">{{ store.student?.fullName?.[0]?.toUpperCase() }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-lg font-bold text-gray-900 truncate">{{ store.student?.fullName }}</p>
            <p class="text-gray-500 text-sm">@{{ store.student?.username }}</p>
            <span class="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-leaf-500 bg-leaf-50 px-2.5 py-0.5 rounded-full">
              Học viên
            </span>
          </div>
        </div>
      </div>

      <!-- Org info card -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tổ chức đang kết nối</p>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl overflow-hidden bg-leaf-50 border border-leaf-100 flex-shrink-0 flex items-center justify-center">
            <img v-if="store.orgLogo" :src="store.orgLogo" class="w-full h-full object-contain" />
            <span v-else class="text-xl font-black text-leaf-400">{{ store.orgName?.[0]?.toUpperCase() }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 truncate">{{ store.orgName }}</p>
            <p class="text-gray-400 text-sm font-mono">{{ store.orgSlug }}</p>
          </div>
        </div>
      </div>

      <!-- Account section -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <p class="px-5 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tài khoản</p>
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-red-50 transition-colors border-t border-gray-100"
        >
          <div class="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </div>
          <span class="font-semibold text-red-600 text-base">Đăng xuất</span>
          <svg class="w-4 h-4 text-gray-300 ml-auto" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <!-- Org section -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <p class="px-5 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tổ chức</p>
        <button
          @click="handleChangeOrg"
          class="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors border-t border-gray-100"
        >
          <div class="w-9 h-9 rounded-xl bg-leaf-50 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-leaf-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          <span class="font-semibold text-gray-700 text-base">Đổi tổ chức</span>
          <svg class="w-4 h-4 text-gray-300 ml-auto" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <!-- App version -->
      <p class="text-center text-xs text-gray-400 pt-2">Hasagi Study v1.0</p>
    </div>
  </div>
</template>

<script setup>
import { useStudyStore } from '~/composables/useStudyStore'

const store = useStudyStore()

const handleLogout = () => {
  store.clearSession()
  navigateTo('/login')
}

const handleChangeOrg = () => {
  store.clearAll()
  navigateTo('/connect')
}
</script>
