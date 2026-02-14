import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ar from './locales/ar.json'
import fr from './locales/fr.json'

const STORAGE_KEY = 'vaccitrack_locale'
const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
const lng = saved === 'en' || saved === 'ar' || saved === 'fr' ? saved : 'ar'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    fr: { translation: fr },
  },
  lng,
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
})

export default i18n
