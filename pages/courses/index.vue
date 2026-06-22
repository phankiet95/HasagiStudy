<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-screen gap-3">
      <svg class="animate-spin w-10 h-10 text-leaf-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <p class="text-gray-400 text-base">Đang tải khóa học...</p>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 px-4 pt-5 pb-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl overflow-hidden bg-leaf-50 border border-leaf-100 flex-shrink-0 flex items-center justify-center">
            <img v-if="store.orgLogo" :src="store.orgLogo" class="w-full h-full object-contain" />
            <span v-else class="font-black text-leaf-400">{{ store.orgName?.[0]?.toUpperCase() }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-500">{{ store.orgName }}</p>
            <p class="font-semibold text-gray-900 text-base">Xin chào, {{ store.student?.fullName }} 👋</p>
          </div>
        </div>

        <!-- Stats row -->
        <div class="grid grid-cols-3 gap-2.5">
          <div class="bg-gray-50 rounded-2xl px-3 py-3 border border-gray-100">
            <p class="text-gray-400 text-xs mb-0.5">Tổng khóa học</p>
            <p class="text-gray-800 text-xl font-bold">{{ courses.length }}</p>
          </div>
          <div class="bg-gray-50 rounded-2xl px-3 py-3 border border-gray-100">
            <p class="text-gray-400 text-xs mb-0.5">Đang học</p>
            <p class="text-gray-800 text-xl font-bold">{{ inProgressCount }}</p>
          </div>
          <div class="bg-gray-50 rounded-2xl px-3 py-3 border border-gray-100">
            <p class="text-gray-400 text-xs mb-0.5">Hoàn thành</p>
            <p class="text-gray-800 text-xl font-bold">{{ completedCount }}</p>
          </div>
        </div>
      </div>

      <!-- Course list -->
      <div class="px-4 py-4">
        <h2 class="text-base font-bold text-gray-800 mb-3">Khóa học của tôi</h2>

        <!-- Empty state -->
        <div v-if="courses.length === 0"
          class="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-leaf-50 flex items-center justify-center">
            <svg class="w-8 h-8 text-leaf-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <p class="text-gray-700 font-semibold text-lg">Chưa có khóa học nào</p>
          <p class="text-gray-400 text-sm mt-1">Liên hệ giáo viên để được phân công khóa học</p>
        </div>

        <!-- Course cards -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <NuxtLink
            v-for="course in courses"
            :key="course.id"
            :to="`/courses/${course.slug}`"
            class="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col active:scale-[0.98] transition-transform"
          >
            <!-- Cover image -->
            <div class="relative h-40 green-background overflow-hidden flex-shrink-0">
              <img v-if="course.coverUrl" :src="course.coverUrl" class="w-full h-full object-contain" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-12 h-12 text-leaf-200" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>

              <!-- Status badge -->
              <div class="absolute top-3 right-3">
                <span v-if="progressPercent(course) === 100"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow-sm">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                  </svg>
                  Hoàn thành
                </span>
                <span v-else-if="progressPercent(course) > 0"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold dark-green-button shadow-sm">
                  Đang học
                </span>
                <span v-else
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-600 shadow-sm">
                  Chưa bắt đầu
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-4 flex flex-col flex-1">
              <h3 class="font-bold text-gray-900 text-base leading-snug mb-1.5 line-clamp-2">
                {{ course.title }}
              </h3>
              <p v-if="course.description" class="text-sm text-gray-400 line-clamp-2 flex-1 leading-relaxed">
                {{ course.description }}
              </p>
              <div v-else class="flex-1" />

              <!-- Progress -->
              <div class="mt-3 pt-3 border-t border-gray-50">
                <div class="flex justify-between text-sm text-gray-400 mb-1.5">
                  <span>{{ course.completedLessons }}/{{ course.totalLessons }} bài học</span>
                  <span class="font-semibold" :class="progressPercent(course) === 100 ? 'text-green-500' : 'text-leaf-500'">
                    {{ progressPercent(course) }}%
                  </span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-500"
                    :class="progressPercent(course) === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-leaf-500 to-leaf-500'"
                    :style="{ width: progressPercent(course) + '%' }"/>
                </div>
              </div>

              <!-- CTA button -->
              <div class="mt-3">
                <span class="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all shadow-sm"
                  :class="progressPercent(course) === 100
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : 'dark-green-button'">
                  <svg v-if="progressPercent(course) === 100" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                  </svg>
                  {{ progressPercent(course) === 100 ? 'Xem lại' : progressPercent(course) > 0 ? 'Tiếp tục học' : 'Bắt đầu học' }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useStudyStore } from '~/composables/useStudyStore'
import { useLmsStudent } from '~/composables/useLmsStudent'
import { useCoursesCache } from '~/composables/useCoursesCache'

const store = useStudyStore()
const { validateSession } = useLmsStudent()
const { getCourses, saveCourses } = useCoursesCache()

const courses = ref([])
const loading = ref(true)

const firstName = computed(() => store.student?.fullName?.split(' ').at(-1) || store.student?.fullName || '')
const progressPercent = (c) => c.totalLessons ? Math.round((c.completedLessons / c.totalLessons) * 100) : 0
const inProgressCount = computed(() => courses.value.filter(c => progressPercent(c) > 0 && progressPercent(c) < 100).length)
const completedCount = computed(() => courses.value.filter(c => progressPercent(c) === 100).length)

onMounted(async () => {
  if (!store.orgSlug) return navigateTo('/connect')
  if (!store.sessionToken) return navigateTo('/login')

  // Load from IndexedDB first for instant display (also works offline)
  try {
    const cached = await getCourses(store.orgSlug)
    if (cached) {
      courses.value = cached
      loading.value = false
    }
  } catch { /* ignore cache errors */ }

  // Offline: nothing more to do
  if (!navigator.onLine) {
    loading.value = false
    return
  }

  // Online: validate session + refresh courses in background
  try {
    const student = await validateSession(store.sessionToken)
    if (!student) {
      store.clearSession()
      return navigateTo('/login')
    }
    store.student = student

    const { courses: data } = await $fetch('/api/lms/student-courses', {
      headers: { 'x-lms-session': store.sessionToken },
    })
    courses.value = data
    saveCourses(store.orgSlug, data).catch(() => {})
  } catch {
    // Network error — already showing cached data
  } finally {
    loading.value = false
  }
})
</script>
