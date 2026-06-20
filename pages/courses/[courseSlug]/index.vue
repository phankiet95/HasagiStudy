<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="flex flex-col items-center gap-4">
        <svg class="animate-spin w-10 h-10 text-leaf-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p class="text-gray-400 text-base">Đang tải khóa học...</p>
      </div>
    </div>

    <!-- Error / Not found -->
    <div v-else-if="!course" class="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div class="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <p class="text-gray-700 font-semibold text-lg">{{ error || 'Không tìm thấy khóa học' }}</p>
      <p class="text-gray-400 text-sm mt-1">Khóa học không tồn tại hoặc bạn không có quyền truy cập.</p>
      <NuxtLink to="/courses" class="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-leaf-500 text-white text-sm font-semibold rounded-xl">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Quay lại danh sách
      </NuxtLink>
    </div>

    <!-- Course content -->
    <template v-else>
      <!-- Hero -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-5xl mx-auto px-4 py-4">
          <!-- Back -->
          <NuxtLink to="/courses"
            class="inline-flex items-center gap-1.5 text-gray-400 hover:text-leaf-500 text-sm mb-4 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Khóa học của tôi
          </NuxtLink>

          <!-- Responsive layout: stack on mobile, side-by-side on lg+ -->
          <div class="md:flex md:gap-8 md:items-start">

            <!-- Cover image -->
            <div class="w-full md:w-72 lg:w-80 md:flex-shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-leaf-100 to-leaf-100 aspect-video md:aspect-auto md:h-52 mb-4 md:mb-0">
              <img v-if="course.cover_url" :src="course.cover_url" class="w-full h-full object-contain" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-12 h-12 text-leaf-300" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <h1 class="text-xl font-bold text-gray-900 leading-snug mb-1">{{ course.title }}</h1>
              <p v-if="course.description" class="text-gray-500 text-base leading-relaxed line-clamp-2 mb-3">{{ course.description }}</p>

              <!-- Stats -->
              <div class="flex flex-wrap items-center gap-3 mb-4">
                <span class="flex items-center gap-1.5 text-base text-gray-500">
                  <svg class="w-4 h-4 text-leaf-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                  </svg>
                  {{ chapters.length }} chương
                </span>
                <span class="flex items-center gap-1.5 text-base text-gray-500">
                  <svg class="w-4 h-4 text-leaf-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  {{ totalLessons }} bài học
                </span>
                <span class="flex items-center gap-1.5 text-base text-green-600 font-medium">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ completedCount }} đã hoàn thành
                </span>
              </div>

              <!-- Progress -->
              <div>
                <div class="flex items-center justify-between text-sm text-gray-400 mb-1.5">
                  <span>Tiến độ học tập</span>
                  <span class="font-semibold text-leaf-800">{{ overallPercent }}%</span>
                </div>
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full dark-green-button rounded-full transition-all duration-700"
                    :style="{ width: overallPercent + '%' }" />
                </div>
              </div>

              <!-- Continue button -->
              <div class="mt-4">
                <NuxtLink
                  v-if="nextLesson"
                  :to="`/courses/${route.params.courseSlug}/lessons/${nextLesson.slug || nextLesson.id}`"
                  class="flex items-center justify-center gap-2 w-full py-3 dark-green-button font-semibold text-sm rounded-xl transition-all shadow-md"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  {{ completedCount === 0 ? 'Bắt đầu học' : 'Tiếp tục học' }}
                </NuxtLink>
                <div v-else-if="overallPercent === 100"
                  class="flex items-center justify-center gap-2 w-full py-3 bg-green-50 text-green-700 font-semibold text-sm rounded-xl border border-green-200">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Đã hoàn thành khóa học!
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Offline banner -->
      <div v-if="isOfflineMode" class="mx-4 mt-4 flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
        <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M8.111 8.111A3 3 0 0012 15a3 3 0 003-3 3 3 0 00-.111-.889M21 12a9 9 0 01-9 9m-6.343-2.657A9 9 0 013 12c0-2.48 1.007-4.729 2.636-6.364" />
        </svg>
        <span class="font-medium">Đang xem offline</span>
        <span class="text-amber-500 text-xs">— Tiến độ sẽ đồng bộ khi có kết nối</span>
      </div>

      <!-- Chapter / lesson list -->
      <div class="max-w-5xl mx-auto px-4 py-4">
        <h2 class="text-base font-bold text-gray-900 mb-3">
          Nội dung khóa học
          <span class="text-gray-400 font-normal text-sm ml-1">{{ chapters.length }} chương · {{ totalLessons }} bài</span>
        </h2>

        <div class="space-y-3">
          <div v-for="(chapter, chIdx) in chapters" :key="chapter.id"
            class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

            <!-- Chapter header -->
            <button
              @click="toggleChapter(chapter.id)"
              class="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div class="w-8 h-8 rounded-lg bg-leaf-50 flex items-center justify-center flex-shrink-0">
                <span class="text-xs font-bold text-leaf-500">{{ chIdx + 1 }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 text-sm leading-snug">{{ chapter.title }}</p>
                <p class="text-xs text-gray-400 mt-0.5">
                  {{ chapterCompletedCount(chapter) }}/{{ chapter.lessons.length }} bài hoàn thành
                </p>
              </div>
              <!-- Mini progress -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <div class="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-leaf-400 rounded-full" :style="{ width: chapterPercent(chapter) + '%' }" />
                </div>
                <svg class="w-4 h-4 text-gray-400 transition-transform duration-200"
                  :class="openChapters.has(chapter.id) ? 'rotate-180' : ''"
                  fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            <!-- Lessons -->
            <div v-show="openChapters.has(chapter.id)" class="border-t border-gray-100">
              <div v-if="chapter.lessons.length === 0" class="px-4 py-3 text-sm text-gray-400 italic">
                Chương chưa có bài học.
              </div>
              <div v-for="(lesson, lIdx) in chapter.lessons" :key="lesson.id" class="border-b border-gray-50 last:border-b-0">
                <!-- Lesson row -->
                <div class="flex items-center gap-3 px-4 py-3">
                  <div class="flex-shrink-0">
                    <div v-if="completedIds.has(lesson.id)" class="w-7 h-7 rounded-full dark-green-icon flex items-center justify-center">
                      <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <div v-else class="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center">
                      <svg class="w-3.5 h-3.5 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      <p class="text-sm font-medium text-gray-800 truncate">{{ lesson.title }}</p>
                      <span v-if="lesson.metadata?.lesson_type === 'flashcard'"
                        class="inline-flex items-center px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded flex-shrink-0">
                        Flashcard
                      </span>
                    </div>
                    <p class="text-xs text-gray-400 mt-0.5">Bài {{ lIdx + 1 }}</p>
                  </div>

                  <!-- Download button -->
                  <button @click.prevent="handleDownload(lesson)"
                    class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                    :class="dlState(lesson.slug).status === 'done' ? 'text-leaf-500 hover:bg-leaf-50' : 'text-gray-400 hover:bg-gray-100'"
                    :title="dlState(lesson.slug).status === 'done' ? 'Đã tải — nhấn để xóa' : 'Tải trước bài học'"
                  >
                    <!-- Idle: download -->
                    <svg v-if="dlState(lesson.slug).status === 'idle'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <!-- Downloading: spinner with % -->
                    <div v-else-if="dlState(lesson.slug).status === 'downloading'" class="relative w-5 h-5">
                      <svg class="animate-spin w-6 h-6 text-leaf-500" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
                        <path class="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      <span class="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-leaf-500">
                        {{ dlState(lesson.slug).progress }}
                      </span>
                    </div>
                    <!-- Done: checkmark -->
                    <svg v-else-if="dlState(lesson.slug).status === 'done'" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <!-- Error: warning -->
                    <svg v-else class="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </button>
                </div>

                <!-- Sub-links -->
                <div class="pl-14 pr-4 pb-2.5 flex flex-col gap-1">
                  <NuxtLink
                    v-if="lesson.metadata?.lesson_type !== 'exam'"
                    :to="`/courses/${course.slug || course.id}/lessons/${lesson.slug || lesson.id}`"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                    :class="completedIds.has(lesson.id) ? 'text-green-600 hover:bg-green-50' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'"
                  >
                    <svg v-if="completedIds.has(lesson.id)" class="w-3.5 h-3.5 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <svg v-else-if="lesson.metadata?.lesson_type === 'flashcard'" class="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    {{ lesson.metadata?.lesson_type === 'flashcard' ? 'Học Flashcard' : 'Bài Học' }}
                  </NuxtLink>

                  <NuxtLink
                    v-if="lesson.metadata?.quiz?.quizQuestionList?.length"
                    :to="`/courses/${course.slug || course.id}/lessons/${lesson.slug || lesson.id}?tab=quiz`"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                    :class="passedQuizIds.has(lesson.id) ? 'text-green-600 hover:bg-green-50' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'"
                  >
                    <svg v-if="passedQuizIds.has(lesson.id)" class="w-3.5 h-3.5 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                    Bài Tập
                    <span class="hidden ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      :class="passedQuizIds.has(lesson.id) ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'">
                      {{ lesson.metadata.quiz.quizQuestionList.length }}
                    </span>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useStudyStore } from '~/composables/useStudyStore'
import { useLmsStudent } from '~/composables/useLmsStudent'
import { useOfflineLesson, withTimeout } from '~/composables/useOfflineLesson'

const store = useStudyStore()
const { validateSession } = useLmsStudent()
const route = useRoute()
const { downloadStates, downloadLesson, deleteOfflineLesson, initDownloadStates, getOfflineCourseData } = useOfflineLesson()

const course = ref(null)
const chapters = ref([])
const completedIds = ref(new Set())
const passedQuizIds = ref(new Set())
const loading = ref(true)
const error = ref('')
const openChapters = reactive(new Set())
const isOfflineMode = ref(false)

const loadOfflineCourse = async () => {
  const courseParam = route.params.courseSlug
  const offlineData = await getOfflineCourseData(store.orgSlug, courseParam)
  if (!offlineData) return false
  course.value = offlineData.course
  const lessonsById = {}
  for (const l of offlineData.allLessons) {
    if (!lessonsById[l.chapter_id]) lessonsById[l.chapter_id] = []
    lessonsById[l.chapter_id].push(l)
  }
  chapters.value = offlineData.chapters.map(ch => ({ ...ch, lessons: lessonsById[ch.id] || [] }))
  for (const ch of chapters.value) openChapters.add(ch.id)
  initDownloadStates(store.orgSlug, courseParam, offlineData.allLessons.map(l => l.slug))
  isOfflineMode.value = true
  return true
}

onMounted(async () => {
  if (!store.orgSlug) return navigateTo('/connect')
  if (!store.sessionToken) return navigateTo('/login')

  const isOffline = !navigator.onLine
  if (isOffline) {
    const loaded = await loadOfflineCourse()
    if (!loaded) error.value = 'Không có kết nối mạng và chưa tải bài học nào cho khóa học này'
    loading.value = false
    return
  }

  try {
    const validStudent = await withTimeout(validateSession(store.sessionToken), 5000)
    if (!validStudent) {
      store.clearSession()
      return navigateTo('/login')
    }
    store.student = validStudent

    const courseParam = route.params.courseSlug
    const { course: courseData, chapters: chaptersData, lessons: lessonsData } = await withTimeout(
      $fetch('/api/lms/course-detail', {
        query: { orgSlug: store.orgSlug, courseSlug: courseParam },
        headers: { 'x-lms-session': store.sessionToken },
      }),
      8000,
    )

    course.value = courseData

    const lessonsById = {}
    for (const l of lessonsData) {
      if (!lessonsById[l.chapter_id]) lessonsById[l.chapter_id] = []
      lessonsById[l.chapter_id].push(l)
    }
    chapters.value = chaptersData.map(ch => ({ ...ch, lessons: lessonsById[ch.id] || [] }))
    for (const ch of chapters.value) openChapters.add(ch.id)

    initDownloadStates(store.orgSlug, route.params.courseSlug, lessonsData.map(l => l.slug))

    try {
      const { completedLessonIds, passedQuizLessonIds } = await withTimeout(
        $fetch('/api/lms/student-progress', {
          headers: { 'x-lms-session': store.sessionToken },
        }),
        5000,
      )
      completedIds.value = new Set(completedLessonIds)
      passedQuizIds.value = new Set(passedQuizLessonIds)
    } catch {
      completedIds.value = new Set()
      passedQuizIds.value = new Set()
    }
  } catch (e) {
    const isNetworkErr = e?.message === 'network-timeout' || !navigator.onLine
    if (isNetworkErr) {
      const loaded = await loadOfflineCourse()
      if (!loaded) {
        error.value = 'Không có kết nối mạng và chưa tải bài học nào cho khóa học này'
        course.value = null
      }
    } else {
      console.error('[CourseDetail] Failed to load:', e)
      error.value = e?.data?.message || 'Có lỗi xảy ra khi tải khóa học'
      course.value = null
    }
  } finally {
    loading.value = false
  }
})

const toggleChapter = (id) => {
  if (openChapters.has(id)) openChapters.delete(id)
  else openChapters.add(id)
}

const allLessons = computed(() => chapters.value.flatMap(ch => ch.lessons))
const totalLessons = computed(() => allLessons.value.length)
const completedCount = computed(() => allLessons.value.filter(l => completedIds.value.has(l.id)).length)
const overallPercent = computed(() => totalLessons.value ? Math.round((completedCount.value / totalLessons.value) * 100) : 0)
const chapterCompletedCount = (ch) => ch.lessons.filter(l => completedIds.value.has(l.id)).length
const chapterPercent = (ch) => ch.lessons.length ? Math.round((chapterCompletedCount(ch) / ch.lessons.length) * 100) : 0
const nextLesson = computed(() => allLessons.value.find(l => !completedIds.value.has(l.id)) ?? null)

const dlState = (lessonSlug) => downloadStates[lessonSlug] || { status: 'idle', progress: 0, downloaded: 0, total: 0 }

const handleDownload = async (lesson) => {
  const key = `${store.orgSlug}/${route.params.courseSlug}/${lesson.slug}`
  const state = dlState(lesson.slug)
  if (state.status === 'downloading') return

  if (state.status === 'done') {
    if (confirm(`Xóa bài "${lesson.title}" khỏi bộ nhớ offline?`)) {
      await deleteOfflineLesson(key)
    }
    return
  }

  try {
    await downloadLesson(
      { orgSlug: store.orgSlug, courseSlug: route.params.courseSlug, lessonSlug: lesson.slug, sessionToken: store.sessionToken },
      () => {},
    )
  } catch (e) {
    const msg = downloadStates[lesson.slug]?.errorMessage || 'Tải thất bại'
    alert(msg)
  }
}
</script>
