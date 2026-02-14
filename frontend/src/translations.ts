export type Locale = 'en' | 'ar' | 'fr'

export const translations = {
  en: {
    nav: {
      features: 'Features',
      howItWorks: 'How It Works',
      about: 'About',
      signIn: 'Sign In',
      dashboard: 'Dashboard',
      logOut: 'Log Out',
    },
  },
  ar: {
    nav: {
      features: 'المميزات',
      howItWorks: 'كيف يعمل',
      about: 'من نحن',
      signIn: 'تسجيل الدخول',
      dashboard: 'لوحة التحكم',
      logOut: 'تسجيل الخروج',
    },
  },
  fr: {
    nav: {
      features: 'Fonctionnalités',
      howItWorks: 'Comment ça marche',
      about: 'À propos',
      signIn: 'Connexion',
      dashboard: 'Tableau de bord',
      logOut: 'Déconnexion',
    },
  },
} as const

export function getDir(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

export function getDocLang(locale: Locale): string {
  const map: Record<Locale, string> = { en: 'en', ar: 'ar', fr: 'fr' }
  return map[locale]
}
