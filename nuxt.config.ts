export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@pinia/nuxt', '@vite-pwa/nuxt'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    apiBase: '',  // overridden by NUXT_API_BASE env var (server-only)
  },

  supabase: {
    redirect: false,
  },

  pwa: {
    manifest: {
      name: 'Hasagi Study',
      short_name: 'Hasagi Study',
      description: 'Ứng dụng học tập Hasagi',
      theme_color: '#6366f1',
      background_color: '#f8fafc',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,svg}'],
    },
    devOptions: {
      enabled: false,
    },
  },

  compatibilityDate: '2024-11-01',
})
