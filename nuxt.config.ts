import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', '@pinia/nuxt', '@vite-pwa/nuxt'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    apiBase: '',  // overridden by NUXT_API_BASE env var (server-only)
  },

  supabase: {
    redirect: false,
  },

  // Pre-render / so Nitro outputs index.html → Workbox pre-caches it → app shell
  // available offline immediately after SW installs (no prior online visit needed)
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },

  pwa: {
    // Auto-update: new SW skips waiting and claims all clients immediately
    registerType: 'autoUpdate',
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
      // index.html (pre-rendered above) is in precache → navigateFallback serves it
      // for ALL navigation requests offline (Vue Router handles routing client-side)
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
    },
    devOptions: {
      enabled: false,
    },
  },

  app: {
    head: {
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'icon', type: 'image/png', href: '/icons/favicon.png' },
      ],
      meta: [
        { name: 'theme-color', content: '#ffffff' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      ],
    },
  },

  compatibilityDate: '2024-11-01',
})
