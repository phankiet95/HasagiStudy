<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger button -->
    <button
      @click="open = !open"
      class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/30 hover:bg-white/50 border border-white/30 text-sm font-semibold transition-all"
    >
      <span class="text-base leading-none">{{ current.flag }}</span>
      <span class="text-gray-700">{{ current.name }}</span>
      <svg
        class="w-3.5 h-3.5 text-gray-500 transition-transform duration-200"
        :class="open ? 'rotate-180' : ''"
        fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <div
        v-if="open"
        class="absolute bottom-full mb-2 left-0 min-w-[160px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-bottom-left"
      >
        <button
          v-for="loc in availableLocales"
          :key="loc.code"
          @click="select(loc.code)"
          class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left"
          :class="locale === loc.code
            ? 'bg-[#054743]/8 text-[#054743] font-semibold'
            : 'text-gray-700 hover:bg-gray-50 font-medium'"
        >
          <span class="text-base leading-none">{{ loc.flag }}</span>
          <span class="flex-1">{{ loc.name }}</span>
          <svg v-if="locale === loc.code" class="w-3.5 h-3.5 text-[#054743] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { useAppLocale, availableLocales } from '~/composables/useAppLocale'

const { locale, setLocale } = useAppLocale()
const containerRef = ref(null)
const open = ref(false)

const current = computed(() => availableLocales.find(l => l.code === locale.value) ?? availableLocales[0])

const select = (code) => {
  setLocale(code)
  open.value = false
}

const onClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside, true))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside, true))
</script>
