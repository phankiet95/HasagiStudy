<template>
  <div class="min-h-screen bg-gray-950 flex flex-col">

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <svg class="animate-spin w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p class="text-gray-400 text-sm">Đang tải bài học...</p>
      </div>
    </div>

    <!-- Error / Not found -->
    <div v-else-if="!lesson" class="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div class="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <p class="text-gray-200 font-semibold text-lg">Không tìm thấy bài học</p>
      <p class="text-gray-500 text-sm mt-1">Bài học không tồn tại hoặc bạn không có quyền truy cập.</p>
      <NuxtLink :to="`/courses/${route.params.courseSlug}`" class="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Quay lại khóa học
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Top bar -->
      <div class="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 h-14 flex items-center px-4 gap-3 flex-shrink-0">
        <NuxtLink
          :to="`/courses/${route.params.courseSlug}`"
          class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group flex-shrink-0"
        >
          <div class="w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </div>
        </NuxtLink>

        <div class="w-px h-5 bg-gray-700 flex-shrink-0" />

        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 truncate">{{ courseName }}</p>
          <p class="font-semibold text-white text-sm truncate leading-tight">{{ lesson.title }}</p>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Offline badge -->
          <div v-if="isOfflineMode" class="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/30">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18M8.111 8.111A3 3 0 0012 15a3 3 0 003-3 3 3 0 00-.111-.889M21 12a9 9 0 01-9 9m-6.343-2.657A9 9 0 013 12c0-2.48 1.007-4.729 2.636-6.364" />
            </svg>
            Offline
          </div>

          <!-- Timer -->
          <div v-if="showQuizPanel && quizPhase === 'taking' && quizTimeLimitMinutes" :class="[
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all',
            isTimeLow ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-800 text-gray-200 border border-gray-700'
          ]">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ formattedTime }}
          </div>

          <button
            v-if="!isCompleted && !showQuizPanel"
            @click="markComplete"
            :disabled="completing"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 hover:text-white text-xs font-semibold rounded-lg border border-gray-600 transition-all disabled:opacity-50"
          >
            <svg v-if="!completing" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <svg v-else class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span class="hidden sm:inline">{{ completing ? 'Đang lưu...' : 'Hoàn thành' }}</span>
          </button>
          <div
            v-else-if="isCompleted && !showQuizPanel"
            class="flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span class="hidden sm:inline">Đã hoàn thành</span>
          </div>
        </div>
      </div>

      <!-- Tab switcher (Bài học / Bài tập) — shown when there is a quiz -->
      <div v-if="hasQuiz" class="flex bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <button
          v-if="!isExamLesson"
          @click="navigateTo({ query: {} })"
          class="flex-1 py-3 text-sm font-semibold transition-colors border-b-2"
          :class="!showQuizPanel ? 'text-white border-indigo-500' : 'text-gray-500 border-transparent hover:text-gray-300'"
        >
          Bài Học
        </button>
        <button
          @click="navigateTo({ query: { tab: 'quiz' } })"
          class="flex-1 py-3 text-sm font-semibold transition-colors border-b-2"
          :class="showQuizPanel ? 'text-white border-indigo-500' : 'text-gray-500 border-transparent hover:text-gray-300'"
        >
          Bài Tập
          <span class="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
            :class="showQuizPanel ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400'">
            {{ quizQuestions.length }}
          </span>
        </button>
      </div>

      <!-- Main content -->
      <div class="flex-1 flex bg-white min-h-0">

        <!-- Left column -->
        <div class="flex-1 min-w-0 flex flex-col bg-white">

          <!-- ── LESSON CONTENT ── -->
          <template v-if="!showQuizPanel">
            <!-- Video -->
            <div v-if="lesson.metadata?.videos?.length" class="bg-black flex-shrink-0">
              <div v-if="lesson.metadata.videos.length === 1">
                <video :src="lesson.metadata.videos[0].url" controls class="w-full max-h-[55vw] sm:max-h-[70vh] object-contain" preload="metadata" style="display:block;" />
              </div>
              <div v-else>
                <div class="flex gap-1 px-4 pt-3 pb-1">
                  <button
                    v-for="(video, idx) in lesson.metadata.videos"
                    :key="video.mediaId"
                    @click="activeVideoIdx = idx"
                    class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
                    :class="activeVideoIdx === idx ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'"
                  >
                    {{ video.title || `Video ${idx + 1}` }}
                  </button>
                </div>
                <video :src="lesson.metadata.videos[activeVideoIdx].url" controls class="w-full max-h-[55vw] sm:max-h-[70vh] object-contain" preload="metadata" style="display:block;" />
              </div>
            </div>

            <!-- Lesson body -->
            <div class="flex-1 px-4 sm:px-8 py-6 max-w-3xl w-full">
              <h1 class="text-xl sm:text-2xl font-bold text-gray-900 mb-5 leading-snug">{{ lesson.title }}</h1>
              <div class="prose prose-gray prose-sm max-w-none lesson-content" v-html="lesson.content" />
            </div>

            <!-- Mindmap section -->
            <div v-if="lesson.metadata?.mindmaps?.length" class="border-t border-gray-100">
              <!-- Section header -->
              <div class="px-4 sm:px-8 py-4 flex items-center gap-2">
                <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                  </svg>
                </div>
                <h2 class="text-sm font-bold text-gray-800">Mindmap hỗ trợ học tập</h2>
                <span class="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">{{ lesson.metadata.mindmaps.length }}</span>
              </div>

              <!-- Cards -->
              <div class="space-y-4 px-4 sm:px-8 pb-6">
                <div
                  v-for="(mm, idx) in lesson.metadata.mindmaps"
                  :key="mm.id || idx"
                  class="rounded-2xl border border-gray-200 overflow-hidden shadow-sm bg-white"
                >
                  <!-- Card header (toggle collapse) -->
                  <button
                    @click="toggleMindmap(idx)"
                    class="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100/60 active:opacity-80 transition-opacity"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-5 h-5 flex-shrink-0 bg-indigo-500 rounded text-white text-[10px] font-bold flex items-center justify-center">{{ idx + 1 }}</span>
                      <span class="text-sm font-semibold text-indigo-800 truncate">{{ mm.title || mm.treeData?.name || `Mindmap ${idx + 1}` }}</span>
                    </div>
                    <svg
                      class="w-4 h-4 text-indigo-400 flex-shrink-0 transition-transform duration-200"
                      :style="{ transform: collapsedMindmaps.has(idx) ? 'rotate(-90deg)' : 'rotate(0deg)' }"
                      fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <!-- Tree -->
                  <div v-if="!collapsedMindmaps.has(idx)" class="px-4 pt-4 pb-5">
                    <MindmapTree :treeData="mm.treeData" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Documents -->
            <div v-if="lesson.metadata?.documents?.length" class="border-t border-gray-100">
              <div class="px-4 sm:px-8 py-4 flex items-center gap-2">
                <div class="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <h2 class="text-sm font-bold text-gray-800">Tài liệu đính kèm</h2>
                <span class="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">{{ lesson.metadata.documents.length }}</span>
              </div>
              <div v-for="(doc, idx) in lesson.metadata.documents" :key="doc.mediaId" class="border-t border-gray-100">
                <div v-if="doc.title" class="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <span class="text-xs font-semibold text-gray-700">{{ doc.title }}</span>
                </div>
                <iframe :src="doc.url" class="w-full" style="height: 80vh; display: block;" />
              </div>
            </div>

            <!-- Bottom navigation (prev/next lesson) -->
            <div v-if="prevLesson || nextLesson" class="sticky bottom-0 z-10 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
              <button
                v-if="prevLesson"
                @click="navigateTo(`/courses/${route.params.courseSlug}/lessons/${prevLesson.slug}`)"
                class="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Bài trước
              </button>
              <div v-else />
              <button
                v-if="nextLesson"
                @click="navigateTo(`/courses/${route.params.courseSlug}/lessons/${nextLesson.slug}`)"
                class="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-all"
              >
                Bài tiếp theo
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <div v-else />
            </div>
          </template>

          <!-- ── QUIZ PANEL ── -->
          <div v-else class="flex-1 overflow-y-auto bg-gray-50">

            <!-- INTRO phase -->
            <div v-if="quizPhase === 'intro'" class="flex items-center justify-center min-h-full p-5 py-10">
              <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 max-w-md w-full">
                <div class="text-center mb-6">
                  <div class="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                    <svg class="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h2 class="text-lg font-bold text-gray-900 mb-0.5">Bài Tập</h2>
                  <p class="text-sm text-gray-500">{{ lesson.title }}</p>
                </div>

                <div class="space-y-2 mb-6">
                  <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div class="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-0.5">Số câu hỏi</p>
                      <p class="text-sm font-bold text-gray-900">{{ quizQuestions.length }} câu • {{ quizTotalPoints }} điểm</p>
                    </div>
                  </div>
                  <div v-if="quizTimeLimitMinutes" class="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div class="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 mb-0.5">Thời gian làm bài</p>
                      <p class="text-sm font-bold text-amber-700">{{ quizTimeLimitMinutes }} phút</p>
                    </div>
                  </div>
                </div>

                <!-- Previous attempt -->
                <div v-if="lastQuizAttempt" class="mb-5 p-4 rounded-xl border" :class="lastQuizAttempt.passed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'">
                  <p class="text-xs font-semibold text-gray-500 mb-2.5 flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Lần làm gần nhất
                  </p>
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      :class="lastQuizAttempt.passed ? 'bg-green-100' : 'bg-red-100'">
                      <span class="text-base font-extrabold" :class="lastQuizAttempt.passed ? 'text-green-600' : 'text-red-600'">
                        {{ lastQuizAttempt.score_percent }}%
                      </span>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-800">{{ lastQuizAttempt.correct_count }} / {{ lastQuizAttempt.total_questions }} câu đúng</p>
                      <p class="text-xs text-gray-500">Điểm: {{ lastQuizAttempt.earned_points }} / {{ lastQuizAttempt.total_points }}</p>
                      <p class="text-xs mt-0.5" :class="lastQuizAttempt.passed ? 'text-green-600' : 'text-red-500'">
                        {{ lastQuizAttempt.passed ? 'Đạt' : 'Chưa đạt' }} · {{ new Date(lastQuizAttempt.created_at).toLocaleDateString('vi-VN') }}
                      </p>
                    </div>
                  </div>
                </div>

                <button @click="startQuiz"
                  class="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md text-sm">
                  Bắt đầu làm bài
                </button>
              </div>
            </div>

            <!-- TAKING phase - vertical -->
            <div v-else-if="quizPhase === 'taking' && quizDisplayMode === 'vertical'" class="max-w-2xl mx-auto py-6 px-4">
              <!-- Status panel -->
              <div class="sticky top-14 z-10 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 mb-5 shadow-sm">
                <div class="flex items-center justify-between mb-2.5">
                  <span class="text-xs font-semibold text-gray-500">Trạng thái bài làm</span>
                  <span class="text-xs font-bold" :class="answeredCount === quizQuestions.length ? 'text-green-600' : 'text-indigo-600'">
                    {{ answeredCount }} / {{ quizQuestions.length }} câu đã làm
                  </span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="(q, idx) in quizQuestions" :key="q.id"
                    @click="scrollToQuestion(idx)"
                    :class="['w-8 h-8 rounded-full text-xs font-bold transition-all', isQuestionAnswered(q) ? 'bg-indigo-400 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300']"
                  >{{ idx + 1 }}</button>
                </div>
              </div>

              <div class="space-y-4">
                <div v-for="(question, qIndex) in quizQuestions" :key="question.id"
                  :id="`quiz-q-${qIndex}`"
                  class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm scroll-mt-36">
                  <div class="mb-4">
                    <span class="text-xs font-semibold text-indigo-600 mb-2 block">Câu {{ qIndex + 1 }} / {{ quizQuestions.length }} • {{ question.points }} điểm</span>
                    <div class="text-sm font-medium text-gray-900 leading-relaxed" v-html="question.questionText" />
                    <template v-if="question.media?.url">
                      <img v-if="question.media.type === 'image'" :src="question.media.url" class="mt-3 rounded-xl max-h-48 object-contain" />
                      <video v-else-if="question.media.type === 'video'" :src="question.media.url" controls preload="metadata" class="mt-3 rounded-xl w-full max-h-64 bg-black" />
                      <audio v-else-if="question.media.type === 'audio'" :src="question.media.url" controls class="mt-3 w-full" />
                    </template>
                  </div>
                  <div class="space-y-2">
                    <div v-for="option in question.options" :key="option.id"
                      @click="selectOption(question, option)"
                      :class="['flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all select-none',
                        isOptionSelected(question, option) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50']">
                      <div :class="['w-5 h-5 flex-shrink-0 flex items-center justify-center border-2 transition-all',
                        question.answerType === 'multiple' ? 'rounded' : 'rounded-full',
                        isOptionSelected(question, option) ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300']">
                        <div v-if="isOptionSelected(question, option)" :class="['bg-white', question.answerType === 'multiple' ? 'w-2.5 h-2.5 rounded-sm' : 'w-2 h-2 rounded-full']" />
                      </div>
                      <span class="text-sm text-gray-700">{{ option.text }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-center mt-6 pb-8">
                <button @click="handleSubmitClick" :disabled="submitting"
                  class="px-10 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 text-sm">
                  <span v-if="!submitting">Nộp bài</span>
                  <span v-else class="flex items-center gap-2">
                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Đang nộp...
                  </span>
                </button>
              </div>
            </div>

            <!-- TAKING phase - horizontal (slide) -->
            <div v-else-if="quizPhase === 'taking' && quizDisplayMode === 'horizontal'" class="flex items-center justify-center min-h-full p-4">
              <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 max-w-2xl w-full">
                <!-- Progress bar -->
                <div class="mb-4">
                  <div class="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>{{ currentSlide < quizQuestions.length ? `Câu ${currentSlide + 1} / ${quizQuestions.length}` : 'Hoàn tất' }}</span>
                    <span class="font-semibold" :class="answeredCount === quizQuestions.length ? 'text-green-600' : 'text-indigo-600'">
                      {{ answeredCount }} / {{ quizQuestions.length }} đã làm
                    </span>
                  </div>
                  <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                      :style="{ width: `${((currentSlide + 1) / (quizQuestions.length + 1)) * 100}%` }" />
                  </div>
                </div>

                <!-- Status circles -->
                <div class="flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-gray-100">
                  <button v-for="(q, idx) in quizQuestions" :key="q.id"
                    @click="currentSlide = idx"
                    :class="['w-8 h-8 rounded-full text-xs font-bold transition-all',
                      idx === currentSlide ? 'bg-rose-400 text-white scale-110 shadow-sm' :
                      isQuestionAnswered(q) ? 'bg-indigo-400 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300']"
                  >{{ idx + 1 }}</button>
                </div>

                <!-- Current question -->
                <div v-if="currentSlide < quizQuestions.length && currentQuizQuestion" class="mb-5 min-h-[200px]">
                  <span class="text-xs font-semibold text-indigo-600 mb-2 block">{{ currentQuizQuestion.points }} điểm</span>
                  <div class="text-sm font-medium text-gray-900 mb-4 leading-relaxed" v-html="currentQuizQuestion.questionText" />
                  <template v-if="currentQuizQuestion.media?.url">
                    <img v-if="currentQuizQuestion.media.type === 'image'" :src="currentQuizQuestion.media.url" class="mb-3 rounded-xl max-h-40 object-contain" />
                    <video v-else-if="currentQuizQuestion.media.type === 'video'" :src="currentQuizQuestion.media.url" controls preload="metadata" class="mb-3 rounded-xl w-full max-h-56 bg-black" />
                    <audio v-else-if="currentQuizQuestion.media.type === 'audio'" :src="currentQuizQuestion.media.url" controls class="mb-3 w-full" />
                  </template>
                  <div class="space-y-2">
                    <div v-for="option in currentQuizQuestion.options" :key="option.id"
                      @click="selectOption(currentQuizQuestion, option)"
                      :class="['flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all select-none',
                        isOptionSelected(currentQuizQuestion, option) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50']">
                      <div :class="['w-5 h-5 flex-shrink-0 flex items-center justify-center border-2 transition-all',
                        currentQuizQuestion.answerType === 'multiple' ? 'rounded' : 'rounded-full',
                        isOptionSelected(currentQuizQuestion, option) ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300']">
                        <div v-if="isOptionSelected(currentQuizQuestion, option)" :class="['bg-white', currentQuizQuestion.answerType === 'multiple' ? 'w-2.5 h-2.5 rounded-sm' : 'w-2 h-2 rounded-full']" />
                      </div>
                      <span class="text-sm text-gray-700">{{ option.text }}</span>
                    </div>
                  </div>
                </div>

                <!-- Last slide -->
                <div v-else class="text-center py-6 min-h-[200px] flex flex-col items-center justify-center">
                  <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
                    <svg class="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p class="text-sm font-semibold text-gray-800 mb-1">Bạn đã trả lời tất cả câu hỏi!</p>
                  <p class="text-xs text-gray-500">Nhấn Nộp bài để xem kết quả.</p>
                </div>

                <!-- Navigation -->
                <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <button @click="currentSlide--" :disabled="currentSlide === 0"
                    class="flex items-center gap-1.5 px-4 py-2 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-40 text-sm">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Trước
                  </button>
                  <button v-if="currentSlide < quizQuestions.length" @click="currentSlide++"
                    class="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm">
                    Tiếp
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button v-else @click="handleSubmitClick" :disabled="submitting"
                    class="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 text-sm">
                    {{ submitting ? 'Đang nộp...' : 'Nộp bài' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- SUBMITTED phase -->
            <div v-else-if="quizPhase === 'submitted'" class="max-w-2xl mx-auto py-6 px-4">
              <!-- Score card -->
              <div class="bg-white border border-gray-200 rounded-2xl p-6 mb-5 text-center shadow-sm">
                <div class="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                  :class="quizScorePercent >= 80 ? 'bg-green-100' : quizScorePercent >= 50 ? 'bg-yellow-100' : 'bg-red-100'">
                  <span class="text-2xl font-extrabold"
                    :class="quizScorePercent >= 80 ? 'text-green-600' : quizScorePercent >= 50 ? 'text-yellow-600' : 'text-red-600'">
                    {{ quizScorePercent }}%
                  </span>
                </div>
                <h2 class="text-lg font-bold text-gray-900 mb-0.5">{{ store.student?.fullName || 'Học viên' }}</h2>
                <p class="text-gray-600 text-sm mb-0.5">
                  Điểm: <span class="font-bold text-gray-900">{{ quizEarnedPoints }} / {{ quizTotalPoints }}</span>
                </p>
                <p class="text-gray-500 text-xs">Đúng {{ quizCorrectCount }} / {{ quizQuestions.length }} câu</p>
                <button @click="resetQuiz"
                  class="mt-4 px-6 py-2 border border-indigo-200 text-indigo-700 font-semibold text-sm rounded-xl hover:bg-indigo-50 transition-colors">
                  Làm lại
                </button>
              </div>

              <!-- Answer review -->
              <div v-if="quizShowResultMode === 'score_and_answers'" class="space-y-3 pb-8">
                <h3 class="text-sm font-semibold text-gray-700 mb-2">Xem lại đáp án</h3>
                <div v-for="(q, idx) in quizQuestions" :key="q.id"
                  :class="['bg-white rounded-2xl border-2 p-4 shadow-sm', isQuizQuestionCorrect(q) ? 'border-green-300' : 'border-red-200']">
                  <div class="flex items-start gap-3 mb-3">
                    <div :class="['w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', isQuizQuestionCorrect(q) ? 'bg-green-500' : 'bg-red-400']">
                      <svg v-if="isQuizQuestionCorrect(q)" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <svg v-else class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <span class="text-xs text-gray-400">Câu {{ idx + 1 }} • {{ q.points }} điểm</span>
                      <div class="text-sm font-medium text-gray-900 mt-0.5 leading-relaxed" v-html="q.questionText" />
                      <template v-if="q.media?.url">
                        <img v-if="q.media.type === 'image'" :src="q.media.url" class="mt-2 rounded-lg max-h-32 object-contain" />
                        <video v-else-if="q.media.type === 'video'" :src="q.media.url" controls preload="metadata" class="mt-2 rounded-lg w-full max-h-48 bg-black" />
                        <audio v-else-if="q.media.type === 'audio'" :src="q.media.url" controls class="mt-2 w-full" />
                      </template>
                    </div>
                  </div>
                  <div class="space-y-1.5 ml-9">
                    <div v-for="opt in q.options" :key="opt.id"
                      :class="['flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
                        opt.isCorrect && isOptionSelected(q, opt) ? 'bg-green-100 text-green-700 border border-green-300' :
                        opt.isCorrect ? 'bg-green-50 text-green-700 border border-green-200' :
                        isOptionSelected(q, opt) ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-gray-50 text-gray-500 border border-gray-100']">
                      <svg v-if="opt.isCorrect" class="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      <svg v-else-if="isOptionSelected(q, opt)" class="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                      <div v-else class="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{{ opt.text }}</span>
                      <span v-if="opt.isCorrect" class="ml-auto text-green-600 font-semibold">Đáp án đúng</span>
                      <span v-else-if="isOptionSelected(q, opt)" class="ml-auto text-red-500">Bạn chọn</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          <!-- end quiz panel -->

        </div>
        <!-- end left column -->

        <!-- Sidebar: lesson list (desktop only) -->
        <div class="hidden lg:flex flex-col w-80 xl:w-96 flex-shrink-0 border-l border-gray-100 sticky top-14 h-[calc(100vh-3.5rem)] overflow-hidden">
          <div class="px-4 py-4 border-b border-gray-100 flex-shrink-0">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Nội dung khóa học</p>
            <p class="text-sm font-bold text-gray-800 truncate">{{ courseName }}</p>
            <div class="mt-3">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs text-gray-500">Tiến độ</span>
                <span class="text-xs font-semibold text-indigo-600">{{ completedLessonIds.length }} / {{ allLessons.length }} bài</span>
              </div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  :style="{ width: `${progressPercent}%` }" />
              </div>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto">
            <template v-for="chapter in groupedLessons" :key="chapter.id">
              <div v-if="chapter.title" class="px-4 py-2.5 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider truncate">{{ chapter.title }}</p>
              </div>
              <div v-for="l in chapter.lessons" :key="l.id" class="border-b border-gray-50">
                <div class="flex items-start gap-3 px-4 py-2.5 border-l-2 transition-colors"
                  :class="l.slug === route.params.lessonSlug ? 'border-l-indigo-500 bg-indigo-50/60' : 'border-l-transparent'">
                  <div class="mt-0.5 flex-shrink-0">
                    <div v-if="completedLessonIds.includes(l.id)" class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <div v-else-if="l.slug === route.params.lessonSlug" class="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <div class="w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div v-else class="w-5 h-5 border-2 border-gray-200 rounded-full" />
                  </div>
                  <span class="text-sm leading-snug"
                    :class="l.slug === route.params.lessonSlug ? 'font-semibold text-indigo-700' : 'text-gray-600 font-medium'">
                    {{ l.title }}
                  </span>
                </div>
                <div class="pl-12 pb-2 flex flex-col gap-0.5">
                  <NuxtLink
                    v-if="l.metadata?.lesson_type !== 'exam'"
                    :to="`/courses/${route.params.courseSlug}/lessons/${l.slug}`"
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    :class="l.slug === route.params.lessonSlug && !route.query.tab
                      ? 'bg-indigo-100 text-indigo-700 font-semibold ring-1 ring-indigo-300'
                      : completedLessonIds.includes(l.id) ? 'text-green-600 hover:bg-green-50' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'"
                  >
                    <svg v-if="completedLessonIds.includes(l.id)" class="w-3.5 h-3.5 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    Bài Học
                  </NuxtLink>
                  <NuxtLink
                    v-if="l.metadata?.quiz?.quizQuestionList?.length"
                    :to="`/courses/${route.params.courseSlug}/lessons/${l.slug}?tab=quiz`"
                    class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    :class="l.slug === route.params.lessonSlug && route.query.tab === 'quiz'
                      ? 'bg-amber-100 text-amber-700 font-semibold ring-1 ring-amber-300'
                      : passedQuizLessonIds.includes(l.id) ? 'text-green-600 hover:bg-green-50' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'"
                  >
                    <svg v-if="passedQuizLessonIds.includes(l.id)" class="w-3.5 h-3.5 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                    Bài Tập
                    <span class="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      :class="passedQuizLessonIds.includes(l.id) ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'">
                      {{ l.metadata.quiz.quizQuestionList.length }}
                    </span>
                  </NuxtLink>
                </div>
              </div>
            </template>
          </div>
        </div>

      </div>
    </template>
  </div>

  <!-- Submit confirmation dialog -->
  <Teleport to="body">
    <div v-if="showSubmitConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showSubmitConfirm = false" />
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div class="flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 mx-auto mb-4">
          <svg class="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 class="text-base font-bold text-gray-900 text-center mb-1">Còn câu hỏi chưa làm</h3>
        <p class="text-sm text-gray-500 text-center mb-5">
          Bạn còn <span class="font-semibold text-amber-600">{{ quizQuestions.length - answeredCount }} câu</span> chưa trả lời. Bạn có chắc muốn nộp bài không?
        </p>
        <div class="flex gap-3">
          <button @click="showSubmitConfirm = false"
            class="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors">
            Quay lại
          </button>
          <button @click="showSubmitConfirm = false; submitQuiz()"
            class="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all">
            Nộp bài
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
definePageMeta({ layout: 'blank' })

import { useStudyStore } from '~/composables/useStudyStore'
import { useLmsStudent } from '~/composables/useLmsStudent'
import { useOfflineLesson, withTimeout } from '~/composables/useOfflineLesson'

const store = useStudyStore()
const { validateSession } = useLmsStudent()
const { getOfflineLesson, getOfflineObjectUrls, applyObjectUrls } = useOfflineLesson()
const route = useRoute()

const isOfflineMode = ref(false)
let objectUrlMap = new Map()

// Mindmap collapse state (all expanded by default)
const collapsedMindmaps = ref(new Set())
const toggleMindmap = (idx) => {
  const s = new Set(collapsedMindmaps.value)
  s.has(idx) ? s.delete(idx) : s.add(idx)
  collapsedMindmaps.value = s
}

// State
const lesson = ref(null)
const allLessons = ref([])
const chapters = ref([])
const isCompleted = ref(false)
const completing = ref(false)
const loading = ref(true)
const courseName = ref('')
const activeVideoIdx = ref(0)
const completedLessonIds = ref([])
const passedQuizLessonIds = ref([])

// Quiz state
const quizPhase = ref('intro')
const quizAnswers = reactive({})
const currentSlide = ref(0)
const submitting = ref(false)
const showSubmitConfirm = ref(false)
const quizEarnedPoints = ref(0)
const quizCorrectCount = ref(0)
const lastQuizAttempt = ref(null)

const isExamLesson = computed(() => lesson.value?.metadata?.lesson_type === 'exam')
const showQuizPanel = computed(() => route.query.tab === 'quiz' || isExamLesson.value)

const quiz = computed(() => lesson.value?.metadata?.quiz)
const quizQuestions = computed(() => quiz.value?.quizQuestionList || [])
const hasQuiz = computed(() => quizQuestions.value.length > 0)
const quizDisplayMode = computed(() => quiz.value?.displayMode || 'vertical')
const quizShowResultMode = computed(() => quiz.value?.showResultMode || 'score_and_answers')
const quizTimeLimitMinutes = computed(() => quiz.value?.timeLimitMinutes || null)
const quizTotalPoints = computed(() => quizQuestions.value.reduce((s, q) => s + (q.points || 0), 0))
const quizScorePercent = computed(() => quizTotalPoints.value > 0 ? Math.round((quizEarnedPoints.value / quizTotalPoints.value) * 100) : 0)
const currentQuizQuestion = computed(() => quizQuestions.value[currentSlide.value])

const isQuestionAnswered = (question) => {
  const ans = quizAnswers[question.id]
  if (!ans) return false
  return question.answerType === 'multiple' ? (ans.selected?.length > 0) : ans.selected !== null
}
const answeredCount = computed(() => quizQuestions.value.filter(q => isQuestionAnswered(q)).length)
const scrollToQuestion = (idx) => {
  document.getElementById(`quiz-q-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Timer
const timeRemaining = ref(0)
const isTimeLow = computed(() => timeRemaining.value > 0 && timeRemaining.value <= 60)
const formattedTime = computed(() => {
  const m = Math.floor(timeRemaining.value / 60)
  const s = timeRemaining.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})
let timerInterval = null

const initQuizAnswers = () => {
  quizQuestions.value.forEach(q => {
    quizAnswers[q.id] = { selected: q.answerType === 'multiple' ? [] : null }
  })
}

const isOptionSelected = (question, option) => {
  const ans = quizAnswers[question.id]
  if (!ans) return false
  return question.answerType === 'multiple' ? ans.selected?.includes(option.id) : ans.selected === option.id
}

const selectOption = (question, option) => {
  const ans = quizAnswers[question.id]
  if (!ans) return
  if (question.answerType === 'multiple') {
    const idx = ans.selected.indexOf(option.id)
    if (idx > -1) ans.selected.splice(idx, 1)
    else ans.selected.push(option.id)
  } else {
    ans.selected = option.id
  }
}

const isQuizQuestionCorrect = (q) => {
  const ans = quizAnswers[q.id]
  if (!ans) return false
  const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id)
  if (q.answerType === 'multiple') {
    const sel = ans.selected || []
    return correctIds.length === sel.length && correctIds.every(id => sel.includes(id))
  }
  return ans.selected !== null && correctIds.includes(ans.selected)
}

const startQuiz = () => {
  initQuizAnswers()
  currentSlide.value = 0
  quizPhase.value = 'taking'
  if (quizTimeLimitMinutes.value) {
    timeRemaining.value = quizTimeLimitMinutes.value * 60
    timerInterval = setInterval(() => {
      if (timeRemaining.value <= 1) {
        clearInterval(timerInterval); timerInterval = null
        timeRemaining.value = 0
        submitQuiz()
      } else {
        timeRemaining.value--
      }
    }, 1000)
  }
}

const handleSubmitClick = () => {
  if (answeredCount.value < quizQuestions.value.length) showSubmitConfirm.value = true
  else submitQuiz()
}

const submitQuiz = async () => {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  let points = 0; let correct = 0
  quizQuestions.value.forEach(q => {
    if (isQuizQuestionCorrect(q)) { points += q.points || 0; correct++ }
  })
  quizEarnedPoints.value = points
  quizCorrectCount.value = correct
  quizPhase.value = 'submitted'

  const total = quizTotalPoints.value
  const percent = total > 0 ? Math.round((points / total) * 100) : 0
  const passingScore = quiz.value?.passingScore ?? 0
  const passed = percent >= passingScore

  lastQuizAttempt.value = {
    score_percent: percent, earned_points: points, total_points: total,
    correct_count: correct, total_questions: quizQuestions.value.length,
    passed, created_at: new Date().toISOString(),
  }

  if (!store.sessionToken || !lesson.value) return
  try {
    await $fetch('/api/lms/quiz-attempt', {
      method: 'POST',
      body: {
        sessionToken: store.sessionToken,
        lessonId: lesson.value.id,
        earnedPoints: points, totalPoints: total,
        scorePercent: percent, correctCount: correct,
        totalQuestions: quizQuestions.value.length,
        passed, passingScore,
        answers: Object.fromEntries(Object.entries(quizAnswers).map(([k, v]) => [k, v.selected])),
      },
    })
    if (passed && !passedQuizLessonIds.value.includes(lesson.value.id)) {
      passedQuizLessonIds.value = [...passedQuizLessonIds.value, lesson.value.id]
    }
  } catch {}
}

const resetQuiz = () => {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  quizPhase.value = 'intro'
  currentSlide.value = 0
  quizEarnedPoints.value = 0
  quizCorrectCount.value = 0
  timeRemaining.value = 0
}

watch(() => route.query.tab, (newTab, oldTab) => {
  if (newTab === 'quiz' && oldTab !== 'quiz') resetQuiz()
  if (oldTab === 'quiz' && timerInterval) { clearInterval(timerInterval); timerInterval = null }
})

onMounted(async () => {
  if (!store.orgSlug) return navigateTo('/connect')
  if (!store.sessionToken) return navigateTo('/login')

  if (!navigator.onLine) {
    const key = `${store.orgSlug}/${route.params.courseSlug}/${route.params.lessonSlug}`
    const offlineData = await getOfflineLesson(key)
    if (offlineData) {
      objectUrlMap = await getOfflineObjectUrls(key)
      const data = applyObjectUrls(offlineData, objectUrlMap)
      lesson.value = data.lesson
      courseName.value = data.course?.title || ''
      chapters.value = data.chapters || []
      allLessons.value = data.allLessons || []
      isOfflineMode.value = true
    }
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

    const { lesson: lessonData, course: courseData, allLessons: lessonsData, chapters: chaptersData } = await withTimeout(
      $fetch('/api/lms/lesson-detail', {
        query: {
          orgSlug: store.orgSlug,
          courseSlug: route.params.courseSlug,
          lessonSlug: route.params.lessonSlug,
        },
        headers: { 'x-lms-session': store.sessionToken },
      }),
      8000,
    )

    lesson.value = lessonData
    courseName.value = courseData?.title || ''
    chapters.value = chaptersData || []
    allLessons.value = lessonsData || []

    try {
      const { completedLessonIds: ids, passedQuizLessonIds: passedIds } = await $fetch('/api/lms/student-progress', {
        headers: { 'x-lms-session': store.sessionToken },
      })
      completedLessonIds.value = ids || []
      passedQuizLessonIds.value = passedIds || []
      isCompleted.value = ids.includes(lesson.value.id)
    } catch { isCompleted.value = false }

    try {
      const { attempt } = await $fetch('/api/lms/quiz-attempt-latest', {
        headers: { 'x-lms-session': store.sessionToken },
        query: { lessonId: lesson.value.id },
      })
      lastQuizAttempt.value = attempt
    } catch {}
  } catch (e) {
    const isNetworkErr = (e?.message === 'network-timeout') || !navigator.onLine
    if (isNetworkErr) {
      const key = `${store.orgSlug}/${route.params.courseSlug}/${route.params.lessonSlug}`
      const offlineData = await getOfflineLesson(key)
      if (offlineData) {
        objectUrlMap = await getOfflineObjectUrls(key)
        const data = applyObjectUrls(offlineData, objectUrlMap)
        lesson.value = data.lesson
        courseName.value = data.course?.title || ''
        chapters.value = data.chapters || []
        allLessons.value = data.allLessons || []
        isOfflineMode.value = true
      } else {
        lesson.value = null
      }
    } else {
      console.error('[LessonDetail] Failed to load:', e)
      lesson.value = null
    }
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
  for (const objUrl of objectUrlMap.values()) URL.revokeObjectURL(objUrl)
})

const currentIndex = computed(() => allLessons.value.findIndex(l => l.slug === route.params.lessonSlug))
const prevLesson = computed(() => currentIndex.value > 0 ? allLessons.value[currentIndex.value - 1] : null)
const nextLesson = computed(() => currentIndex.value < allLessons.value.length - 1 ? allLessons.value[currentIndex.value + 1] : null)
const progressPercent = computed(() => allLessons.value.length ? Math.round((completedLessonIds.value.length / allLessons.value.length) * 100) : 0)

const groupedLessons = computed(() => {
  if (chapters.value.length === 0) return [{ id: 'root', title: '', lessons: allLessons.value }]
  const chapterMap = new Map(chapters.value.map(c => [c.id, { ...c, lessons: [] }]))
  const noChapter = { id: 'root', title: '', lessons: [] }
  for (const l of allLessons.value) {
    if (l.chapter_id && chapterMap.has(l.chapter_id)) chapterMap.get(l.chapter_id).lessons.push(l)
    else noChapter.lessons.push(l)
  }
  const result = [...chapterMap.values()].sort((a, b) => a.sort_order - b.sort_order)
  if (noChapter.lessons.length) result.unshift(noChapter)
  return result
})

const markComplete = async () => {
  if (!store.sessionToken || !lesson.value) return
  completing.value = true
  try {
    await $fetch('/api/lms/lesson-progress', {
      method: 'POST',
      body: { sessionToken: store.sessionToken, lessonId: lesson.value.id },
    })
    isCompleted.value = true
    if (!completedLessonIds.value.includes(lesson.value.id)) {
      completedLessonIds.value = [...completedLessonIds.value, lesson.value.id]
    }
  } catch {}
  completing.value = false
}
</script>

<style scoped>
.lesson-content :deep(h1) { font-size: 1.5em; font-weight: 700; margin: 1em 0 0.5em; color: #111827; }
.lesson-content :deep(h2) { font-size: 1.25em; font-weight: 700; margin: 0.9em 0 0.4em; color: #1f2937; }
.lesson-content :deep(h3) { font-size: 1.1em; font-weight: 600; margin: 0.7em 0 0.3em; color: #374151; }
.lesson-content :deep(p) { margin: 0.7em 0; color: #374151; line-height: 1.75; }
.lesson-content :deep(ul) { list-style-type: disc; padding-left: 1.75em; margin: 0.6em 0; color: #374151; }
.lesson-content :deep(ol) { list-style-type: decimal; padding-left: 1.75em; margin: 0.6em 0; color: #374151; }
.lesson-content :deep(li) { margin: 0.3em 0; line-height: 1.65; }
.lesson-content :deep(blockquote) { border-left: 4px solid #6366f1; padding: 0.75em 1.25em; background: #f5f3ff; border-radius: 0 0.5rem 0.5rem 0; color: #4b5563; margin: 1em 0; font-style: italic; }
.lesson-content :deep(img) { max-width: 100%; border-radius: 0.75rem; margin: 1em 0; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.lesson-content :deep(strong) { font-weight: 700; color: #111827; }
.lesson-content :deep(code) { background: #f3f4f6; padding: 0.15em 0.4em; border-radius: 0.3em; font-size: 0.875em; color: #7c3aed; font-family: ui-monospace, monospace; }
.lesson-content :deep(pre) { background: #1e1e2e; color: #cdd6f4; padding: 1.25em; border-radius: 0.75rem; overflow-x: auto; margin: 1em 0; font-size: 0.875em; line-height: 1.65; }
.lesson-content :deep(pre code) { background: none; padding: 0; color: inherit; font-size: inherit; }
.lesson-content :deep(table) { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 0.875em; overflow-x: auto; display: block; }
.lesson-content :deep(th) { background: #f9fafb; font-weight: 700; text-align: left; padding: 0.6em 0.9em; border: 1px solid #e5e7eb; color: #111827; }
.lesson-content :deep(td) { padding: 0.55em 0.9em; border: 1px solid #e5e7eb; color: #374151; }
.lesson-content :deep(a) { color: #4f46e5; text-decoration: underline; }
.lesson-content :deep(hr) { border: none; border-top: 2px solid #e5e7eb; margin: 1.5em 0; }
</style>
