<template>
  <div class="quiz-bg min-h-[100dvh] relative">

    <!-- Start screen -->
    <div v-if="gameStatus === 'ready'" class="min-h-[100dvh] flex items-center justify-center p-4">
      <div class="bg-white/15 backdrop-blur rounded-3xl p-6 max-w-md w-full text-center border border-white/25">
        <div class="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-5xl mx-auto mb-4">✅</div>
        <h1 class="text-2xl font-extrabold text-white mb-1 break-words">{{ projectName }}</h1>
        <p class="text-white/80 text-sm mb-5">Luyện trắc nghiệm</p>

        <div class="bg-white/10 rounded-2xl px-4 py-3 mb-5 flex items-center justify-between text-white">
          <span class="text-sm">Số câu hỏi</span>
          <span class="font-extrabold text-lg">{{ props.questions.length }}</span>
        </div>

        <div class="space-y-3 mb-6 text-left">
          <div>
            <p class="text-xs font-semibold text-white/80 mb-1">Thời gian mỗi câu</p>
            <select v-model.number="questionTime"
              class="w-full px-3 py-2.5 bg-white/20 text-white rounded-xl border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-white/50">
              <option v-for="s in [10, 15, 20, 30, 45, 60]" :key="s" :value="s" class="text-gray-900">{{ s }} giây</option>
              <option :value="0" class="text-gray-900">Không giới hạn</option>
            </select>
          </div>
          <div>
            <p class="text-xs font-semibold text-white/80 mb-1">Tự chuyển câu</p>
            <select v-model.number="autoNextTime"
              class="w-full px-3 py-2.5 bg-white/20 text-white rounded-xl border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-white/50">
              <option :value="0" class="text-gray-900">Tắt</option>
              <option v-for="s in [3, 5, 10]" :key="s" :value="s" class="text-gray-900">{{ s }} giây</option>
            </select>
          </div>
        </div>

        <button @click="startGame"
          class="w-full px-6 py-3.5 bg-white text-leaf-700 text-base font-extrabold rounded-2xl shadow-lg active:scale-95 transition-transform">
          Bắt đầu
        </button>
        <button @click="emit('exit')"
          class="w-full mt-2.5 px-6 py-3 bg-white/10 text-white font-semibold rounded-2xl border border-white/25">
          Thoát
        </button>
      </div>
    </div>

    <!-- Question -->
    <div v-else-if="gameStatus === 'question'" class="h-[100dvh] overflow-hidden p-3 flex flex-col">
      <div class="max-w-3xl mx-auto w-full flex flex-col flex-1 min-h-0">

        <!-- Stat row -->
        <div class="flex items-center justify-between gap-2 mb-2.5 flex-shrink-0">
          <div class="flex items-center gap-2 min-w-0">
            <button @click="emit('exit')"
              class="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div class="bg-white/15 rounded-xl px-3 py-1.5 border border-white/20">
              <span class="text-white font-bold text-xs whitespace-nowrap">Câu {{ currentQuestionIndex + 1 }}/{{ props.questions.length }}</span>
            </div>
          </div>

          <div v-if="questionTime > 0" class="bg-white/15 rounded-xl px-3 py-1 border border-white/20 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-lg font-extrabold text-white" :class="{ 'text-red-300 animate-pulse': countdown <= 5 }">{{ countdown }}</span>
          </div>

          <div class="bg-white/15 rounded-xl px-3 py-1.5 border border-white/20">
            <span class="text-white font-bold text-xs whitespace-nowrap">✓ {{ correctAnswers }}</span>
          </div>
        </div>

        <!-- Question card -->
        <div class="bg-white rounded-3xl p-4 mb-2.5 shadow-xl flex-shrink-0 flex flex-col max-h-[36dvh] overflow-hidden">
          <h2 class="text-base sm:text-xl font-bold text-gray-900 text-center flex-shrink-0 break-words">
            {{ currentQuestion?.question }}
          </h2>

          <div v-if="currentQuestion?.selectedMedia?.url" class="flex-1 min-h-0 flex justify-center items-center mt-2">
            <img v-if="currentQuestion.selectedMedia.type === 'image'" :src="currentQuestion.selectedMedia.url" alt=""
              class="max-h-full max-w-full object-contain rounded-xl" />
            <video v-else-if="currentQuestion.selectedMedia.type === 'video'" :src="currentQuestion.selectedMedia.url"
              controls playsinline preload="metadata" class="max-h-full max-w-full object-contain rounded-xl" />
            <audio v-else-if="currentQuestion.selectedMedia.type === 'audio'" :src="currentQuestion.selectedMedia.url"
              controls class="w-full" />
          </div>
        </div>

        <!-- Answers -->
        <div class="grid auto-rows-fr gap-2 flex-1 min-h-0 overflow-y-auto grid-cols-1 sm:grid-cols-2">
          <button v-for="(answer, index) in displayAnswers" :key="index" @click="selectAnswer(answer)"
            :disabled="selectedAnswer !== null" :class="[
              'rounded-2xl px-3 py-3 text-left transition-all duration-200',
              displayAnswerColors[index],
              selectedAnswer !== null && answer === correctAnswerForMode ? 'ring-4 ring-white' : '',
              selectedAnswer !== null && selectedAnswer === answer && answer !== correctAnswerForMode ? 'opacity-60 ring-4 ring-red-200' : '',
              selectedAnswer !== null && selectedAnswer !== answer && answer !== correctAnswerForMode ? 'opacity-30' : ''
            ]">
            <div class="flex items-center gap-2.5">
              <span class="w-8 h-8 bg-white/25 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {{ displayAnswerSymbols[index] }}
              </span>
              <span class="text-sm sm:text-base font-bold text-white flex-1 break-words">{{ answer }}</span>
              <span v-if="selectedAnswer !== null && answer === correctAnswerForMode" class="text-xl flex-shrink-0">✓</span>
              <span v-else-if="selectedAnswer !== null && selectedAnswer === answer" class="text-xl flex-shrink-0">✗</span>
            </div>
          </button>
        </div>

        <!-- Next -->
        <div v-if="selectedAnswer !== null" class="mt-2.5 flex-shrink-0">
          <button @click="nextQuestion"
            class="w-full px-6 py-3 bg-white text-leaf-700 font-extrabold rounded-2xl shadow-lg active:scale-95 transition-transform">
            {{ currentQuestionIndex < props.questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả' }}
            <span v-if="autoNextCountdown > 0" class="ml-1.5 px-2 py-0.5 bg-leaf-100 rounded-full text-xs">{{ autoNextCountdown }}s</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Result -->
    <div v-else-if="gameStatus === 'finished'" class="min-h-[100dvh] flex items-center justify-center p-4">
      <div class="max-w-md w-full text-center">
        <div class="text-6xl mb-3">{{ correctAnswers === props.questions.length ? '🏆' : '🎉' }}</div>
        <h1 class="text-3xl font-extrabold text-white mb-1">Hoàn thành!</h1>
        <p class="text-white/80 text-sm mb-5 break-words">{{ projectName }}</p>

        <div class="bg-white/15 rounded-3xl p-6 mb-4 border border-white/25">
          <p class="text-white/80 text-sm mb-1">Kết quả</p>
          <h2 class="text-5xl font-extrabold text-white mb-4">{{ correctAnswers }}/{{ props.questions.length }}</h2>
          <div class="flex items-center justify-center gap-5 text-white">
            <div>
              <p class="text-2xl font-extrabold">{{ correctAnswers }}</p>
              <p class="text-xs opacity-80">Đúng</p>
            </div>
            <div class="w-px h-10 bg-white/30" />
            <div>
              <p class="text-2xl font-extrabold">{{ props.questions.length - correctAnswers }}</p>
              <p class="text-xs opacity-80">Sai</p>
            </div>
            <div class="w-px h-10 bg-white/30" />
            <div>
              <p class="text-2xl font-extrabold">{{ accuracy }}%</p>
              <p class="text-xs opacity-80">Chính xác</p>
            </div>
          </div>
        </div>

        <p class="bg-white/10 rounded-2xl px-4 py-3 mb-5 text-white text-sm border border-white/20">
          <span v-if="correctAnswers === props.questions.length">🎉 Tuyệt vời, bạn trả lời đúng tất cả!</span>
          <span v-else-if="accuracy >= 80">🌟 Rất tốt, chỉ còn một chút nữa thôi!</span>
          <span v-else-if="accuracy >= 60">👍 Khá tốt, hãy ôn thêm vài thẻ nhé!</span>
          <span v-else-if="accuracy >= 40">📚 Cần luyện thêm một chút nữa.</span>
          <span v-else>💪 Đừng bỏ cuộc, thử lại lần nữa nhé!</span>
        </p>

        <div class="flex flex-col gap-2.5">
          <button @click="restart"
            class="w-full px-6 py-3.5 bg-white text-leaf-700 font-extrabold rounded-2xl shadow-lg active:scale-95 transition-transform">
            Chơi lại
          </button>
          <button @click="emit('exit')"
            class="w-full px-6 py-3 bg-white/10 text-white font-semibold rounded-2xl border border-white/25">
            Thoát
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { confetti, stopConfetti } from '~/composables/useConfetti'

/**
 * The multiple-choice practice run on its own — settings, questions, result. The caller
 * supplies the questions (already in the { question, answer, otherAnswerN, selectedMedia }
 * shape) and decides where the player goes on exit, so the same run works as an in-place
 * overlay on the flashcard lesson screen.
 */
const props = defineProps({
  questions: { type: Array, required: true },
  projectName: { type: String, default: '' },
})

const emit = defineEmits(['exit'])

// gameStatus: 'ready' | 'question' | 'finished'
const gameStatus = ref('ready')
const questionTime = ref(15)
const autoNextTime = ref(3)
const autoNextCountdown = ref(0)
const countdown = ref(15)
const currentQuestionIndex = ref(0)
const correctAnswers = ref(0)
const selectedAnswer = ref(null)
/** The questions in play order — reshuffled on every run. */
const order = ref([])
/** The current question's answers in display order. */
const shuffledAnswers = ref([])

const answerColors = ['bg-rose-500', 'bg-sky-500', 'bg-amber-500', 'bg-leaf-500']
const answerSymbols = ['▲', '◆', '●', '■']

let countdownTimer = null
let autoNextTimer = null

const currentQuestion = computed(() => order.value[currentQuestionIndex.value] || null)
const displayAnswers = computed(() => shuffledAnswers.value)
const correctAnswerForMode = computed(() => currentQuestion.value?.answer ?? null)

const accuracy = computed(() => {
  if (props.questions.length === 0) return 0
  return Math.round((correctAnswers.value / props.questions.length) * 100)
})

const displayAnswerColors = computed(() => {
  const type = currentQuestion.value?.questionType || '4-choices'
  if (type === '2-choices') return ['bg-rose-500', 'bg-sky-500']
  return answerColors
})

const displayAnswerSymbols = computed(() => {
  const type = currentQuestion.value?.questionType || '4-choices'
  if (type === '2-choices') return ['▲', '◆']
  return answerSymbols
})

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const shuffleAnswersForQuestion = () => {
  const question = currentQuestion.value
  if (!question) {
    shuffledAnswers.value = []
    return
  }

  const type = question.questionType || '4-choices'
  const options = type === '2-choices'
    ? [question.answer, question.otherAnswer1]
    : [question.answer, question.otherAnswer1, question.otherAnswer2, question.otherAnswer3]
  shuffledAnswers.value = shuffleArray(options.filter((option) => option))
}

const clearTimers = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  if (autoNextTimer) {
    clearInterval(autoNextTimer)
    autoNextTimer = null
  }
  autoNextCountdown.value = 0
}

const startCountdown = () => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (Number(questionTime.value) <= 0) return

  countdown.value = Number(questionTime.value)
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
      // Running out of time counts as a wrong answer, same as picking one
      if (selectedAnswer.value === null) {
        selectedAnswer.value = '__timeout__'
        if (Number(autoNextTime.value) > 0) startAutoNextTimer()
      }
    }
  }, 1000)
}

const startAutoNextTimer = () => {
  const seconds = Number(autoNextTime.value)
  if (seconds <= 0) return

  autoNextCountdown.value = seconds
  if (autoNextTimer) clearInterval(autoNextTimer)
  autoNextTimer = setInterval(() => {
    autoNextCountdown.value--
    if (autoNextCountdown.value <= 0) {
      clearInterval(autoNextTimer)
      autoNextTimer = null
      nextQuestion()
    }
  }, 1000)
}

const startGame = () => {
  clearTimers()
  order.value = shuffleArray(props.questions)
  currentQuestionIndex.value = 0
  correctAnswers.value = 0
  selectedAnswer.value = null
  shuffleAnswersForQuestion()
  gameStatus.value = 'question'
  startCountdown()
}

const selectAnswer = (answer) => {
  if (selectedAnswer.value !== null) return

  selectedAnswer.value = answer
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }

  if (answer === correctAnswerForMode.value) {
    correctAnswers.value++
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } })
  }

  if (Number(autoNextTime.value) > 0) startAutoNextTimer()
}

const nextQuestion = () => {
  clearTimers()

  if (currentQuestionIndex.value >= order.value.length - 1) {
    gameStatus.value = 'finished'
    setTimeout(celebrateFinish, 400)
    return
  }

  currentQuestionIndex.value++
  selectedAnswer.value = null
  shuffleAnswersForQuestion()
  startCountdown()
}

// Back to the settings screen, where the run can be started again
const restart = () => {
  clearTimers()
  gameStatus.value = 'ready'
}

const celebrateFinish = () => {
  confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } })
  setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 } }), 250)
  setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 } }), 400)
}

onUnmounted(() => {
  clearTimers()
  stopConfetti()
})
</script>

<style scoped>
.quiz-bg {
  background: linear-gradient(165deg, #4CA771 0%, #3d9060 55%, #1a5538 100%);
}
</style>
