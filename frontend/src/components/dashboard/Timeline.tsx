import { useMemo } from 'react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
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
  const grouped = useMemo(() => {
    const map = new Map<string, T[]>()
    for (const item of items) {
      const key = item.period_label
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return Array.from(map.entries())
  }, [items])

  const upcomingGroups = useMemo(() => {
    const upcomingItems = items.filter((v) => v.status === 'upcoming' || v.status === 'due')
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
    </div>
  )
}
