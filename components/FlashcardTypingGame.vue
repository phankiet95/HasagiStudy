<template>
  <div class="typing-bg min-h-[100dvh] text-slate-700">
    <div class="max-w-2xl mx-auto px-3 py-3 pb-8">

      <!-- Stat bar -->
      <div class="bg-white/90 backdrop-blur rounded-3xl px-3 py-3 shadow-lg border-2 border-white mb-3">
        <div class="flex items-center gap-2 mb-2.5">
          <button @click="emit('exit')"
            class="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p class="text-xs font-semibold text-slate-400 truncate flex-1">{{ projectName }}</p>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div class="px-2 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
            <p class="text-[10px] text-indigo-400 font-semibold leading-none">Thẻ</p>
            <p class="text-base font-extrabold text-indigo-600 leading-tight">{{ Math.min(index + 1, order.length) }}/{{ order.length }}</p>
          </div>
          <div class="px-2 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <p class="text-[10px] text-emerald-500 font-semibold leading-none">Đúng</p>
            <p class="text-base font-extrabold text-emerald-600 leading-tight">{{ correctCount }}</p>
          </div>
          <div class="px-2 py-1.5 rounded-xl bg-rose-50 border border-rose-100 text-center">
            <p class="text-[10px] text-rose-400 font-semibold leading-none">Sai</p>
            <p class="text-base font-extrabold text-rose-500 leading-tight">{{ missed.length }}</p>
          </div>
        </div>

        <div class="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-sky-300 via-indigo-300 to-violet-300 rounded-full transition-all duration-500"
            :style="{ width: progressPercent + '%' }" />
        </div>
      </div>

      <!-- Prompt -->
      <div v-if="phase === 'playing' && current" class="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border-2 border-white">
        <p class="text-center text-[11px] font-bold uppercase tracking-wide text-indigo-400 mb-3">
          Đọc nghĩa và gõ lại từ
        </p>

        <div v-if="current.media" class="mb-3 flex justify-center">
          <img v-if="current.media.type === 'image'" :src="current.media.url" alt=""
            class="max-h-36 max-w-full object-contain rounded-2xl" />
          <video v-else-if="current.media.type === 'video'" :src="current.media.url"
            class="max-h-36 max-w-full object-contain rounded-2xl" controls playsinline preload="metadata" />
        </div>

        <p class="text-lg sm:text-xl font-bold text-center text-slate-800 break-words">
          {{ current.definition }}
        </p>

        <p v-if="hintShown" class="mt-3 text-center text-sm font-mono tracking-[0.3em] text-indigo-400 break-words">
          {{ hintText }}
        </p>

        <!-- Answer box -->
        <div class="mt-4">
          <input ref="answerInput" v-model="typed" :disabled="status !== 'typing'" type="text" autocomplete="off"
            autocapitalize="off" spellcheck="false" placeholder="Gõ từ ở đây..." :class="[
              'w-full px-4 py-3 text-base text-center font-semibold rounded-2xl border-2 focus:outline-none transition-colors',
              status === 'typing' ? 'bg-slate-50 border-slate-200 focus:border-indigo-400 text-slate-800' : '',
              status === 'correct' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : '',
              status === 'wrong' ? 'bg-rose-50 border-rose-300 text-rose-600' : ''
            ]" @keyup.enter="onEnter" />

          <!-- Verdict -->
          <div v-if="status === 'correct'" class="mt-3 text-center text-emerald-600 font-bold">
            🎉 Chính xác!
          </div>
          <div v-else-if="status === 'wrong'" class="mt-3 text-center">
            <p class="text-rose-500 text-sm font-semibold">Đáp án đúng là</p>
            <p class="text-lg font-extrabold text-slate-800 break-words">{{ current.term }}</p>
            <button v-if="!overridden" @click="countAsCorrect"
              class="mt-1.5 text-xs font-semibold text-slate-400 underline">
              Tôi gõ đúng rồi
            </button>
          </div>

          <div class="mt-4 flex flex-col gap-2">
            <button v-if="status === 'typing'" @click="check"
              class="w-full px-6 py-3 bg-gradient-to-r from-sky-400 to-indigo-400 text-white font-extrabold rounded-2xl shadow-lg active:scale-95 transition-transform">
              Kiểm tra
            </button>
            <button v-else @click="next"
              class="w-full px-6 py-3 bg-gradient-to-r from-sky-400 to-indigo-400 text-white font-extrabold rounded-2xl shadow-lg active:scale-95 transition-transform">
              {{ index < order.length - 1 ? 'Thẻ tiếp theo' : 'Xem kết quả' }}
            </button>
            <div v-if="status === 'typing'" class="grid grid-cols-2 gap-2">
              <button @click="hintShown = true" :disabled="hintShown"
                class="px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-2xl disabled:opacity-40">
                Gợi ý
              </button>
              <button @click="giveUp"
                class="px-4 py-2.5 bg-slate-100 text-slate-600 text-sm font-bold rounded-2xl">
                Bỏ qua
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Result -->
      <div v-else-if="phase === 'finished'" class="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-white text-center">
        <div class="text-5xl mb-2">{{ missed.length === 0 ? '🏆' : '📚' }}</div>
        <h2 class="text-xl font-extrabold text-slate-800">
          {{ missed.length === 0 ? 'Hoàn hảo!' : 'Xong rồi!' }}
        </h2>
        <p class="text-slate-500 text-sm mt-1">Đúng {{ correctCount }}/{{ order.length }} thẻ</p>
        <p class="text-4xl font-extrabold text-indigo-500 mt-2">{{ accuracy }}%</p>

        <!-- What to review -->
        <div v-if="missed.length" class="mt-4 text-left">
          <p class="text-sm font-bold text-slate-600 mb-2">Cần ôn lại</p>
          <ul class="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            <li v-for="card in missed" :key="card.id" class="bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
              <p class="font-bold text-slate-800 text-sm break-words">{{ card.term }}</p>
              <p class="text-xs text-slate-500 break-words">{{ card.definition }}</p>
            </li>
          </ul>
        </div>

        <div class="mt-5 flex flex-col gap-2.5">
          <button @click="start"
            class="w-full px-6 py-3 bg-gradient-to-r from-sky-400 to-indigo-400 text-white font-extrabold rounded-2xl shadow-lg active:scale-95 transition-transform">
            Chơi lại
          </button>
          <button v-if="missed.length" @click="retryMissed"
            class="w-full px-6 py-3 bg-rose-100 text-rose-600 font-bold rounded-2xl">
            Ôn lại thẻ sai
          </button>
          <button @click="emit('exit')"
            class="w-full px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl">
            Thoát
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { confetti, stopConfetti } from '~/composables/useConfetti'

/**
 * Type-the-term practice: the meaning (and any media) is the prompt, the term is the answer.
 * Cards without a term can't be typed, so the caller filters those out.
 */
const props = defineProps({
  /** { id, term, definition, media } — term and definition both required. */
  cards: { type: Array, required: true },
  projectName: { type: String, default: '' },
})

const emit = defineEmits(['exit'])

// phase: 'playing' | 'finished'
const phase = ref('playing')
const order = ref([])
const index = ref(0)
const typed = ref('')
// status: 'typing' | 'correct' | 'wrong'
const status = ref('typing')
const hintShown = ref(false)
const overridden = ref(false)
const correctCount = ref(0)
/** Cards answered wrong — offered for a focused retry at the end. */
const missed = ref([])
const answerInput = ref(null)

const current = computed(() => order.value[index.value] || null)

const progressPercent = computed(() => {
  if (order.value.length === 0) return 0
  return Math.round((index.value / order.value.length) * 100)
})

const accuracy = computed(() => {
  if (order.value.length === 0) return 0
  return Math.round((correctCount.value / order.value.length) * 100)
})

// First letter plus one dash per remaining character — enough to jog the memory
const hintText = computed(() => {
  const term = current.value?.term || ''
  if (!term) return ''
  return term.charAt(0) + ' ' + '_ '.repeat(Math.max(0, term.length - 1)).trim()
})

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Typing shouldn't be graded on spacing or capitals
const normalize = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

const focusInput = () => {
  nextTick(() => answerInput.value?.focus())
}

const beginRound = (cards) => {
  order.value = cards
  index.value = 0
  typed.value = ''
  status.value = 'typing'
  hintShown.value = false
  overridden.value = false
  correctCount.value = 0
  missed.value = []
  phase.value = 'playing'
  focusInput()
}

const start = () => beginRound(shuffleArray(props.cards))

const retryMissed = () => beginRound(shuffleArray(missed.value))

const check = () => {
  if (status.value !== 'typing' || !current.value) return

  if (normalize(typed.value) === normalize(current.value.term)) {
    status.value = 'correct'
    correctCount.value++
    confetti({ particleCount: 24, spread: 50, scalar: 0.7, origin: { y: 0.7 } })
    return
  }

  status.value = 'wrong'
  missed.value = [...missed.value, current.value]
}

// Accents and near-misses are the learner's judgement, not the game's
const countAsCorrect = () => {
  if (status.value !== 'wrong' || overridden.value) return
  overridden.value = true
  correctCount.value++
  missed.value = missed.value.filter((card) => card.id !== current.value?.id)
}

const giveUp = () => {
  if (status.value !== 'typing') return
  status.value = 'wrong'
  missed.value = [...missed.value, current.value]
}

const next = () => {
  if (index.value >= order.value.length - 1) {
    phase.value = 'finished'
    if (missed.value.length === 0) {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } })
    }
    return
  }

  index.value++
  typed.value = ''
  status.value = 'typing'
  hintShown.value = false
  overridden.value = false
  focusInput()
}

const onEnter = () => {
  if (status.value === 'typing') {
    check()
  } else {
    next()
  }
}

onMounted(start)

onUnmounted(stopConfetti)
</script>

<style scoped>
.typing-bg {
  background:
    radial-gradient(circle at 15% 15%, rgba(191, 219, 254, 0.55), transparent 45%),
    radial-gradient(circle at 85% 20%, rgba(221, 214, 254, 0.5), transparent 45%),
    linear-gradient(165deg, #f5f9ff 0%, #f7f5ff 55%, #f4fbff 100%);
}
</style>
