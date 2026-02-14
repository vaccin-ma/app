import { useState } from 'react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, AlertTriangle, AlertCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react'
import type { TimelineItem } from '../../api/children'
import { useLanguage } from '../../contexts/LanguageContext'

const localeMap: Record<string, string> = { en: 'en-US', ar: 'ar-MA', fr: 'fr-FR' }

function formatDueDate(
  d: string | null,
  t: ReturnType<typeof useTranslation>['t'],
  locale: string,
): string {
  if (!d) return '—'
  const date = new Date(d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return t('common.today')
  if (diffDays === 1) return t('common.tomorrow')
  if (diffDays > 0 && diffDays <= 3) return t('common.inDays', { count: diffDays })
  return new Date(d).toLocaleDateString(localeMap[locale] ?? locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  due: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
  overdue: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  upcoming: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-100' },
} as const

interface VaccineItemProps {
  item: TimelineItem
  onComplete: (id: number) => void
  /** When true, show vaccine_name as main label (period already shown by group header) */
  groupedByPeriod?: boolean
}

export const VaccineItem: FC<VaccineItemProps> = ({ item, onComplete, groupedByPeriod }) => {
  const { t } = useTranslation()
  const { locale } = useLanguage()
  const [expanded, setExpanded] = useState(false)
  const { icon: Icon, color, bg } = statusConfig[item.status]
  const mainLabel = groupedByPeriod ? item.vaccine_name : item.period_label

  return (
    <div
      className={`rounded-xl border p-3 transition-all ${expanded ? 'border-teal-200 bg-teal-50/50' : 'border-gray-100 bg-white'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center justify-between text-start min-w-0"
        >
          <span className="font-medium text-gray-800">{mainLabel}</span>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
          )}
        </button>
        <span className="text-sm text-gray-500 flex-shrink-0">{formatDueDate(item.due_date, t, locale)}</span>
        {!item.completed && item.remindable && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onComplete(item.id) }}
            className="flex-shrink-0 px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700"
          >
            {t('periodRow.done')}
          </button>
        )}
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {!groupedByPeriod && <p className="text-gray-700">{item.vaccine_name}</p>}
          {item.completed_at && (
            <p className="text-sm text-gray-500 mt-1">
              {t('common.completedAt', {
                date: new Date(item.completed_at).toLocaleDateString(localeMap[locale] ?? locale),
              })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
