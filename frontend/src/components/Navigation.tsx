import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogIn, Menu, X, LayoutDashboard } from 'lucide-react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'
import { useLanguage } from '../contexts/LanguageContext'

const AUTH_TOKEN_KEY = 'vaccitrack_access_token'

const Navigation = () => {
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Read token on every render so Admin/Dashboard show immediately after login
  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem(AUTH_TOKEN_KEY)
  const { dir } = useLanguage()
  const xDir = dir === 'rtl' ? 1 : -1

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: 20 * xDir }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Logo className="h-10 w-auto object-contain" />
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 * xDir }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center gap-6"
          >
            <LanguageSwitcher />
            <a href="#features" className="text-gray-700 hover:text-teal-600 font-medium transition-colors duration-300">
              {t('nav.features')}
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-teal-600 font-medium transition-colors duration-300">
              {t('nav.howItWorks')}
            </a>
            <a href="#about" className="text-gray-700 hover:text-teal-600 font-medium transition-colors duration-300">
              {t('nav.about')}
            </a>
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:text-teal-600 font-medium transition-colors"
                >
                  <LayoutDashboard size={18} />
                  <span>{t('nav.dashboard')}</span>
                </Link>
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Admin
                </Link>
              </>
            ) : (
              <Link
                to="/signin"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <LogIn size={18} />
                <span>{t('nav.signIn')}</span>
              </Link>
            )}
          </motion.div>

          {/* Mobile: lang + menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-teal-600 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-6 border-t border-gray-100"
          >
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-700 hover:text-teal-600 font-medium py-2 transition-colors">
                {t('nav.features')}
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-teal-600 font-medium py-2 transition-colors">
                {t('nav.howItWorks')}
              </a>
              <a href="#about" className="text-gray-700 hover:text-teal-600 font-medium py-2 transition-colors">
                {t('nav.about')}
              </a>
              {isLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-800 font-semibold rounded-lg"
                  >
                    <LayoutDashboard size={18} />
                    <span>{t('nav.dashboard')}</span>
                  </Link>
                  <Link
                    to="/admin"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold rounded-lg shadow-md"
                  >
                    Admin
                  </Link>
                </>
              ) : (
                <Link
                  to="/signin"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold rounded-lg shadow-md"
                >
                  <LogIn size={18} />
                  <span>{t('nav.signIn')}</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
