<template>
  <div class="listening-bg min-h-[100dvh] text-slate-700">
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

        <div class="grid grid-cols-2 gap-2">
          <div class="px-2 py-1.5 rounded-xl bg-violet-50 border border-violet-100 text-center">
            <p class="text-[10px] text-violet-400 font-semibold leading-none">Thẻ</p>
            <p class="text-base font-extrabold text-violet-600 leading-tight">{{ Math.min(index + 1, rounds.length) }}/{{ rounds.length }}</p>
          </div>
          <div class="px-2 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <p class="text-[10px] text-emerald-500 font-semibold leading-none">Đúng</p>
            <p class="text-base font-extrabold text-emerald-600 leading-tight">{{ correctCount }}</p>
          </div>
        </div>

        <div class="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-violet-300 to-fuchsia-300 rounded-full transition-all duration-500"
            :style="{ width: progressPercent + '%' }" />
        </div>
      </div>

      <!-- Speech unavailable: nothing to listen to, so say so instead of failing quietly -->
      <div v-if="!speechSupported" class="bg-white rounded-3xl p-7 shadow-xl border-2 border-white text-center">
        <div class="text-5xl mb-3">🔇</div>
        <h2 class="text-lg font-bold text-slate-800 mb-2">Thiết bị này không hỗ trợ phát âm</h2>
        <button @click="emit('exit')" class="mt-3 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl">
          Thoát
        </button>
      </div>

      <!-- Round -->
      <div v-else-if="phase === 'playing' && current" class="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border-2 border-white">
        <p class="text-center text-[11px] font-bold uppercase tracking-wide text-violet-400 mb-4">
          Nghe phát âm rồi chọn nghĩa đúng
        </p>

        <!-- Replay -->
        <div class="flex justify-center">
          <button @click="speakCurrent" :class="[
            'w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all',
            'bg-gradient-to-br from-violet-400 to-fuchsia-400 active:scale-95',
            speaking ? 'animate-pulse-ring' : ''
          ]">
            <svg class="w-11 h-11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>
        <p class="text-center text-xs text-slate-400 mt-2">Nhấn để nghe lại</p>

        <!-- Choices -->
        <div class="grid grid-cols-1 gap-2.5 mt-5">
          <button v-for="(choice, choiceIndex) in current.choices" :key="choiceIndex" @click="pick(choice)"
            :disabled="picked !== null" :class="[
              'px-4 py-3.5 rounded-2xl border-2 text-left text-sm font-semibold transition-all break-words',
              picked === null ? 'bg-white border-violet-100 active:scale-[0.98] shadow-sm' : '',
              picked !== null && choice === current.card.definition ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : '',
              picked !== null && picked === choice && choice !== current.card.definition ? 'bg-rose-50 border-rose-300 text-rose-600' : '',
              picked !== null && picked !== choice && choice !== current.card.definition ? 'opacity-40 border-slate-100' : ''
            ]">
            {{ choice }}
          </button>
        </div>

        <!-- What was said -->
        <div v-if="picked !== null" class="mt-5 text-center">
          <p class="text-[11px] uppercase tracking-wide text-slate-400 font-bold">Bạn vừa nghe</p>
          <p class="text-xl font-extrabold text-slate-800 break-words">{{ current.card.term }}</p>
          <button @click="next"
            class="mt-4 w-full px-6 py-3 bg-gradient-to-r from-violet-400 to-fuchsia-400 text-white font-extrabold rounded-2xl shadow-lg active:scale-95 transition-transform">
            {{ index < rounds.length - 1 ? 'Thẻ tiếp theo' : 'Xem kết quả' }}
          </button>
        </div>
      </div>

      <!-- Result -->
      <div v-else-if="phase === 'finished'" class="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border-2 border-white text-center">
        <div class="text-5xl mb-2">{{ correctCount === rounds.length ? '🏆' : '👂' }}</div>
        <h2 class="text-xl font-extrabold text-slate-800">
          {{ correctCount === rounds.length ? 'Hoàn hảo!' : 'Xong rồi!' }}
        </h2>
        <p class="text-slate-500 text-sm mt-1">Đúng {{ correctCount }}/{{ rounds.length }} thẻ</p>
        <p class="text-4xl font-extrabold text-violet-500 mt-2">{{ accuracy }}%</p>

        <div class="mt-5 flex flex-col gap-2.5">
          <button @click="start"
            class="w-full px-6 py-3 bg-gradient-to-r from-violet-400 to-fuchsia-400 text-white font-extrabold rounded-2xl shadow-lg active:scale-95 transition-transform">
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
 * Listening drill: the term is spoken, the player picks its meaning. A card's own recorded
 * clip is used when the lesson has one, otherwise the browser's speech synthesis in the
 * set's language — so the game needs at least one of the two to be available.
 */
const props = defineProps({
  /** { id, term, definition, media, voiceUrl } — term and definition both required. */
  cards: { type: Array, required: true },
  projectName: { type: String, default: '' },
  /** The set's language code (vi, en, ja, …) — picks the voice. */
  lang: { type: String, default: 'vi' },
})

const emit = defineEmits(['exit'])

const LANG_TAGS = {
  vi: 'vi-VN',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
  ko: 'ko-KR',
  ru: 'ru-RU',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  pt: 'pt-BR',
  th: 'th-TH',
}

// phase: 'playing' | 'finished'
const phase = ref('playing')
const rounds = ref([])
const index = ref(0)
const picked = ref(null)
const correctCount = ref(0)
const speaking = ref(false)
const speechSupported = ref(true)

let clipPlayer = null

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

/** Up to three decoy meanings, deduplicated so no two buttons read the same. */
const buildRounds = () => shuffleArray(props.cards).map((card) => {
  const decoys = shuffleArray(
    Array.from(new Set(props.cards.map((other) => other.definition)))
      .filter((definition) => definition !== card.definition)
  ).slice(0, 3)

  return { card, choices: shuffleArray([card.definition, ...decoys]) }
})

const stopAudio = () => {
  if (clipPlayer) {
    clipPlayer.pause()
    clipPlayer = null
  }
  if (process.client) window.speechSynthesis?.cancel()
  speaking.value = false
}

/** A recorded clip beats the synthesised voice whenever the card has one. */
const play = (card) => {
  if (!process.client || !card) return
  stopAudio()

  if (card.voiceUrl) {
    const audio = new Audio(card.voiceUrl)
    speaking.value = true
    audio.onended = () => { speaking.value = false; clipPlayer = null }
    audio.onerror = () => { speaking.value = false; clipPlayer = null }
    audio.play().catch(() => { speaking.value = false; clipPlayer = null })
    clipPlayer = audio
    return
  }

  if (!window.speechSynthesis || !card.term) return

  const utterance = new SpeechSynthesisUtterance(card.term)
  utterance.lang = LANG_TAGS[props.lang] || 'en-US'
  utterance.rate = 0.8
  utterance.onstart = () => { speaking.value = true }
  utterance.onend = () => { speaking.value = false }
  utterance.onerror = () => { speaking.value = false }
  window.speechSynthesis.speak(utterance)
}

const speakCurrent = () => play(current.value?.card)

const start = () => {
  rounds.value = buildRounds()
  index.value = 0
  picked.value = null
  correctCount.value = 0
  phase.value = 'playing'
  // A short delay lets the overlay settle before the voice starts
  setTimeout(speakCurrent, 400)
}

const next = () => {
  if (index.value >= rounds.value.length - 1) {
    phase.value = 'finished'
    if (correctCount.value === rounds.value.length) {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } })
    }
    return
  }

  index.value++
  picked.value = null
  setTimeout(speakCurrent, 250)
}

const pick = (choice) => {
  if (picked.value !== null || !current.value) return

  picked.value = choice
  if (choice === current.value.card.definition) {
    correctCount.value++
    confetti({ particleCount: 22, spread: 50, scalar: 0.6, origin: { y: 0.7 } })
  }
}

onMounted(() => {
  const hasSynthesis = process.client && typeof window.speechSynthesis !== 'undefined'
  const hasClips = props.cards.some((card) => card.voiceUrl)
  speechSupported.value = hasSynthesis || hasClips
  if (speechSupported.value) start()
})

onUnmounted(() => {
  stopAudio()
  stopConfetti()
})
</script>

<style scoped>
.listening-bg {
  background:
    radial-gradient(circle at 15% 15%, rgba(233, 213, 255, 0.6), transparent 45%),
    radial-gradient(circle at 85% 20%, rgba(251, 207, 232, 0.5), transparent 45%),
    linear-gradient(165deg, #fbf7ff 0%, #fdf6ff 55%, #f8f9ff 100%);
}

.animate-pulse-ring {
  animation: pulse-ring 1.2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.55); }
  50% { box-shadow: 0 0 0 18px rgba(167, 139, 250, 0); }
}
</style>
