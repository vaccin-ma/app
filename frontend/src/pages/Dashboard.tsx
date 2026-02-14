import { useState } from 'react'
import type { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Baby, Plus, LogOut, ChevronRight } from 'lucide-react'
import { AUTH_KEYS, clearToken } from '../api/auth'
import { useChildren } from '../hooks/useChildren'
import { useTimeline } from '../hooks/useTimeline'
import type { Child } from '../api/children'
import { ChildCard } from '../components/dashboard/ChildCard'
import { Timeline } from '../components/dashboard/Timeline'
import { AddChildModal } from '../components/dashboard/AddChildModal'

const Dashboard: FC = () => {
  const navigate = useNavigate()
  const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_KEYS.TOKEN) : null
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)

  const { children, loading, error, refetch, addChild } = useChildren({ enabled: !!token })
  const { items, loading: timelineLoading, error: timelineError, markComplete } = useTimeline(
    selectedChild?.id ?? null
  )

  const handleLogout = () => {
    clearToken()
    navigate('/signin', { replace: true })
  }

  if (!token) {
    navigate('/signin', { replace: true })
    return null
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/20 to-blue-50/20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-400 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <span className="text-xl font-bold text-gray-900">VacciTrack</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
        >
          لوحة التحكم
        </motion.h1>
        <p className="text-gray-600 mb-8">إدارة أطفالك وجداول اللقاحات</p>

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
              <ChevronRight className="w-5 h-5" />
              العودة إلى قائمة الأطفال
            </button>
            <Timeline
              items={items}
              loading={timelineLoading}
              error={timelineError}
              onComplete={markComplete}
              childName={selectedChild.name}
            />
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">أطفالي</h2>
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-500/25"
              >
                <Plus className="w-5 h-5" />
                إضافة طفل
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-4 mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-12 text-center text-gray-500">جاري التحميل...</div>
            ) : children.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                <Baby className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-2">لا يوجد أطفال مسجلون بعد</p>
                <p className="text-gray-500 text-sm mb-4">أضف طفلك الأول لبدء تتبع اللقاحات</p>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700"
                >
                  <Plus className="w-5 h-5" />
                  إضافة طفل
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => (
                  <ChildCard
                    key={child.id}
                    child={child}
                    onViewTimeline={setSelectedChild}
                    onUpdate={() => {}}
                  />
                ))}
              </div>
            )}
          </motion.section>
        )}
      </main>

      {addModalOpen && (
        <AddChildModal
          onClose={() => setAddModalOpen(false)}
          onSubmit={async (payload) => {
            await addChild(payload)
            refetch()
          }}
        />
      )}
    </div>
  )
}

export default Dashboard
