import type { FC } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import type { Locale } from '../translations'

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'ENG' },
  { code: 'ar', label: 'AR' },
  { code: 'fr', label: 'FR' },
]

export const LanguageSwitcher: FC = () => {
  const { locale, setLocale } = useLanguage()

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-gray-100 border border-gray-200">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`px-2.5 py-1 text-sm font-medium rounded-md transition-colors ${
            locale === code
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
