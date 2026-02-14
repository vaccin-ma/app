import type { FC } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Package, AlertOctagon } from 'lucide-react'
import clsx from 'clsx'

import type { RegionData } from '../../api/admin'

// Constants derived from PNI targeting (95% coverage) + 10% safety buffer
const TARGET_COVERAGE = 0.95
const SAFETY_BUFFER = 1.1

// Helper to calc projected need
function calculateProjectedNeed(births: number) {
  // Need = (Births * Target Coverage) * Safety Buffer
  return Math.round(births * TARGET_COVERAGE * SAFETY_BUFFER)
}

interface SupplyDashboardProps {
  data: RegionData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl text-xs">
        <p className="font-bold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-indigo-600 font-medium">
            Projected Need: {payload[0].value.toLocaleString()}
          </p>
          <p className="text-emerald-600 font-medium">
            Current Stock: {payload[1].value.toLocaleString()}
          </p>
          <div className="pt-1 border-t border-gray-100 mt-1 flex justify-between gap-4">
            <span className="text-gray-500">Deficit/Surplus:</span>
            <span
              className={
                payload[1].value - payload[0].value >= 0
                  ? 'text-emerald-600 font-bold'
                  : 'text-red-500 font-bold'
              }
            >
              {(payload[1].value - payload[0].value).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export const SupplyDashboard: FC<SupplyDashboardProps> = ({ data }) => {
  // const { t } = useTranslation()

  // Transform data for chart
  const chartData = data.map((item) => ({
    name: item.name,
    projectedNeed: calculateProjectedNeed(item.births),
    currentStock: item.stock ?? 0,
    // Short name for axis
    shortName: item.name.split('-')[0], // e.g. "Tanger" from "Tanger-Tétouan..."
  }))

  const totalNeed = chartData.reduce((acc, curr) => acc + curr.projectedNeed, 0)
  const totalStock = chartData.reduce((acc, curr) => acc + curr.currentStock, 0)
  const supplyGap = totalStock - totalNeed

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-5 border border-indigo-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-indigo-900">National Stock</span>
          </div>
          <p className="text-2xl font-bold text-indigo-700">{totalStock.toLocaleString()}</p>
          <p className="text-xs text-indigo-500 mt-1">Doses available across all regions</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-blue-900">Projected Need</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{totalNeed.toLocaleString()}</p>
          <p className="text-xs text-blue-500 mt-1">
            Based on birth rate + {((SAFETY_BUFFER - 1) * 100).toFixed(0)}% buffer
          </p>
        </div>

        <div
          className={clsx(
            'rounded-2xl p-5 border',
            supplyGap >= 0
              ? 'bg-emerald-50 border-emerald-100'
              : 'bg-rose-50 border-rose-100'
          )}
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className={clsx(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                supplyGap >= 0
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-rose-500/10 text-rose-600'
              )}
            >
              <Package className="w-4 h-4" />
            </div>
            <span
              className={clsx(
                'text-sm font-medium',
                supplyGap >= 0 ? 'text-emerald-900' : 'text-rose-900'
              )}
            >
              Surplus / Deficit
            </span>
          </div>
          <p
            className={clsx(
              'text-2xl font-bold',
              supplyGap >= 0 ? 'text-emerald-700' : 'text-rose-700'
            )}
          >
            {supplyGap > 0 ? '+' : ''}
            {supplyGap.toLocaleString()}
          </p>
          <p
            className={clsx(
              'text-xs mt-1',
              supplyGap >= 0 ? 'text-emerald-500' : 'text-rose-500'
            )}
          >
            {supplyGap >= 0 ? 'Stock levels adequate' : 'CRITICAL SHORTAGE'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px] w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-6">
          Vaccine Supply vs. Projected Needs (by Region)
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="shortName"
              tick={{ fontSize: 10, fill: '#6B7280' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar
              dataKey="projectedNeed"
              name="Projected Need"
              fill="#6366F1"
              radius={[4, 4, 0, 0]}
              barSize={12}
            />
            <Bar
              dataKey="currentStock"
              name="Current Stock"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
