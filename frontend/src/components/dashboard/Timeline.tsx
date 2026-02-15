import { useState, useMemo } from 'react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { TimelineItem as T } from '../../api/children'
import { PeriodRow } from './PeriodRow'

interface TimelineProps {
  items: T[]
  loading: boolean
  error: string | null
  onCompletePeriod: (ids: number[]) => Promise<void>
  childName?: string
}

export const Timeline: FC<TimelineProps> = ({
  items,
  loading,
  error,
  onCompletePeriod,
  childName,
}) => {
  const { t } = useTranslation()
  const [showFullSchedule, setShowFullSchedule] = useState(false)
  const grouped = useMemo(() => {
    const map = new Map<string, T[]>()
    for (const item of items) {
      const key = item.period_label
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return Array.from(map.entries())
  }, [items])

  const OVERDUE_SOON_DAYS = 14

  const upcomingGroups = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const isInComingSoon = (v: T) => {
      if (v.status === 'upcoming' || v.status === 'due') return true
      if (v.status === 'overdue' && v.due_date) {
        const due = new Date(v.due_date)
        due.setHours(0, 0, 0, 0)
        const daysOverdue = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
        return daysOverdue <= OVERDUE_SOON_DAYS
      }
      return false
    }

    const upcomingItems = items.filter(isInComingSoon)
    const byPeriod = new Map<string, T[]>()
    for (const item of upcomingItems) {
      const key = item.period_label
      if (!byPeriod.has(key)) byPeriod.set(key, [])
      byPeriod.get(key)!.push(item)
    }
    return Array.from(byPeriod.entries()).slice(0, 2)
  }, [items])

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">
        {t('dashboard.timelineLoading')}
      </div>
    )
  }
  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-4">
        {error}
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        {t('dashboard.noVaccines')}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {childName && (
        <h2 className="text-xl font-bold text-gray-900">{t('dashboard.vaccineScheduleFor', { name: childName })}</h2>
      )}

      {upcomingGroups.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">{t('dashboard.upcomingSoon')}</h3>
          {upcomingGroups.map(([periodLabel, groupItems]) => (
            <PeriodRow
              key={periodLabel}
              periodLabel={periodLabel}
              items={groupItems}
              onCompletePeriod={onCompletePeriod}
              defaultCollapsed={false}
            />
          ))}
        </div>
      )}

      {grouped.length > 0 && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowFullSchedule((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/50 transition-colors font-medium text-sm"
          >
            {showFullSchedule ? (
              <>
                <ChevronUp className="w-4 h-4" />
                {t('dashboard.hideFullSchedule')}
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                {t('dashboard.showFullSchedule')}
              </>
            )}
          </button>
          {showFullSchedule && (
            <div className="space-y-3">
              {grouped.map(([periodLabel, groupItems]) => (
                <PeriodRow
                  key={periodLabel}
                  periodLabel={periodLabel}
                  items={groupItems}
                  onCompletePeriod={onCompletePeriod}
                  defaultCollapsed={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
