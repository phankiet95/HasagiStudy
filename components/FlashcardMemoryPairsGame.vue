<template>
  <div class="memory-bg min-h-[100dvh] text-slate-700">
    <div class="max-w-3xl mx-auto px-3 py-3 pb-8">

      <!-- Stat bar -->
      <div class="bg-white/90 backdrop-blur rounded-3xl px-3 py-3 shadow-lg border-2 border-white mb-3">
        <div class="flex items-center gap-2 mb-2.5">
          <button @click="emit('exit')"
            class="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button @click="start"
            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-white text-xs font-bold shadow active:scale-95 transition-transform flex-shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Chơi lại
          </button>
          <select v-model.number="pairsPerRound" @change="start"
            class="ml-auto px-2.5 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300">
            <option v-for="size in roundSizeOptions" :key="size" :value="size">{{ size }} cặp</option>
          </select>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div class="px-2 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <p class="text-[10px] text-emerald-500 font-semibold leading-none">Đã tìm</p>
            <p class="text-base font-extrabold text-emerald-600 leading-tight">{{ matchedCount }}/{{ roundPairs.length }}</p>
          </div>
          <div class="px-2 py-1.5 rounded-xl bg-sky-50 border border-sky-100 text-center">
            <p class="text-[10px] text-sky-400 font-semibold leading-none">Lượt lật</p>
            <p class="text-base font-extrabold text-sky-600 leading-tight">{{ flips }}</p>
          </div>
          <div class="px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <p class="text-[10px] text-slate-400 font-semibold leading-none">Thời gian</p>
            <p class="text-base font-extrabold text-slate-600 leading-tight">{{ formattedTime }}</p>
          </div>
        </div>

        <p class="mt-2 text-center text-[11px] font-semibold text-slate-400 truncate">{{ projectName }}</p>
      </div>

      <!-- Board -->
      <div class="grid gap-2 grid-cols-3 sm:grid-cols-4">
        <button v-for="tile in tiles" :key="tile.key" @click="flip(tile)" :disabled="tile.matched"
          class="tile-slot relative min-h-[104px] rounded-2xl">
          <div :class="['tile-inner rounded-2xl', isFaceUp(tile) ? 'is-flipped' : '']">
            <!-- Back (hidden side) -->
            <div class="tile-face rounded-2xl bg-gradient-to-br from-leaf-400 to-leaf-600 border-2 border-white shadow-md flex items-center justify-center">
              <span class="text-3xl opacity-80">🧠</span>
            </div>

            <!-- Front (revealed side) -->
            <div :class="[
              'tile-face tile-face-front rounded-2xl border-2 shadow-md p-2 flex flex-col items-center justify-center text-center overflow-hidden',
              tile.matched ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
            ]">
              <img v-if="tile.media && tile.media.type === 'image'" :src="tile.media.url" alt=""
                class="h-10 w-full object-contain rounded-lg" />
              <span v-if="tile.text" :class="[
                'clamp-4 text-[11px] sm:text-xs font-semibold break-words leading-snug',
                tile.side === 'term' ? 'text-leaf-700' : 'text-slate-600'
              ]">
                {{ tile.text }}
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Result -->
    <div v-if="phase === 'finished'" class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div class="text-5xl mb-2">🎉</div>
        <h2 class="text-xl font-extrabold text-slate-800">Xong rồi!</h2>
        <p class="text-slate-500 text-sm mt-1">
          {{ roundPairs.length }} cặp · {{ flips }} lượt lật · {{ formattedTime }}
        </p>
        <div class="mt-5 flex flex-col gap-2.5">
          <button @click="start"
            class="w-full px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-white font-extrabold rounded-2xl shadow-lg active:scale-95 transition-transform">
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
 * Face-down pair hunt: every card becomes two hidden tiles (term and meaning) and the
 * player turns two at a time. Unlike the matching board, nothing is visible up front, so
 * this drills recall plus position memory.
 */
const props = defineProps({
  /** { id, term, definition, media } — a meaning plus a term or media to show. */
  cards: { type: Array, required: true },
  projectName: { type: String, default: '' },
})

const emit = defineEmits(['exit'])

// Six pairs is twelve tiles — about as much as fits a phone screen without scrolling
const DEFAULT_PAIRS = 6
const PAIR_CHOICES = [4, 6, 8, 10, 12]

// phase: 'playing' | 'finished'
const phase = ref('playing')
const pairsPerRound = ref(DEFAULT_PAIRS)
const roundPairs = ref([])
const tiles = ref([])
/** Keys of the tiles currently face up by choice, at most two. */
const openKeys = ref([])
const matchedCount = ref(0)
const flips = ref(0)
const elapsedSeconds = ref(0)
const boardLocked = ref(false)

let tickInterval = null
let closeTimeout = null

const roundSizeOptions = computed(() => {
  const options = PAIR_CHOICES.filter((size) => size <= props.cards.length)
  // A small set still needs one option: itself
  return options.length ? options : [props.cards.length]
})

const formattedTime = computed(() => {
  const minutes = Math.floor(elapsedSeconds.value / 60)
  const seconds = elapsedSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const isFaceUp = (tile) => tile.matched || openKeys.value.includes(tile.key)

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const clearTimers = () => {
  if (tickInterval) {
    clearInterval(tickInterval)
    tickInterval = null
  }
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }
}

const start = () => {
  clearTimers()

  const size = Math.min(pairsPerRound.value || DEFAULT_PAIRS, props.cards.length)
  roundPairs.value = shuffleArray(props.cards).slice(0, size)

  const built = []
  roundPairs.value.forEach((card) => {
    // Media rides on the term tile — that side is the prompt
    built.push({ key: `term-${card.id}`, pairId: card.id, side: 'term', text: card.term, media: card.media, matched: false })
    built.push({ key: `def-${card.id}`, pairId: card.id, side: 'definition', text: card.definition, media: null, matched: false })
  })

  tiles.value = shuffleArray(built)
  openKeys.value = []
  matchedCount.value = 0
  flips.value = 0
  elapsedSeconds.value = 0
  boardLocked.value = false
  phase.value = 'playing'

  tickInterval = setInterval(() => {
    elapsedSeconds.value++
  }, 1000)
}

const flip = (tile) => {
  if (phase.value !== 'playing' || tile.matched || boardLocked.value) return
  if (openKeys.value.includes(tile.key)) return

  openKeys.value = [...openKeys.value, tile.key]
  if (openKeys.value.length < 2) return

  flips.value++

  const [firstKey, secondKey] = openKeys.value
  const first = tiles.value.find((item) => item.key === firstKey)
  const second = tiles.value.find((item) => item.key === secondKey)

  // The two sides of one card, never two terms or two meanings
  if (first && second && first.pairId === second.pairId && first.side !== second.side) {
    first.matched = true
    second.matched = true
    matchedCount.value++
    openKeys.value = []
    confetti({ particleCount: 24, spread: 50, scalar: 0.7, origin: { y: 0.75 } })

    if (matchedCount.value === roundPairs.value.length) {
      clearTimers()
      phase.value = 'finished'
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } })
    }
    return
  }

  // Both stay visible briefly so the player can memorise them before they turn back
  boardLocked.value = true
  closeTimeout = setTimeout(() => {
    openKeys.value = []
    boardLocked.value = false
    closeTimeout = null
  }, 900)
}

onMounted(() => {
  pairsPerRound.value = Math.min(DEFAULT_PAIRS, props.cards.length)
  start()
})

onUnmounted(() => {
  clearTimers()
  stopConfetti()
})
</script>

<style scoped>
.memory-bg {
  background:
    radial-gradient(circle at 12% 18%, rgba(167, 243, 208, 0.5), transparent 45%),
    radial-gradient(circle at 88% 15%, rgba(191, 219, 254, 0.45), transparent 45%),
    linear-gradient(165deg, #f4fffa 0%, #f2fbff 55%, #f7fff8 100%);
}

/* The two faces share one slot and rotate together, so a tile turns rather than swaps */
.tile-slot {
  perspective: 900px;
}

.tile-inner {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transition: transform 0.4s ease;
}

.tile-inner.is-flipped {
  transform: rotateY(180deg);
}

.tile-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.tile-face-front {
  transform: rotateY(180deg);
}

.clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
