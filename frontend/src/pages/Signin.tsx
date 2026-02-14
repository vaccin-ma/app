import { useState } from 'react'
import type { FC, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from '../components/Logo'
import { Mail, Lock, Eye, EyeOff, LogIn, Shield } from 'lucide-react'
import { login, saveToken, updatePreferredLanguage, getMe } from '../api/auth'
import { useLanguage } from '../contexts/LanguageContext'

const Signin: FC = () => {
  const { t } = useTranslation()
  const { dir, locale } = useLanguage()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { access_token, token_type } = await login({ email, password })
      saveToken(access_token, token_type)
      updatePreferredLanguage(locale).catch(() => {})
      
      // Check if user is admin
      const user = await getMe()
      if (user.is_admin) {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('signin.errorDefault'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-blue-50/30 flex" dir={dir}>
      {/* Left panel — branding (large screens) */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-teal-600 to-blue-600 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 border-2 border-white rounded-full" />
          <div className="absolute bottom-20 right-10 w-48 h-48 border-2 border-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 border-2 border-white rounded-full" />
        </div>

        <div className="relative text-white text-center max-w-md">
          <div className="mb-10">
            <Logo className="h-32 w-auto object-contain [filter:brightness(0)_invert(1)]" />
          </div>

          <h2 className="text-3xl font-bold mb-4 leading-tight">
            {t('signin.welcome')}
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-10">
            {t('signin.welcomeDesc')}
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-start">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-teal-300" />
              <span className="font-semibold">{t('signin.secureTitle')}</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              {t('signin.secureDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo className="h-24 w-auto object-contain" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
              {t('signin.title')}
            </h1>
            <p className="text-gray-500 text-center mb-10">
              {t('signin.subtitle')}
            </p>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('signin.email')}</label>
                <div className="relative">
                  <Mail className="absolute end-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pe-11 ps-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('signin.password')}</label>
                <div className="relative">
                  <Lock className="absolute end-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('signin.passwordPlaceholder')}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full pe-11 ps-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 accent-teal-600"
                  />
                  <span className="text-sm text-gray-600">{t('signin.remember')}</span>
                </label>
                <a href="#" className="text-sm text-teal-600 font-medium hover:underline">
                  {t('signin.forgot')}
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!email || !password || loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-xl transition-all duration-300"
              >
                <LogIn className="w-5 h-5" />
                {loading ? t('signin.signingIn') : t('signin.submit')}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-8">
              {t('signin.noAccount')}{' '}
              <Link to="/signup" className="text-teal-600 font-semibold hover:underline">
                {t('signin.createFree')}
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Signin
