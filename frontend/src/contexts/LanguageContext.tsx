import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import i18n from '../i18n'
import { getDir, type Locale } from '../translations'

const STORAGE_KEY = 'vaccitrack_locale'

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'ar'
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
  if (stored && (stored === 'en' || stored === 'ar' || stored === 'fr')) return stored
  return 'ar'
}

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  dir: 'rtl' | 'ltr'
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)
  const dir = getDir(locale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(STORAGE_KEY, newLocale)
    i18n.changeLanguage(newLocale)
  }, [])

  useEffect(() => {
    document.documentElement.lang = i18n.language || 'ar'
    document.documentElement.dir = dir
  }, [locale, dir])
  const value: LanguageContextValue = { locale, setLocale, dir }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
