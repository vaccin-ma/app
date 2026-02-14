import type { FC } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Clock, AlertTriangle, Volume2, Calendar } from 'lucide-react'
import clsx from 'clsx'
import type { TimelineItem } from '../../api/children'

const localeMap: Record<string, string> = { en: 'en-US', ar: 'ar-MA', fr: 'fr-FR' }

function formatDueDate(dateStr: string | null, locale: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(localeMap[locale] ?? locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function daysFromToday(dateStr: string | null): number | null {
  if (!dateStr) return null
  const due = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

type PeriodStatus = 'completed' | 'current' | 'upcoming' | 'overdue'

interface VaccineCardProps {
  periodLabel: string
  vaccines: TimelineItem[]
  status: PeriodStatus
  onComplete: (ids: number[]) => Promise<void>
  /** index in list for stagger delay */
  index: number
}

const statusIcon: Record<PeriodStatus, FC<{ className?: string }>> = {
  completed: CheckCircle,
  current: AlertTriangle,
  upcoming: Clock,
  overdue: AlertTriangle,
}

const statusStyles: Record<PeriodStatus, { dot: string; ring: string; badge: string; badgeText: string }> = {
  completed: {
    dot: 'bg-teal-500',
    ring: 'ring-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    badgeText: 'journey.completed',
  },
  current: {
    dot: 'bg-orange-500',
    ring: 'ring-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    badgeText: 'journey.current',
  },
  upcoming: {
    dot: 'bg-gray-300',
    ring: 'ring-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    badgeText: 'journey.upcoming',
  },
  overdue: {
    dot: 'bg-red-500',
    ring: 'ring-red-200',
    badge: 'bg-red-100 text-red-700',
    badgeText: 'journey.overdue',
  },
}

export const VaccineCard: FC<VaccineCardProps> = ({
  periodLabel,
  vaccines,
  status,
  onComplete,
  index,
}) => {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const style = statusStyles[status]
  const Icon = statusIcon[status]
  const isCurrent = status === 'current'
  const incompleteIds = vaccines.filter(v => !v.completed && v.remindable).map(v => v.id)

  // Use the first vaccine's due_date as the period date (all share same offset)
  const dueDate = vaccines[0]?.due_date ?? null
  const formattedDate = formatDueDate(dueDate, locale)
  const daysDiff = daysFromToday(dueDate)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ scale: 1.02 }}
      className="relative"
    >
      {/* timeline connector dot */}
      <div className="absolute start-0 top-6 -translate-x-1/2 z-10">
        <div
          className={clsx(
            'w-4 h-4 rounded-full ring-4',
            style.dot,
            style.ring,
            isCurrent && 'animate-pulse',
          )}
        />
      </div>

      {/* card */}
      <div
        className={clsx(
          'ms-6 rounded-2xl border p-5 transition-shadow duration-300',
          'bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-lg',
          isCurrent
            ? 'border-orange-200 ring-2 ring-orange-100 scale-[1.01]'
            : 'border-gray-200/60',
        )}
      >
        {/* header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Icon
              className={clsx(
                'w-5 h-5',
                status === 'completed' && 'text-teal-500',
                status === 'current' && 'text-orange-500',
                status === 'overdue' && 'text-red-500',
                status === 'upcoming' && 'text-gray-400',
              )}
            />
            <h3 className="font-bold text-gray-900">{periodLabel}</h3>
          </div>
          <span className={clsx('text-xs font-medium px-2.5 py-1 rounded-full', style.badge)}>
            {t(style.badgeText)}
          </span>
        </div>

        {/* due date row */}
        {formattedDate && (
          <div className="flex items-center gap-2 mb-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-gray-600 font-medium">{formattedDate}</span>
            {daysDiff !== null && !vaccines.every(v => v.completed) && (
              <span
                className={clsx(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  daysDiff < 0
                    ? 'bg-red-50 text-red-600'
                    : daysDiff === 0
                      ? 'bg-orange-50 text-orange-600'
                      : 'bg-gray-50 text-gray-500',
                )}
              >
                {daysDiff < 0
                  ? t('journey.daysOverdue', { count: Math.abs(daysDiff) })
                  : daysDiff === 0
                    ? t('journey.today')
                    : t('journey.daysUntil', { count: daysDiff })}
              </span>
            )}
          </div>
        )}

        {/* vaccine chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {vaccines.map(v => (
            <span
              key={v.id}
              className={clsx(
                'inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-medium',
                v.completed
                  ? 'bg-teal-50 text-teal-700 line-through decoration-teal-400'
                  : status === 'overdue'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-gray-100 text-gray-700',
              )}
            >
              {v.completed && <CheckCircle className="w-3.5 h-3.5" />}
              {v.vaccine_name}
            </span>
          ))}
        </div>

        {/* action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {incompleteIds.length > 0 && (
            <button
              type="button"
              onClick={() => onComplete(incompleteIds)}
              className={clsx(
                'px-4 py-2 text-sm font-semibold rounded-xl transition-colors',
                status === 'overdue'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-500/20',
              )}
            >
              {t('journey.markDone')}
            </button>
          )}
          {isCurrent && (
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>{t('journey.testVoice')}</span>
              <span className="flex items-end gap-0.5 h-4">
                {[1, 2, 3, 4].map(i => (
                  <motion.span
                    key={i}
                    className="w-0.5 bg-orange-400 rounded-full"
                    animate={{ height: ['30%', '100%', '30%'] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
