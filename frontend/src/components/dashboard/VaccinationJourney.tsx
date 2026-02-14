import { useMemo } from 'react'
import type { FC } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../contexts/LanguageContext'
import type { TimelineItem } from '../../api/children'
import { VaccineCard } from './VaccineCard'
import { ProgressRing } from './ProgressRing'

type PeriodStatus = 'completed' | 'current' | 'upcoming' | 'overdue'

interface PeriodGroup {
  periodLabel: string
  vaccines: TimelineItem[]
  status: PeriodStatus
}

interface VaccinationJourneyProps {
  items: TimelineItem[]
  loading: boolean
  error: string | null
  onCompletePeriod: (ids: number[]) => Promise<void>
  childName?: string
}

function computePeriodStatus(vaccines: TimelineItem[]): PeriodStatus {
  const allCompleted = vaccines.every(v => v.completed)
  if (allCompleted) return 'completed'
  const hasOverdue = vaccines.some(v => v.status === 'overdue')
  if (hasOverdue) return 'overdue'
  const hasDue = vaccines.some(v => v.status === 'due')
  if (hasDue) return 'current'
  return 'upcoming'
}

export const VaccinationJourney: FC<VaccinationJourneyProps> = ({
  items,
  loading,
  error,
  onCompletePeriod,
  childName,
}) => {
  const { t } = useTranslation()
  const { dir } = useLanguage()

  /* ── group by period ─────────────────────────────────── */
  const groups: PeriodGroup[] = useMemo(() => {
    const map = new Map<string, TimelineItem[]>()
    for (const item of items) {
      const key = item.period_label
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return Array.from(map.entries()).map(([periodLabel, vaccines]) => ({
      periodLabel,
      vaccines,
      status: computePeriodStatus(vaccines),
    }))
  }, [items])

  /* ── progress stats ──────────────────────────────────── */
  const totalVaccines = items.length
  const completedVaccines = items.filter(v => v.completed).length
  const percent = totalVaccines > 0 ? (completedVaccines / totalVaccines) * 100 : 0

  /* ── timeline fill effect ────────────────────────────── */
  const completedGroupCount = groups.filter(g => g.status === 'completed').length
  const fillPercent = groups.length > 0 ? (completedGroupCount / groups.length) * 100 : 0

  /* ── loading / error / empty ─────────────────────────── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">{t('dashboard.timelineLoading')}</p>
      </div>
    )
  }
  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 p-6 text-center">
        {error}
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500">
        {t('dashboard.noVaccines')}
      </div>
    )
  }

  return (
    <div dir={dir} className="space-y-6">
      {/* ── sticky progress header ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-[73px] z-30 bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-100 shadow-sm p-4"
      >
        <div className="flex items-center gap-4">
          <ProgressRing percent={percent} />
          <div className="flex-1 min-w-0">
            {childName && (
              <h2 className="font-bold text-gray-900 text-lg truncate">
                {t('dashboard.vaccineScheduleFor', { name: childName })}
              </h2>
            )}
            <p className="text-sm text-gray-500">
              {t('journey.vaccinesDone', { done: completedVaccines, total: totalVaccines })}
            </p>
          </div>
        </div>
        {/* progress bar */}
        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* ── vertical timeline ──────────────────────────── */}
      <div className="relative ps-4">
        {/* background line */}
        <div className="absolute start-0 top-0 bottom-0 w-0.5 bg-gray-200 rounded-full" />
        {/* filled line */}
        <motion.div
          className="absolute start-0 top-0 w-0.5 bg-gradient-to-b from-teal-500 to-teal-300 rounded-full"
          initial={{ height: 0 }}
          animate={{ height: `${fillPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />

        {/* period cards */}
        <div className="space-y-6">
          {groups.map((group, i) => (
            <VaccineCard
              key={group.periodLabel}
              periodLabel={group.periodLabel}
              vaccines={group.vaccines}
              status={group.status}
              onComplete={onCompletePeriod}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
