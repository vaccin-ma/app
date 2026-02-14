import { useState } from 'react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, AlertTriangle, AlertCircle, Circle, ChevronDown, ChevronUp, Volume2 } from 'lucide-react'
import type { TimelineItem as T } from '../../api/children'
import { API_BASE } from '../../api/auth'

function formatDueDate(d: string | null, t: ReturnType<typeof useTranslation>['t']): string {
  if (!d) return '—'
  const date = new Date(d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return t('common.today')
  if (diffDays === 1) return t('common.tomorrow')
  if (diffDays > 0 && diffDays <= 3) return t('common.inDays', { count: diffDays })
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  due: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
  overdue: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  upcoming: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100' },
} as const

function periodStatus(items: T[]): keyof typeof statusConfig {
  const allCompleted = items.every((v) => v.completed)
  if (allCompleted) return 'completed'
  if (items.some((v) => v.status === 'overdue')) return 'overdue'
  if (items.some((v) => v.status === 'due')) return 'due'
  return 'upcoming'
}

interface PeriodRowProps {
  periodLabel: string
  items: T[]
  onCompletePeriod: (ids: number[]) => Promise<void>
  defaultCollapsed?: boolean
}

export const PeriodRow: FC<PeriodRowProps> = ({
  periodLabel,
  items,
  onCompletePeriod,
  defaultCollapsed = true,
}) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(!defaultCollapsed)
  const [completing, setCompleting] = useState(false)
  const status = periodStatus(items)
  const { icon: Icon, color, bg } = statusConfig[status]
  const allCompleted = items.every((v) => v.completed)
  const anyRemindable = items.some((v) => v.remindable && !v.completed)
  const dueDate = items[0]?.due_date ?? null

  const handleCompletePeriod = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (allCompleted || completing) return
    const ids = items.map((v) => v.id)
    setCompleting(true)
    try {
      await onCompletePeriod(ids)
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${
        expanded ? 'border-teal-200 bg-teal-50/30' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center justify-between text-start min-w-0"
        >
          <span className="font-semibold text-gray-800">
            {periodLabel}
            <span className="text-sm font-normal text-gray-500 ms-2">· {formatDueDate(dueDate, t)}</span>
          </span>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
          )}
        </button>
        {!allCompleted && anyRemindable && (
          <>
            <a
              href={`${API_BASE}/reminders/audio/${items[0].id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
              title={t('journey.testVoice')}
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('journey.testVoice')}</span>
            </a>
            <button
              type="button"
              onClick={handleCompletePeriod}
              disabled={completing}
              className="flex-shrink-0 px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-60"
            >
              {completing ? '...' : t('periodRow.done')}
            </button>
          </>
        )}
      </div>
      {expanded && (
        <div className="border-t border-gray-100 bg-white/80 p-3">
          <p className="text-xs font-medium text-gray-500 mb-2">{t('periodRow.vaccinesInPeriod')}</p>
          <ul className="space-y-1.5">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-gray-700">
                {item.completed ? (
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                )}
                <span>{item.vaccine_name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
