import { type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import clsx from 'clsx'
import type { RegionData } from '../../api/admin'

interface RegionTableProps {
  data: RegionData[]
  hoveredRegion: string | null
  onHover: (name: string | null) => void
}

export const RegionTable: FC<RegionTableProps> = ({ data, hoveredRegion, onHover }) => {
  const { t } = useTranslation()

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
          <tr>
            <th className="px-4 py-3">{t('admin.region')}</th>
            <th className="px-4 py-3 text-end">{t('admin.population')}</th>
            <th className="px-4 py-3 text-end">{t('admin.annualBirths')}</th>
            <th className="px-4 py-3 text-end">{t('admin.coverage')}</th>
            <th className="px-4 py-3 text-center">{t('admin.status')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((region) => {
            const isHovered = hoveredRegion === region.name
            return (
              <tr
                key={region.name}
                className={clsx(
                  'transition-colors duration-200 cursor-pointer',
                  isHovered ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                )}
                onMouseEnter={() => onHover(region.name)}
                onMouseLeave={() => onHover(null)}
              >
                <td className="px-4 py-3 font-medium text-gray-900">{region.name}</td>
                <td className="px-4 py-3 text-end text-gray-600">
                  {region.population.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-end text-gray-600">
                  {region.births.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-end font-bold text-gray-900">
                  {region.coverage}%
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                      region.status === 'green' && 'bg-teal-100 text-teal-700',
                      region.status === 'yellow' && 'bg-amber-100 text-amber-700',
                      region.status === 'red' && 'bg-rose-100 text-rose-700'
                    )}
                  >
                    {region.status === 'green' && <CheckCircle className="w-3.5 h-3.5" />}
                    {region.status === 'yellow' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {region.status === 'red' && <XCircle className="w-3.5 h-3.5" />}
                    {region.status === 'green'
                      ? t('admin.safe')
                      : region.status === 'yellow'
                      ? t('admin.risk')
                      : t('admin.danger')}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
