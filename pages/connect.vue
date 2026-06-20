<template>
  <div class="min-h-screen bg-gradient-to-br from-leaf-950 via-leaf-900 to-leaf-950 flex flex-col items-center justify-center px-6 py-12">

    <!-- Logo & Title -->
    <div class="flex flex-col items-center mb-10">
      <div class="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-xl">
        <span class="text-4xl font-black text-white">H</span>
      </div>
      <h1 class="text-3xl font-bold text-white">Hasagi Study</h1>
      <p class="text-leaf-200 text-base mt-1">Kết nối với tổ chức của bạn</p>
    </div>

    <!-- Input card -->
    <div class="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">

      <template v-if="!orgFound">
        <h2 class="text-lg font-bold text-gray-900 mb-1">Nhập slug tổ chức</h2>
        <p class="text-gray-500 text-sm mb-5">Nhập mã slug từ giáo viên hoặc admin của bạn</p>

        <div class="relative mb-4">
          <input
            v-model="slugInput"
            type="text"
            placeholder="vd: truong-abc"
            @keyup.enter="connectOrg"
            class="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent transition-all"
          />
        </div>

        <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>

        <button
          @click="connectOrg"
          :disabled="connecting || !slugInput.trim()"
          class="w-full py-3.5 bg-gradient-to-r from-leaf-500 to-leaf-600 text-white font-semibold rounded-xl text-base hover:from-leaf-700 hover:to-leaf-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg v-if="connecting" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ connecting ? 'Đang tìm kiếm...' : 'Kết nối' }}
        </button>

        <button
          class="w-full mt-3 py-3 border border-gray-200 text-gray-400 font-medium rounded-xl text-sm flex items-center justify-center gap-2 cursor-not-allowed"
          disabled
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
          </svg>
          Quét mã QR (sắp ra mắt)
        </button>
      </template>

      <!-- Org confirmation card -->
      <template v-else-if="orgData">
        <div class="flex flex-col items-center text-center mb-6">
          <div class="w-20 h-20 rounded-2xl overflow-hidden bg-leaf-50 border border-leaf-100 mb-3 flex items-center justify-center flex-shrink-0">
            <img v-if="orgLogo" :src="orgLogo" class="w-full h-full object-contain" />
            <span v-else class="text-3xl font-black text-leaf-400">{{ orgData.name?.[0]?.toUpperCase() }}</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900">{{ orgData.name }}</h3>
          <p v-if="orgData.description" class="text-gray-500 text-sm mt-1 line-clamp-2">{{ orgData.description }}</p>
          <span class="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-leaf-500 bg-leaf-50 px-3 py-1 rounded-full">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
            </svg>
            Đã xác nhận
          </span>
        </div>

        <button
          @click="confirmOrg"
          class="w-full py-3.5 bg-gradient-to-r from-leaf-500 to-leaf-600 text-white font-semibold rounded-xl text-base hover:from-leaf-700 hover:to-leaf-700 transition-all shadow-md mb-3"
        >
          Tiếp tục đăng nhập
        </button>
        <button
          @click="resetForm"
          class="w-full py-3 text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors"
        >
          Nhập slug khác
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'blank' })

import { useStudyStore } from '~/composables/useStudyStore'

const store = useStudyStore()
const $supabase = useSupabaseClient()

const slugInput = ref('')
const connecting = ref(false)
const error = ref('')
const orgFound = ref(false)
const orgData = ref(null)
const orgLogo = computed(() => orgData.value?.page_config?.header?.logo || orgData.value?.avatar_url || '')

const connectOrg = async () => {
  const slug = slugInput.value.trim().toLowerCase()
  if (!slug) return
  connecting.value = true
  error.value = ''
  try {
    const { data, error: supaErr } = await $supabase
      .from('lms_organizations')
      .select('id, name, avatar_url, description, page_config')
      .eq('slug', slug)
      .single()
    if (supaErr || !data) {
      error.value = 'Không tìm thấy tổ chức với slug này. Vui lòng kiểm tra lại.'
    } else {
      orgData.value = { ...data, slug }
      orgFound.value = true
    }
  } catch {
    error.value = 'Có lỗi xảy ra. Vui lòng thử lại.'
  }
  connecting.value = false
}

const confirmOrg = () => {
  store.setOrg(
    orgData.value.slug,
    orgData.value.name,
    orgLogo.value,
    orgData.value.description || '',
  )
  navigateTo('/login')
}

const resetForm = () => {
  orgFound.value = false
  orgData.value = null
  slugInput.value = ''
  error.value = ''
}
</script>
