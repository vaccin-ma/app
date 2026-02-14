import type { FC } from 'react'
import { Baby, Calendar, User, ChevronLeft } from 'lucide-react'
import type { Child } from '../../api/children'

interface ChildCardProps {
  child: Child
  onViewTimeline: (child: Child) => void
  onUpdate?: (child: Child) => void
}

function formatDate(s: string | null): string {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('ar-MA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const ChildCard: FC<ChildCardProps> = ({
  child,
  onViewTimeline,
  onUpdate,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
          <Baby className="w-8 h-8 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            {child.name}
          </h3>
          <p className="text-gray-600 text-sm mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatDate(child.birthdate)}
          </p>
          {child.gender && (
            <p className="text-gray-500 text-sm mt-0.5">{child.gender}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          type="button"
          onClick={() => onViewTimeline(child)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700"
        >
          <ChevronLeft className="w-4 h-4" />
          عرض الجدول
        </button>
        {onUpdate && (
          <button
            type="button"
            onClick={() => onUpdate(child)}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50"
          >
            تحديث البيانات
          </button>
        )}
      </div>
    </div>
  )
}
