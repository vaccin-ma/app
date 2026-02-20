import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Baby, Plus, LogOut, ChevronRight, Menu, X, Globe } from 'lucide-react'
import { AUTH_KEYS, clearToken } from '../api/auth'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../contexts/LanguageContext'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { Logo } from '../components/Logo'
import { useChildren } from '../hooks/useChildren'
import { useTimeline } from '../hooks/useTimeline'
import type { Child } from '../api/children'
import { ChildCard } from '../components/dashboard/ChildCard'
import { Timeline } from '../components/dashboard/Timeline'
import { VaccineFamilyChart } from '../components/dashboard/VaccineFamilyChart'
import { AddChildModal } from '../components/dashboard/AddChildModal'
import { NotificationBell } from '../components/dashboard/NotificationBell'
import { getChildDisplayName } from '../utils/childDisplayName'

const Dashboard: FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_KEYS.TOKEN) : null
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editChild, setEditChild] = useState<Child | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { dir } = useLanguage()
  const { t } = useTranslation()
  const { children, loading, error, refetch, addChild, updateChild, deleteChild } = useChildren({ enabled: !!token })
  const { items, loading: timelineLoading, error: timelineError, markCompletePeriod } = useTimeline(
    selectedChild?.id ?? null
  )

  // Open timeline for a child when coming from notification "View in timeline"
  const selectChildId = (location.state as { selectChildId?: number } | null)?.selectChildId
  useEffect(() => {
    if (selectChildId && children.length > 0) {
      const child = children.find((c) => c.id === selectChildId)
      if (child) setSelectedChild(child)
      window.history.replaceState({}, '', location.pathname)
    }
  }, [selectChildId, children])

  const handleLogout = () => {
    clearToken()
    navigate('/signin', { replace: true })
  }

  if (!token) {
    navigate('/signin', { replace: true })
    return null
  }

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/20 to-blue-50/20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Logo className="h-10 sm:h-16 w-auto object-contain flex-shrink-0" />
            
            {/* Right side navigation */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification Bell - always visible */}
              <NotificationBell
                onViewTimeline={(childId) => {
                  const child = children.find((c) => c.id === childId)
                  if (child) setSelectedChild(child)
                }}
              />
              
              {/* Desktop only items */}
              <div className="hidden sm:flex items-center gap-3">
                <LanguageSwitcher />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('nav.logOut')}</span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="sm:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 sm:hidden"
            />
            
            {/* Slide-out Menu */}
            <motion.div
              initial={{ x: dir === 'rtl' ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: dir === 'rtl' ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed top-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} h-full w-72 bg-white shadow-2xl z-50 sm:hidden`}
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Logo className="h-10 w-auto" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-4">
                {/* Language */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="w-5 h-5 text-teal-600" />
                    <span className="font-medium text-gray-700">{t('nav.language')}</span>
                  </div>
                  <LanguageSwitcher />
                </div>
              </div>

              {/* Logout Button at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('nav.logOut')}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
        >
          {t('dashboard.title')}
        </motion.h1>
        <p className="text-gray-600 mb-8">{t('dashboard.subtitle')}</p>

        {selectedChild ? (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <button
              type="button"
              onClick={() => setSelectedChild(null)}
              className="flex items-center gap-2 text-teal-600 font-medium mb-4 hover:underline"
            >
              <span className="rtl:rotate-180"><ChevronRight className="w-5 h-5" /></span>
              {t('dashboard.backToChildren')}
            </button>
            <Timeline
              items={items}
              loading={timelineLoading}
              error={timelineError}
              onCompletePeriod={markCompletePeriod}
              childName={getChildDisplayName(selectedChild.name, t)}
            />
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">{t('dashboard.myChildren')}</h2>
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-500/25"
              >
                <Plus className="w-5 h-5" />
                {t('dashboard.addChild')}
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-4 mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-gray-500">{t('dashboard.loading')}</div>
            ) : children.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                <Baby className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">{t('dashboard.noChildren')}</p>
                <p className="text-gray-500 text-sm mb-4">{t('dashboard.addFirstChild')}</p>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700"
                >
                  <Plus className="w-5 h-5" />
                  {t('dashboard.addChild')}
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => (
                  <ChildCard
                    key={child.id}
                    child={child}
                    onViewTimeline={setSelectedChild}
                    onUpdate={setEditChild}
                  />
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* Vaccine families – always visible educational section */}
        <VaccineFamilyChart />
      </main>

      {addModalOpen && (
        <AddChildModal
          childCount={children.length}
          onClose={() => setAddModalOpen(false)}
          onSubmit={async (payload) => {
            await addChild(payload)
            refetch()
            // Voice reminders are created in background; ask notification bell to refetch after a delay
            setTimeout(() => window.dispatchEvent(new CustomEvent('notifications-refresh')), 5000)
            setTimeout(() => window.dispatchEvent(new CustomEvent('notifications-refresh')), 15000)
          }}
        />
      )}

      {editChild && (
        <AddChildModal
          initialChild={editChild}
          onClose={() => setEditChild(null)}
          onSubmit={async (payload) => {
            await updateChild(editChild.id, {
              name: payload.name,
              gender: payload.gender ?? null,
            })
            refetch()
          }}
          onDelete={async () => {
            await deleteChild(editChild.id)
            setEditChild(null)
            refetch()
          }}
        />
      )}
    </div>
  )
}

export default Dashboard
