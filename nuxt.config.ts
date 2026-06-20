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
      theme_color: '#4CA771',
      background_color: '#EAF9E7',
      display: 'standalone',
      orientation: 'portrait',
      start_url: '/',
      icons: [
        { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
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

  app: {
    head: {
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
    },
  },

  compatibilityDate: '2024-11-01',
})
