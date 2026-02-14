import { useState, useEffect, Fragment } from 'react'
import type { FC, ElementType, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield, ArrowRight, ArrowLeft, Eye, EyeOff,
  User, Mail, Phone, Lock, Baby, Calendar, CheckCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { register, login, saveToken, updatePreferredLanguage } from '../api/auth'
import { createChild } from '../api/children'
import { getRegions, type Region } from '../api/regions'
import { useLanguage } from '../contexts/LanguageContext'
import { Logo } from '../components/Logo'

/* ─── types ─── */
interface ParentData {
  fullName: string
  email: string
  phone: string
  regionId: string
  password: string
  confirmPassword: string
}

interface ChildData {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
}

/* ─── step indicator ─── */
const StepIndicator: FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="flex items-center justify-center gap-3 mb-10">
    {Array.from({ length: total }, (_, i) => (
      <Fragment key={i}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
          i < current
            ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
            : i === current
            ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30 ring-4 ring-teal-100'
            : 'bg-gray-200 text-gray-500'
        }`}>
          {i < current ? <CheckCircle className="w-5 h-5" /> : i + 1}
        </div>
        {i < total - 1 && (
          <div className={`w-16 h-1 rounded-full transition-all duration-300 ${
            i < current ? 'bg-teal-500' : 'bg-gray-200'
          }`} />
        )}
      </Fragment>
    ))}
  </div>
)

/* ─── reusable input ─── */
const FormInput: FC<{
  icon: ElementType
  label: string
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  togglePassword?: boolean
}> = ({ icon: Icon, label, type = 'text', placeholder, value, onChange, required = true, togglePassword }) => {
  const [showPw, setShowPw] = useState(false)
  const inputType = togglePassword ? (showPw ? 'text' : 'password') : type

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute start-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          className="w-full ps-11 pe-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
        />
        {togglePassword && (
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute end-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── page ─── */
const Signup: FC = () => {
  const { t } = useTranslation()
  const { dir, locale } = useLanguage()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [parent, setParent] = useState<ParentData>({
    fullName: '', email: '', phone: '', regionId: '', password: '', confirmPassword: ''
  })
  const [child, setChild] = useState<ChildData>({
    firstName: '', lastName: '', dateOfBirth: '', gender: ''
  })
  const [regions, setRegions] = useState<Region[]>([])
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getRegions().then(setRegions).catch(() => setRegions([]))
  }, [])

  const updateParent = (field: keyof ParentData) => (v: string) =>
    setParent(prev => ({ ...prev, [field]: v }))
  const updateChild = (field: keyof ChildData) => (v: string) =>
    setChild(prev => ({ ...prev, [field]: v }))

  const canProceed = () => {
    if (step === 0) {
      return parent.fullName && parent.email && parent.phone && parent.regionId && parent.password && parent.password === parent.confirmPassword
    }
    if (step === 1) {
      return child.firstName && child.lastName && child.dateOfBirth && child.gender
    }
    return agreed
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (step < 2) { setStep(step + 1); return }
    setError('')
    setLoading(true)
    try {
      await register({
        name: parent.fullName,
        email: parent.email,
        password: parent.password,
        phone_number: parent.phone || null,
        region_id: parent.regionId ? Number(parent.regionId) : null,
      })
      const { access_token, token_type } = await login({
        email: parent.email,
        password: parent.password,
      })
      saveToken(access_token, token_type)
      updatePreferredLanguage(locale).catch(() => {})
      // Create the child from step 1 so parent + child are linked
      await createChild({
        name: `${child.firstName} ${child.lastName}`.trim(),
        birthdate: child.dateOfBirth,
        gender: child.gender || null,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('signup.errorDefault'))
    } finally {
      setLoading(false)
    }
  }

  /* ─── slide variants ─── */
  const slideDir = dir === 'rtl' ? -1 : 1
  const variants = {
    enter: { x: 60 * slideDir, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -60 * slideDir, opacity: 0 }
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
            {t('signup.joinTitle')}
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-10">
            {t('signup.joinDesc')}
          </p>

          <div className="space-y-4 text-start">
            {[t('signup.bullet0'), t('signup.bullet1'), t('signup.bullet2')].map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-teal-300 flex-shrink-0" />
                <span className="text-white/90">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Logo className="h-24 w-auto object-contain" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
            {t('signup.formTitle')}
          </h1>
          <p className="text-gray-500 text-center mb-8">
            {step === 0 && t('signup.step0Desc')}
            {step === 1 && t('signup.step1Desc')}
            {step === 2 && t('signup.step2Desc')}
          </p>

          <StepIndicator current={step} total={3} />

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* ── Step 1: Parent Info ── */}
              {step === 0 && (
                <motion.div key="step0" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
                  <FormInput icon={User} label={t('signup.fullName')} placeholder={t('signup.fullNamePlaceholder')} value={parent.fullName} onChange={updateParent('fullName')} />
                  <FormInput icon={Mail} label={t('signup.email')} type="email" placeholder="you@example.com" value={parent.email} onChange={updateParent('email')} />
                  <FormInput icon={Phone} label={t('signup.phone')} type="tel" placeholder="+212 6XX-XXXXXX" value={parent.phone} onChange={updateParent('phone')} />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('signup.region')}</label>
                    <select
                      value={parent.regionId}
                      onChange={e => updateParent('regionId')(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">{t('signup.selectRegion')}</option>
                      {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>

                  <FormInput icon={Lock} label={t('signup.password')} placeholder={t('signup.passwordPlaceholder')} value={parent.password} onChange={updateParent('password')} togglePassword />
                  <FormInput icon={Lock} label={t('signup.confirmPassword')} placeholder={t('signup.confirmPasswordPlaceholder')} value={parent.confirmPassword} onChange={updateParent('confirmPassword')} togglePassword />

                  {parent.password && parent.confirmPassword && parent.password !== parent.confirmPassword && (
                    <p className="text-red-500 text-sm">{t('signup.passwordsMismatch')}</p>
                  )}
                </motion.div>
              )}

              {/* ── Step 2: Child Info ── */}
              {step === 1 && (
                <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-4">
                  <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-2">
                    <p className="text-sm text-teal-800">
                      <Shield className="w-4 h-4 inline me-1.5 -mt-0.5" />
                      {t('signup.childDataNote')}
                    </p>
                  </div>

                  <FormInput icon={Baby} label={t('signup.childFirstName')} placeholder={t('signup.childFirstNamePlaceholder')} value={child.firstName} onChange={updateChild('firstName')} />
                  <FormInput icon={User} label={t('signup.childLastName')} placeholder={t('signup.childLastNamePlaceholder')} value={child.lastName} onChange={updateChild('lastName')} />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('signup.dateOfBirth')}</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="date"
                        value={child.dateOfBirth}
                        onChange={e => updateChild('dateOfBirth')(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('signup.gender')}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Boy', 'Girl'].map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => updateChild('gender')(g)}
                          className={`py-3 rounded-xl font-medium border-2 transition-all duration-200 ${
                            child.gender === g
                              ? 'border-teal-500 bg-teal-50 text-teal-700'
                              : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {g === 'Boy' ? `👦 ${t('signup.boy')}` : `👧 ${t('signup.girl')}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Review ── */}
              {step === 2 && (
                <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }} className="space-y-5">
                  {/* Parent summary */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-teal-600" /> {t('signup.parentInfo')}
                    </h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between"><dt className="text-gray-500">{t('signup.name')}</dt><dd className="font-medium text-gray-900">{parent.fullName}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">{t('signup.email')}</dt><dd className="font-medium text-gray-900">{parent.email}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">{t('signup.phoneLabel')}</dt><dd className="font-medium text-gray-900">{parent.phone}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">{t('signup.region')}</dt><dd className="font-medium text-gray-900">{regions.find(r => r.id === Number(parent.regionId))?.name ?? '—'}</dd></div>
                    </dl>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Baby className="w-4 h-4 text-teal-600" /> {t('signup.childInfo')}
                    </h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between"><dt className="text-gray-500">{t('signup.name')}</dt><dd className="font-medium text-gray-900">{child.firstName} {child.lastName}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">{t('signup.dateOfBirth')}</dt><dd className="font-medium text-gray-900">{child.dateOfBirth}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">{t('signup.gender')}</dt><dd className="font-medium text-gray-900">{child.gender === 'Boy' ? t('signup.boy') : t('signup.girl')}</dd></div>
                    </dl>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                      className="mt-1 w-4 h-4 accent-teal-600"
                    />
                    <span className="text-sm text-gray-600">
                      {t('signup.termsAgree')}{' '}
                      <a href="#" className="text-teal-600 hover:underline">{t('signup.termsOfService')}</a>
                      {' '}{t('signup.and')}{' '}
                      <a href="#" className="text-teal-600 hover:underline">{t('signup.privacyPolicy')}</a>.
                      {t('signup.termsConsent')}
                    </span>
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Buttons ── */}
            <div className="flex gap-3 mt-8">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5 rtl:rotate-180" /> {t('signup.back')}
                </button>
              )}
              <button
                type="submit"
                disabled={!canProceed() || loading}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-xl transition-all duration-300"
              >
                {step < 2 ? (
                  <>{t('signup.next')} <ArrowRight className="w-5 h-5 rtl:rotate-180" /></>
                ) : loading ? (
                  t('signup.creatingAccount')
                ) : (
                  <>{t('signup.createAccount')} <CheckCircle className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            {t('signup.alreadyHave')}{' '}
            <Link to="/signin" className="text-teal-600 font-semibold hover:underline">
              {t('signup.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
