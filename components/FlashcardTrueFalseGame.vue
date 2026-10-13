<template>
  <div class="truefalse-bg min-h-[100dvh] text-slate-700">
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
          <div class="px-2 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-center">
            <p class="text-[10px] text-amber-500 font-semibold leading-none">Thẻ</p>
            <p class="text-base font-extrabold text-amber-600 leading-tight">{{ Math.min(index + 1, rounds.length) }}/{{ rounds.length }}</p>
          </div>
          <div class="px-2 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <p class="text-[10px] text-emerald-500 font-semibold leading-none">Đúng</p>
            <p class="text-base font-extrabold text-emerald-600 leading-tight">{{ correctCount }}</p>
          </div>
          <div class="px-2 py-1.5 rounded-xl bg-orange-50 border border-orange-100 text-center">
            <p class="text-[10px] text-orange-400 font-semibold leading-none">Chuỗi</p>
            <p class="text-base font-extrabold text-orange-500 leading-tight">🔥 {{ streak }}</p>
          </div>
        </div>

        <div class="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-amber-300 to-orange-300 rounded-full transition-all duration-500"
            :style="{ width: progressPercent + '%' }" />
        </div>
      </div>

      <!-- Round -->
      <div v-if="phase === 'playing' && current">
        <div :class="[
          'bg-white rounded-3xl p-4 sm:p-6 shadow-xl border-4 transition-colors duration-200',
          verdict === 'right' ? 'border-emerald-300' : verdict === 'wrong' ? 'border-rose-300' : 'border-white'
        ]">
          <p class="text-center text-[11px] font-bold uppercase tracking-wide text-amber-500 mb-3">
            Cặp từ - nghĩa này có khớp không?
          </p>

          <div v-if="current.card.media" class="mb-3 flex justify-center">
            <img v-if="current.card.media.type === 'image'" :src="current.card.media.url" alt="" :class="[
              'max-w-full object-contain rounded-2xl',
              current.card.term ? 'max-h-32' : 'max-h-48'
            ]" />
            <video v-else-if="current.card.media.type === 'video'" :src="current.card.media.url" :class="[
              'max-w-full object-contain rounded-2xl',
              current.card.term ? 'max-h-32' : 'max-h-48'
            ]" controls playsinline preload="metadata" />
          </div>

          <!-- An image-only card carries the prompt in its media, with no term to show -->
          <p v-if="current.card.term" class="text-xl sm:text-2xl font-extrabold text-center text-slate-800 break-words">
            {{ current.card.term }}
          </p>

          <div class="my-3 flex items-center gap-3">
            <span class="flex-1 h-px bg-slate-200" />
            <span class="text-slate-300 text-lg">≟</span>
            <span class="flex-1 h-px bg-slate-200" />
          </div>

          <p class="text-base sm:text-lg font-semibold text-center text-slate-600 break-words">
            {{ current.shownDefinition }}
          </p>

          <!-- Verdict banner -->
          <div v-if="verdict" class="mt-4 text-center">
            <p v-if="verdict === 'right'" class="text-emerald-600 font-extrabold">✓ Chính xác!</p>
            <template v-else>
              <p class="text-rose-500 font-extrabold">✗ Chưa đúng</p>
              <p class="text-xs text-slate-500 mt-1">Nghĩa thật là</p>
              <p class="font-bold text-slate-800 text-sm break-words">{{ current.card.definition }}</p>
            </template>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 mt-3">
          <button @click="answer(true)" :disabled="verdict !== null"
            class="px-4 py-5 bg-gradient-to-br from-emerald-400 to-teal-400 text-white text-lg font-extrabold rounded-3xl shadow-lg active:scale-95 transition-transform disabled:opacity-50">
            ✓ Khớp
          </button>
          <button @click="answer(false)" :disabled="verdict !== null"
            class="px-4 py-5 bg-gradient-to-br from-rose-400 to-red-400 text-white text-lg font-extrabold rounded-3xl shadow-lg active:scale-95 transition-transform disabled:opacity-50">
            ✗ Không khớp
          </button>
        </div>
      </div>

      <!-- Result -->
      <div v-else-if="phase === 'finished'" class="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-white text-center">
        <div class="text-5xl mb-2">{{ correctCount === rounds.length ? '🏆' : '🎯' }}</div>
        <h2 class="text-xl font-extrabold text-slate-800">
          {{ correctCount === rounds.length ? 'Hoàn hảo!' : 'Xong rồi!' }}
        </h2>
        <p class="text-slate-500 text-sm mt-1">Đúng {{ correctCount }}/{{ rounds.length }} thẻ</p>
        <p class="text-4xl font-extrabold text-amber-500 mt-2">{{ accuracy }}%</p>
        <p class="text-xs text-slate-400 mt-1">Chuỗi đúng dài nhất: {{ bestStreak }}</p>

        <div class="mt-5 flex flex-col gap-2.5">
          <button @click="start"
            class="w-full px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white font-extrabold rounded-2xl shadow-lg active:scale-95 transition-transform">
            Chơi lại
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { confetti, stopConfetti } from '~/composables/useConfetti'

/**
 * True/false drill: each round shows a term with a meaning that is either its own or
 * another card's, and the player judges the pairing. Faster than multiple choice and it
 * rewards recognising a wrong answer, which picking from a list never asks for.
 */
const props = defineProps({
  /** { id, term, definition, media } — a meaning plus a term or media to judge it against. */
  cards: { type: Array, required: true },
  projectName: { type: String, default: '' },
})

const emit = defineEmits(['exit'])

// phase: 'playing' | 'finished'
const phase = ref('playing')
const rounds = ref([])
const index = ref(0)
// verdict: null while the player decides, then 'right' | 'wrong'
const verdict = ref(null)
const correctCount = ref(0)
const streak = ref(0)
const bestStreak = ref(0)

let advanceTimeout = null

const current = computed(() => rounds.value[index.value] || null)

const progressPercent = computed(() => {
  if (rounds.value.length === 0) return 0
  return Math.round((index.value / rounds.value.length) * 100)
})

const accuracy = computed(() => {
  if (rounds.value.length === 0) return 0
  return Math.round((correctCount.value / rounds.value.length) * 100)
})

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Half the rounds show the card's own meaning, half borrow another card's. The decoy has
 * to differ in text, otherwise a "false" pairing would actually be true.
 */
const buildRounds = () => {
  const cards = shuffleArray(props.cards)
  return cards.map((card) => {
    const decoys = props.cards.filter((other) => other.definition !== card.definition)
    const useOwn = decoys.length === 0 || Math.random() < 0.5

    if (useOwn) {
      return { card, shownDefinition: card.definition, isMatch: true }
    }

    const decoy = decoys[Math.floor(Math.random() * decoys.length)]
    return { card, shownDefinition: decoy.definition, isMatch: false }
  })
}

const clearAdvance = () => {
  if (advanceTimeout) {
    clearTimeout(advanceTimeout)
    advanceTimeout = null
  }
}

const start = () => {
  clearAdvance()
  rounds.value = buildRounds()
  index.value = 0
  verdict.value = null
  correctCount.value = 0
  streak.value = 0
  bestStreak.value = 0
  phase.value = 'playing'
}

const next = () => {
  clearAdvance()

  if (index.value >= rounds.value.length - 1) {
    phase.value = 'finished'
    if (correctCount.value === rounds.value.length) {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } })
    }
    return
  }

  index.value++
  verdict.value = null
}

const answer = (saidMatch) => {
  if (verdict.value !== null || !current.value) return

  const right = saidMatch === current.value.isMatch
  verdict.value = right ? 'right' : 'wrong'

  if (right) {
    correctCount.value++
    streak.value++
    bestStreak.value = Math.max(bestStreak.value, streak.value)
    confetti({ particleCount: 20, spread: 45, scalar: 0.6, origin: { y: 0.7 } })
  } else {
    streak.value = 0
  }

  // A miss stays on screen longer, because that is when the real meaning is worth reading
  advanceTimeout = setTimeout(next, right ? 700 : 1800)
}

onMounted(start)

onUnmounted(() => {
  clearAdvance()
  stopConfetti()
})
</script>

<style scoped>
.truefalse-bg {
  background:
    radial-gradient(circle at 12% 18%, rgba(254, 215, 170, 0.55), transparent 45%),
    radial-gradient(circle at 88% 15%, rgba(253, 230, 138, 0.5), transparent 45%),
    linear-gradient(165deg, #fffaf3 0%, #fff8ef 55%, #fffdf5 100%);
}
</style>
