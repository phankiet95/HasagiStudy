import en from '~/locales/en.json'
import vi from '~/locales/vi.json'
import ja from '~/locales/ja.json'
import ko from '~/locales/ko.json'
import zh from '~/locales/zh.json'

const MESSAGES = { en, vi, ja, ko, zh } as const
const LOCALE_KEY = 'app_locale'
const DEFAULT_LOCALE = 'vi'

// Module-level singleton — reactive across all component imports
const locale = ref<string>(DEFAULT_LOCALE)

function resolve(obj: any, path: string): string {
  const val = path.split('.').reduce((o, k) => o?.[k], obj)
  return typeof val === 'string' ? val : path
}

export const availableLocales = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English',    flag: '🇺🇸' },
  { code: 'ja', name: '日本語',      flag: '🇯🇵' },
  { code: 'ko', name: '한국어',      flag: '🇰🇷' },
  { code: 'zh', name: '中文',        flag: '🇨🇳' },
]

export function useAppLocale() {
  const t = (key: string, params?: Record<string, string | number>): string => {
    const messages = MESSAGES[locale.value as keyof typeof MESSAGES] ?? MESSAGES[DEFAULT_LOCALE]
    let text = resolve(messages, key)
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      }
    }
    return text
  }

  const setLocale = (code: string) => {
    if (code in MESSAGES) {
      locale.value = code
      try { localStorage.setItem(LOCALE_KEY, code) } catch {}
    }
  }

  const initLocale = () => {
    try {
      const saved = localStorage.getItem(LOCALE_KEY)
      if (saved && saved in MESSAGES) locale.value = saved
    } catch {}
  }

  return { locale, t, setLocale, initLocale, availableLocales }
}
