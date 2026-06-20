# Hasagi Study — PWA App (Nuxt 3)

## Context

Tạo một standalone Nuxt 3 PWA app tên **Hasagi Study** tại `c:\MyFiles\Working\Hasagi AI\HasagiStudy`. Người dùng cài app lên điện thoại, nhập slug của tổ chức để kết nối, đăng nhập bằng tài khoản student, sau đó học các khóa học. Session và org được persist qua `localStorage`. Backend là Supabase + API endpoints của app Hasagi AI chính (gọi qua `NUXT_PUBLIC_API_BASE_URL`).

---

## Tech Stack

- **Nuxt 3** + **TailwindCSS** + **Pinia**
- **`@vite-pwa/nuxt`** — service worker, manifest, install prompt
- **`@nuxtjs/supabase`** — Supabase client (public anon key) để read org/course/lesson data
- **`@pinia/nuxt`** — state management với localStorage persistence
- API calls `/api/lms/*` → `${NUXT_PUBLIC_API_BASE_URL}/api/lms/...`

---

## Project Structure

```
c:\MyFiles\Working\Hasagi AI\HasagiStudy\
├── nuxt.config.ts
├── package.json
├── tailwind.config.ts
├── app.vue
├── assets/css/main.css
├── public/
│   └── icons/           ← icon-192.png, icon-512.png (placeholder)
├── layouts/
│   ├── default.vue      ← với bottom nav bar (Khóa học / Hồ sơ)
│   └── blank.vue        ← không có nav (onboarding, login)
├── composables/
│   ├── useLmsStudent.ts ← adapted từ main app (API calls dùng apiBase)
│   └── useStudyStore.ts ← Pinia store, persist orgSlug + session
├── pages/
│   ├── index.vue                                    ← redirect logic
│   ├── connect.vue                                  ← nhập org slug
│   ├── login.vue                                    ← đăng nhập
│   ├── courses/
│   │   ├── index.vue                                ← danh sách khóa học (home)
│   │   └── [courseSlug]/
│   │       ├── index.vue                            ← chi tiết khoá, chương, bài
│   │       └── lessons/
│   │           └── [lessonSlug].vue                 ← bài học + quiz
│   └── settings.vue                                 ← hồ sơ, đổi org, đăng xuất
```

---

## Files to Create

### `package.json`
```json
{
  "name": "hasagi-study",
  "private": true,
  "scripts": { "dev": "nuxt dev", "build": "nuxt build", "generate": "nuxt generate" },
  "dependencies": {
    "nuxt": "^3.13.0",
    "@nuxtjs/supabase": "^1.3.4",
    "@pinia/nuxt": "^0.5.1",
    "pinia": "^2.1.7",
    "@vite-pwa/nuxt": "^0.10.5",
    "@tailwindcss/typography": "^0.5.15"
  },
  "devDependencies": {
    "@nuxtjs/tailwindcss": "^6.12.0"
  }
}
```

### `nuxt.config.ts`
Key config:
```ts
modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@pinia/nuxt', '@vite-pwa/nuxt']

runtimeConfig: {
  public: {
    apiBase: '',        // NUXT_PUBLIC_API_BASE env var (e.g. http://localhost:3000)
    supabaseUrl: '',    // same keys as main app
    supabaseKey: '',
  }
}

supabase: { redirect: false }  // disable auto-redirect (we manage auth ourselves)

pwa: {
  manifest: {
    name: 'Hasagi Study',
    short_name: 'Hasagi Study',
    theme_color: '#6366f1',
    background_color: '#f8fafc',
    display: 'standalone',
    orientation: 'portrait',
    icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }, { src: '/icons/icon-512.png', sizes: '512x512' }]
  },
  workbox: { navigateFallback: '/', globPatterns: ['**/*.{js,css,html,ico,png,svg}'] }
}
```

### `.env`
```
NUXT_PUBLIC_API_BASE=http://localhost:3000
NUXT_PUBLIC_SUPABASE_URL=<same as main app>
NUXT_PUBLIC_SUPABASE_KEY=<same as main app>
```

---

### `composables/useStudyStore.ts`
Pinia store với persistence:
```ts
export const useStudyStore = defineStore('study', {
  state: () => ({
    orgSlug: null as string | null,
    orgName: '',
    orgLogo: '',
    orgDescription: '',
    sessionToken: null as string | null,
    student: null as { id, fullName, username, avatarUrl } | null,
  }),
  actions: {
    setOrg(slug, name, logo, description) { ... localStorage persist },
    setSession(token, student) { ... localStorage persist },
    clearSession() { ... },
    clearAll() { ... },          // logout + change org
    loadFromStorage() { ... },   // called in app.vue onMounted
  }
})
```

### `composables/useLmsStudent.ts`
Adapted từ main app. Thay vì dùng Nuxt plugin `$supabase.auth`, dùng API base:
```ts
const login = async (orgSlug, username, password) => {
  const { data } = await $fetch(`${apiBase}/api/lms/student-login`, {
    method: 'POST', body: { orgSlug, username, password }
  })
  return data  // { sessionToken, student }
}

const validateSession = async (token) => {
  const { student } = await $fetch(`${apiBase}/api/lms/student-session`, {
    method: 'POST', body: { sessionToken: token }
  })
  return student
}
```

---

### `pages/index.vue` — Redirect logic
```
onMounted:
  loadFromStorage()
  if (!orgSlug) → navigateTo('/connect')
  else if (!sessionToken) → navigateTo('/login')
  else validateSession(token)
    success → navigateTo('/courses')
    fail → clearSession() → navigateTo('/login')
```

### `pages/connect.vue` — Kết nối tổ chức (`layout: blank`)
- Full-screen gradient background indigo→purple
- App logo + "Hasagi Study"
- Input: "Nhập slug tổ chức" + nút "Kết nối"
- Khi nhập xong: query Supabase `lms_organizations` bằng slug
- Show org card: logo (page_config.header.logo || avatar_url), tên, mô tả
- Nút "Tiếp tục" → `setOrg(...)` → `navigateTo('/login')`
- Link "Quét QR" (disabled, placeholder cho future)

### `pages/login.vue` — Đăng nhập (`layout: blank`)
- Header: org logo + tên nhỏ + nút "Đổi tổ chức" (→ /connect)
- Form: username (có icon), password (có icon + toggle visibility)
- Nút "Đăng nhập" với loading state
- On success: `setSession(token, student)` → `navigateTo('/courses')`
- Show lỗi inline nếu sai

### `pages/courses/index.vue` — Danh sách khóa học (`layout: default`)
- Header: logo org nhỏ + "Xin chào, {firstName}" + avatar student
- Fetch `GET ${apiBase}/api/lms/student-courses` với header `x-lms-session`
- Course cards:
  - Ảnh bìa `object-contain` + gradient overlay
  - Tên khóa, số bài hoàn thành / tổng
  - Progress bar màu indigo
  - Badge "Đã hoàn thành" nếu 100%
- Pull-to-refresh (swipe down → refetch)
- Empty state nếu chưa có enrollment

### `pages/courses/[courseSlug]/index.vue` — Chi tiết khóa học
- Back button + tên khóa
- Hero image (cover_url) `aspect-video object-contain`
- Progress tổng (% hoàn thành)
- Danh sách chapters → lessons (accordion)
- Mỗi lesson item: icon loại (bài học / bài tập / kiểm tra / flashcard), tên, trạng thái (✓ xong / 🔒 chưa / đang xem)
- Tap lesson → `navigateTo('/courses/slug/lessons/slug')`

### `pages/courses/[courseSlug]/lessons/[lessonSlug].vue` — Bài học + Quiz
- Header: nút Back, tên bài, nút "Hoàn thành" (nếu chưa xong)
- Tabs: "Bài học" / "Bài tập" (ẩn "Bài học" nếu `lesson_type === 'exam'`)
- **Bài học tab**: nội dung HTML (`v-html`), video player (nếu có)
- **Bài tập tab**: tương đương quiz panel của main app
  - Intro card: số câu, thời gian, lastQuizAttempt (nếu có)
  - Taking: vertical mode (scroll) hoặc horizontal (swipe)
  - Status circles (numbered bubbles)
  - Confirm dialog khi nộp nếu còn câu chưa làm
  - Submitted: score card + review đáp án

### `pages/settings.vue` — Hồ sơ & Cài đặt (`layout: default`)
- Student avatar + fullName + username
- Org info card: logo, tên, slug
- Section "Tài khoản":
  - Nút "Đăng xuất" (red) → `clearSession()` → `/login`
- Section "Tổ chức":
  - Nút "Đổi tổ chức" → `clearAll()` → `/connect`

### `layouts/default.vue` — Layout chính
- `<slot />` cho nội dung
- **Bottom navigation bar** (fixed, h-16):
  - Khóa học (book icon) → `/courses`
  - Hồ sơ (user icon) → `/settings`
  - Active tab: filled icon + indigo text + dot indicator

### `layouts/blank.vue`
```html
<template><div><slot /></div></template>
```

---

## Reused Patterns from Main App

- **Session storage keys**: `lms_session_${orgSlug}`, `lms_student_${orgSlug}` — kept identical so sessions are cross-compatible
- **Quiz logic**: copy `quizPhase`, `quizAnswers`, `isQuestionAnswered`, `answeredCount`, `scrollToQuestion`, `handleSubmitClick`, `submitQuiz`, `resetQuiz` from main app's lesson page
- **API endpoints**: tất cả `/api/lms/*` endpoints giữ nguyên, chỉ thêm `apiBase` prefix

---

## Verification

1. `cd HasagiStudy && npm install && npm run dev` — app starts at port 3001
2. Mở trình duyệt, nhập org slug → org hiện ra → đăng nhập → thấy danh sách khóa học
3. Click vào khóa → thấy chapters/lessons → click bài học → thấy nội dung + quiz
4. Trên Chrome DevTools → Application → Manifest: xác nhận PWA manifest đúng
5. Chrome → "Install Hasagi Study" → app cài thành công, mở ở standalone mode
6. Reload app → không cần nhập lại org/login (session persist)
7. Vào Settings → Đăng xuất → về màn hình login → Đổi tổ chức → về connect screen
