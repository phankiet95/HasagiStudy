<template>
  <div class="min-h-screen green-background  flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">

    <!-- Background blobs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-48 -left-48 w-96 h-96 bg-leaf-500/15 rounded-full blur-3xl" />
      <div class="absolute -bottom-48 -right-48 w-[28rem] h-[28rem] bg-leaf-500/15 rounded-full blur-3xl" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-leaf-800/10 rounded-full blur-3xl" />
    </div>

    <div class="w-full max-w-sm relative z-10">

      <!-- Org identity block -->
      <div class="flex flex-col items-center mb-7">
        <!-- Logo -->
        <div class="relative mb-4">
          <div class="w-24 h-24 rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl flex items-center justify-center">
            <img v-if="store.orgLogo" :src="store.orgLogo" class="w-full h-full object-contain p-1.5" />
            <span v-else class="text-4xl font-black text-white tracking-tight">
              {{ store.orgName?.[0]?.toUpperCase() }}
            </span>
          </div>
        </div>

        <p class="green-primary text-[11px] font-semibold tracking-[0.18em] uppercase mb-1">Học viên</p>
        <h2 class="green-primary font-bold text-2xl text-center leading-snug">{{ store.orgName }}</h2>
      </div>

      <!-- Login card -->
      <div class="bg-white rounded-3xl shadow-s shadow-black/40 overflow-hidden">
        <!-- Card top accent -->
        <div class="h-1 bg-gradient-to-r from-leaf-500 via-leaf-500 to-leaf-800" />

        <div class="p-7">
          <h1 class="text-lg font-bold text-gray-900 mb-0.5">Đăng nhập</h1>
          <p class="text-gray-400 text-sm mb-6">Nhập tài khoản học viên của bạn</p>

          <div class="space-y-4">
            <!-- Username -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tên đăng nhập</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <input
                  v-model="username"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  autocomplete="username"
                  @keyup.enter="$refs.pwdRef.focus()"
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500/40 focus:border-leaf-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mật khẩu</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  ref="pwdRef"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  @keyup.enter="handleLogin"
                  class="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500/40 focus:border-leaf-400 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg v-if="!showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Error message -->
            <Transition
              enter-from-class="opacity-0 -translate-y-1"
              enter-active-class="transition-all duration-200"
              leave-to-class="opacity-0 -translate-y-1"
              leave-active-class="transition-all duration-150"
            >
              <div v-if="error" class="flex items-start gap-2.5 px-3.5 py-3 bg-red-50 border border-red-100 rounded-xl">
                <svg class="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p class="text-red-600 text-sm leading-snug">{{ error }}</p>
              </div>
            </Transition>

            <!-- Submit -->
            <button
              @click="handleLogin"
              :disabled="loading || !username.trim() || !password"
              class="w-full py-3.5 dark-green-button font-semibold rounded-xl text-sm hover:from-leaf-700 hover:to-leaf-700 active:scale-[0.98] transition-all shadow-lg shadow-leaf-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 mt-1"
            >
              <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Change org -->
      <div class="flex items-center justify-center mt-6 gap-1.5">
        <span class="green-primary text-sm">Không phải tổ chức của bạn?</span>
        <button
          @click="navigateTo('/connect')"
          class="text-leaf-300 hover:text-white text-sm font-semibold transition-colors"
        >
          Đổi tổ chức
        </button>
      </div>

      <!-- Branding -->
      <p class="text-center green-primary text-[10px] mt-8 tracking-wider">Powered by HasagiAI</p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'blank' })
useHead({ meta: [{ name: 'theme-color', content: '#cdeacd' }] })

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
    error.value = err?.data?.statusMessage || err?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng'
  }
  loading.value = false
}
</script>
