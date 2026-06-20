<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- Org header -->
    <div class="bg-white border-b border-gray-200 px-5 py-4 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl overflow-hidden bg-indigo-50 border border-indigo-100 flex-shrink-0 flex items-center justify-center">
        <img v-if="store.orgLogo" :src="store.orgLogo" class="w-full h-full object-contain" />
        <span v-else class="text-lg font-black text-indigo-400">{{ store.orgName?.[0]?.toUpperCase() }}</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs text-gray-500">Đăng nhập vào</p>
        <p class="font-semibold text-gray-900 truncate">{{ store.orgName }}</p>
      </div>
      <button
        @click="navigateTo('/connect')"
        class="text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50"
      >
        Đổi tổ chức
      </button>
    </div>

    <!-- Login form -->
    <div class="flex-1 flex items-center justify-center px-6 py-10">
      <div class="w-full max-w-sm">
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Đăng nhập</h1>
          <p class="text-gray-500 text-sm mt-1">Nhập tài khoản học viên của bạn</p>
        </div>

        <div class="space-y-4">
          <!-- Username -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Tên đăng nhập</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <input
                v-model="username"
                type="text"
                placeholder="username"
                @keyup.enter="$refs.pwdRef.focus()"
                class="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1.5">Mật khẩu</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <input
                ref="pwdRef"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                @keyup.enter="handleLogin"
                class="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
            <svg class="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>

          <!-- Submit -->
          <button
            @click="handleLogin"
            :disabled="loading || !username.trim() || !password"
            class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-base hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            <svg v-if="loading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'blank' })

import { useStudyStore } from '~/composables/useStudyStore'
import { useLmsStudent } from '~/composables/useLmsStudent'

const store = useStudyStore()
const { login } = useLmsStudent()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

onMounted(() => {
  if (!store.orgSlug) navigateTo('/connect')
})

const handleLogin = async () => {
  if (!username.value.trim() || !password.value) return
  loading.value = true
  error.value = ''
  try {
    const { sessionToken, student } = await login(store.orgSlug, username.value.trim(), password.value)
    store.setSession(sessionToken, student)
    navigateTo('/courses')
  } catch (err) {
    error.value = err?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng'
  }
  loading.value = false
}
</script>
