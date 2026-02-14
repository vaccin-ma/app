import { useState, useMemo } from 'react'
import type { FC } from 'react'
import { ChevronDown, ChevronLeft } from 'lucide-react'
import type { TimelineItem as T } from '../../api/children'
import { VaccineItem } from './VaccineItem'

interface TimelineProps {
  items: T[]
  loading: boolean
  error: string | null
  onComplete: (id: number) => void
  childName?: string
}

export const Timeline: FC<TimelineProps> = ({
  items,
  loading,
  error,
  onComplete,
  childName,
}) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const grouped = useMemo(() => {
    const map = new Map<string, T[]>()
    for (const item of items) {
      const key = item.period_label
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return Array.from(map.entries())
  }, [items])

  const upcoming = useMemo(
    () => items.filter((v) => v.status === 'upcoming' || v.status === 'due').slice(0, 2),
    [items]
  )

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-gray-500">
        جاري تحميل الجدول...
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
        لا توجد لقاحات مسجلة.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {childName && (
        <h2 className="text-xl font-bold text-gray-900">جدول لقاحات {childName}</h2>
      )}

      {upcoming.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">القادم قريباً</h3>
          <ul className="space-y-2">
            {upcoming.map((item) => (
              <li key={item.id}>
                <VaccineItem item={item} onComplete={onComplete} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {grouped.map(([periodLabel, groupItems]) => {
          const isCollapsed = collapsed[periodLabel]
          return (
            <div key={periodLabel} className="rounded-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleGroup(periodLabel)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-right"
              >
                <span className="font-semibold text-gray-800">{periodLabel}</span>
                {isCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {!isCollapsed && (
                <div className="p-3 space-y-2">
                  {groupItems.map((item) => (
                    <VaccineItem key={item.id} item={item} onComplete={onComplete} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
