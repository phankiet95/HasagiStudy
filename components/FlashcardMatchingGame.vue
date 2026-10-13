<template>
  <div class="matching-bg min-h-[100dvh] text-slate-700 relative overflow-hidden">
    <!-- Floating decorations -->
    <div class="pointer-events-none select-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <span class="deco deco-1">🎈</span>
      <span class="deco deco-2">✨</span>
      <span class="deco deco-3">🍬</span>
      <span class="deco deco-4">🌸</span>
    </div>

    <div class="relative z-10 px-3 py-3 pb-8">
      <div class="max-w-4xl mx-auto">

        <!-- Stat bar -->
        <div class="bg-white/90 backdrop-blur rounded-3xl px-3 py-3 shadow-lg border-2 border-white mb-3">
          <div class="flex items-center gap-2 mb-2.5">
            <button @click="emit('exit')"
              class="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button @click="startRound"
              class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-400 to-fuchsia-400 text-white text-xs font-bold shadow active:scale-95 transition-transform flex-shrink-0">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Chơi lại
            </button>
            <select v-model.number="pairsPerRound" @change="changeRoundSize"
              class="ml-auto px-2.5 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-300">
              <option v-for="option in roundSizeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <div class="px-2 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <p class="text-[10px] text-emerald-500 font-semibold leading-none">Đã ghép</p>
              <p class="text-base font-extrabold text-emerald-600 leading-tight">{{ matchedCount }}/{{ roundPairs.length }}</p>
            </div>
            <div class="px-2 py-1.5 rounded-xl bg-rose-50 border border-rose-100 text-center">
              <p class="text-[10px] text-rose-400 font-semibold leading-none">Sai</p>
              <p class="text-base font-extrabold text-rose-500 leading-tight">{{ mistakes }}</p>
            </div>
            <div class="px-2 py-1.5 rounded-xl bg-sky-50 border border-sky-100 text-center">
              <p class="text-[10px] text-sky-400 font-semibold leading-none">Thời gian</p>
              <p class="text-base font-extrabold text-sky-600 leading-tight">{{ formattedTime }}</p>
            </div>
          </div>

          <p class="mt-2 text-center text-[11px] font-semibold text-slate-400 truncate">{{ projectName }}</p>
          <div class="mt-1.5 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-rose-300 via-fuchsia-300 to-sky-300 rounded-full transition-all duration-500"
              :style="{ width: progressPercent + '%' }" />
          </div>
        </div>

        <!-- Tiles -->
        <div class="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <button v-for="tile in tiles" :key="tile.key" @click="selectTile(tile)"
            :disabled="tile.matched || phase === 'finished'" :class="[
              'tile relative flex flex-col items-center justify-center gap-1.5 p-3 min-h-[112px] rounded-2xl border-2 text-center shadow-sm transition-all duration-300',
              tile.matched ? 'tile-matched' : 'active:scale-95',
              tile.side === 'term'
                ? 'bg-gradient-to-br from-rose-100 to-amber-50 border-rose-200'
                : 'bg-white border-sky-100',
              isSelected(tile) ? 'ring-4 ring-violet-400 border-violet-400 scale-[1.02]' : '',
              isWrong(tile) ? 'tile-wrong ring-4 ring-red-200 border-red-300' : ''
            ]">
            <span :class="['absolute top-1.5 left-2 text-xs', tile.side === 'term' ? 'text-rose-300' : 'text-sky-300']">
              {{ tile.side === 'term' ? '🌸' : '💡' }}
            </span>

            <img v-if="tile.media && tile.media.type === 'image'" :src="tile.media.url" alt=""
              class="h-14 w-full object-contain rounded-lg" />
            <video v-else-if="tile.media && tile.media.type === 'video'" :src="tile.media.url"
              class="h-14 w-full object-contain rounded-lg" muted playsinline preload="metadata" />

            <span v-if="tile.text" class="clamp-4 text-sm font-semibold text-slate-700 break-words leading-snug">
              {{ tile.text }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Result -->
    <div v-if="phase === 'finished'" class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
        <div class="text-5xl mb-2">{{ mistakes === 0 ? '🏆' : '🎉' }}</div>
        <h2 class="text-xl font-extrabold text-slate-800 mb-1">
          {{ mistakes === 0 ? 'Hoàn hảo!' : 'Xong rồi!' }}
        </h2>
        <p class="text-slate-500 text-sm mb-3">
          Ghép xong {{ roundPairs.length }} cặp trong {{ formattedTime }}
        </p>
        <div class="text-xl mb-3">
          <span v-for="star in 3" :key="star" :class="star <= stars ? '' : 'opacity-25'">⭐</span>
        </div>
        <p class="text-sm font-semibold mb-5" :class="mistakes === 0 ? 'text-emerald-500' : 'text-rose-400'">
          {{ mistakes === 0 ? 'Không sai lần nào!' : `Sai ${mistakes} lần` }}
        </p>

        <div class="flex flex-col gap-2.5">
          <button @click="startRound"
            class="w-full px-6 py-3 bg-gradient-to-r from-rose-400 via-fuchsia-400 to-sky-400 text-white font-extrabold rounded-2xl shadow-lg active:scale-95 transition-transform">
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
 * The matching board on its own: deals rounds, scores them, and reports nothing back but
 * the player asking to leave. Whoever mounts it owns the cards and the page chrome.
 */
const props = defineProps({
  /** Usable cards: { id, term, definition, media } — the caller drops unplayable ones. */
  pairs: { type: Array, required: true },
  /** Shown under the stat bar so the player knows which set they are matching. */
  projectName: { type: String, default: '' },
})

const emit = defineEmits(['exit'])

// phase: 'playing' | 'finished' — a round is dealt on mount, so there is no lobby
const phase = ref('playing')
/** The cards dealt into the current round — at most `pairsPerRound` of them. */
const roundPairs = ref([])
/** Cards not dealt yet; each round draws from here so a replay brings new cards. */
const undealtPairs = ref([])
/** How many pairs a round deals — chosen in the stat bar. */
const pairsPerRound = ref(0)
/** Two tiles per round card — one for the term side, one for the meaning side. */
const tiles = ref([])
/** Keys of the tiles currently picked, at most two. */
const selectedKeys = ref([])
/** The mismatched pair being shown before it clears — drives the shake, nothing else. */
const wrongKeys = ref([])
const matchedCount = ref(0)
const mistakes = ref(0)
const elapsedSeconds = ref(0)
const boardLocked = ref(false)

let tickInterval = null
let wrongTimeout = null

// A whole set on one board is unplayable on a phone, so a round deals a slice of it
const DEFAULT_PAIRS_PER_ROUND = 6
const ROUND_SIZE_CHOICES = [4, 6, 8, 10, 12, 16, 20]

// Only sizes the set can actually fill, plus the set itself as the "all" choice
const roundSizeOptions = computed(() => {
  const options = ROUND_SIZE_CHOICES
    .filter((size) => size < props.pairs.length)
    .map((size) => ({ value: size, label: `${size} cặp` }))
  options.push({ value: props.pairs.length, label: `Tất cả (${props.pairs.length})` })
  return options
})

const progressPercent = computed(() => {
  if (roundPairs.value.length === 0) return 0
  return Math.round((matchedCount.value / roundPairs.value.length) * 100)
})

const formattedTime = computed(() => {
  const minutes = Math.floor(elapsedSeconds.value / 60)
  const seconds = elapsedSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const stars = computed(() => {
  if (mistakes.value === 0) return 3
  if (mistakes.value <= Math.ceil(roundPairs.value.length / 2)) return 2
  return 1
})

const isSelected = (tile) => selectedKeys.value.includes(tile.key)
const isWrong = (tile) => wrongKeys.value.includes(tile.key)

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Deals the next round. Cards are drawn from the undealt pile so replaying works
 * through the rest of the set first; once fewer than two are left the whole set is
 * reshuffled and the cycle starts over.
 */
const dealNextRound = () => {
  if (undealtPairs.value.length < 2) {
    undealtPairs.value = shuffleArray(props.pairs)
  }

  roundPairs.value = undealtPairs.value.slice(0, pairsPerRound.value || DEFAULT_PAIRS_PER_ROUND)
  undealtPairs.value = undealtPairs.value.slice(roundPairs.value.length)

  const built = []
  roundPairs.value.forEach((card) => {
    // Media rides on the term side only — that side is the prompt
    built.push({ key: `term-${card.id}`, pairId: card.id, side: 'term', text: card.term, media: card.media, matched: false })
    built.push({ key: `def-${card.id}`, pairId: card.id, side: 'definition', text: card.definition, media: null, matched: false })
  })
  tiles.value = shuffleArray(built)
}

const clearTimers = () => {
  if (tickInterval) {
    clearInterval(tickInterval)
    tickInterval = null
  }
  if (wrongTimeout) {
    clearTimeout(wrongTimeout)
    wrongTimeout = null
  }
}

const startRound = () => {
  clearTimers()
  dealNextRound()
  selectedKeys.value = []
  wrongKeys.value = []
  matchedCount.value = 0
  mistakes.value = 0
  elapsedSeconds.value = 0
  boardLocked.value = false
  phase.value = 'playing'

  tickInterval = setInterval(() => {
    elapsedSeconds.value++
  }, 1000)
}

// A new size only makes sense on a fresh pile, otherwise the leftovers would cap the round short
const changeRoundSize = () => {
  undealtPairs.value = []
  startRound()
}

/**
 * A pair is the two sides of one card — two terms or two meanings never match.
 * Two cards can carry the very same meaning text though, and reading it correctly
 * shouldn't count as a miss just because the twin tile was tapped, so identical
 * meaning text is accepted too (its twin stays matchable by the same rule).
 */
const isMatch = (first, second) => {
  if (first.side === second.side) return false
  if (first.pairId === second.pairId) return true

  const termTile = first.side === 'term' ? first : second
  const meaningTile = first.side === 'term' ? second : first
  const termCard = roundPairs.value.find((card) => card.id === termTile.pairId)
  return !!termCard && termCard.definition === meaningTile.text
}

const selectTile = (tile) => {
  if (phase.value !== 'playing' || tile.matched || boardLocked.value) return

  // Tapping the picked tile again puts it back
  if (selectedKeys.value.includes(tile.key)) {
    selectedKeys.value = selectedKeys.value.filter((key) => key !== tile.key)
    return
  }

  selectedKeys.value = [...selectedKeys.value, tile.key]
  if (selectedKeys.value.length < 2) return

  const [firstKey, secondKey] = selectedKeys.value
  const first = tiles.value.find((item) => item.key === firstKey)
  const second = tiles.value.find((item) => item.key === secondKey)

  if (first && second && isMatch(first, second)) {
    first.matched = true
    second.matched = true
    matchedCount.value++
    selectedKeys.value = []
    confetti({ particleCount: 24, spread: 55, startVelocity: 26, scalar: 0.75, origin: { y: 0.75 } })

    if (matchedCount.value === roundPairs.value.length) {
      finishRound()
    }
    return
  }

  mistakes.value++
  boardLocked.value = true
  wrongKeys.value = [firstKey, secondKey]
  wrongTimeout = setTimeout(() => {
    wrongKeys.value = []
    selectedKeys.value = []
    boardLocked.value = false
    wrongTimeout = null
  }, 650)
}

const finishRound = () => {
  clearTimers()
  phase.value = 'finished'

  confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } })
  setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 } }), 250)
  setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 } }), 400)
}

onMounted(() => {
  pairsPerRound.value = Math.min(DEFAULT_PAIRS_PER_ROUND, props.pairs.length)
  startRound()
})

onUnmounted(() => {
  clearTimers()
  stopConfetti()
})
</script>

<style scoped>
.matching-bg {
  background:
    radial-gradient(circle at 12% 18%, rgba(253, 230, 138, 0.45), transparent 42%),
    radial-gradient(circle at 88% 12%, rgba(251, 207, 232, 0.5), transparent 42%),
    radial-gradient(circle at 50% 92%, rgba(191, 219, 254, 0.5), transparent 48%),
    linear-gradient(160deg, #fff7fb 0%, #f2f6ff 52%, #f3fffa 100%);
}

/* Matched tiles fade away but keep their slot, so the board never jumps under the finger */
.tile-matched {
  opacity: 0;
  transform: scale(0.7);
  pointer-events: none;
}

.tile-wrong {
  animation: tile-shake 0.4s ease-in-out;
}

@keyframes tile-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px) rotate(-2deg); }
  40% { transform: translateX(6px) rotate(2deg); }
  60% { transform: translateX(-4px) rotate(-1deg); }
  80% { transform: translateX(4px) rotate(1deg); }
}

.clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.deco {
  position: absolute;
  font-size: 1.75rem;
  opacity: 0.3;
  animation: float-slow 9s ease-in-out infinite;
}

.deco-1 { top: 8%; left: 5%; animation-delay: 0s; }
.deco-2 { top: 24%; right: 7%; animation-delay: 1.2s; font-size: 1.35rem; }
.deco-3 { bottom: 14%; left: 9%; animation-delay: 2.4s; }
.deco-4 { bottom: 26%; right: 11%; animation-delay: 3.1s; font-size: 1.5rem; }

@keyframes float-slow {
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50% { transform: translateY(-18px) rotate(6deg); }
}
</style>
