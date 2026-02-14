import { useState, useEffect } from 'react'
import type { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  Baby,
  Syringe,
  Activity,
  LogOut,
  Map as MapIcon,
  Table as TableIcon,
} from 'lucide-react'
import { Logo } from '../components/Logo'
import { MapErrorBoundary } from '../components/admin/MapErrorBoundary'
import { MoroccoMap } from '../components/admin/MoroccoMap'
import { RegionTable } from '../components/admin/RegionTable'
import { SupplyDashboard } from '../components/admin/SupplyDashboard'
import { getAdminStats, type AdminStats } from '../api/admin'
import { clearToken } from '../api/auth'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import type { RegionStatus } from '../types' // or wherever you defined it

// Static data from user request
const REGIONS_STATIC = [
  { name: 'Tanger-Tétouan-Al Hoceima', population: 4030222, births: 67300 },
  { name: "L'Oriental", population: 2294665, births: 38300 },
  { name: 'Fès-Meknès', population: 4467911, births: 74400 },
  { name: 'Rabat-Salé-Kénitra', population: 5132639, births: 85700 },
  { name: 'Béni Mellal-Khénifra', population: 2525801, births: 42200 },
  { name: 'Casablanca-Settat', population: 7688967, births: 128400 },
  { name: 'Marrakech-Safi', population: 4892393, births: 81700 },
  { name: 'Drâa-Tafilalet', population: 1655623, births: 27700 },
  { name: 'Souss-Massa', population: 3020431, births: 50400 },
  { name: 'Guelmim-Oued Noun', population: 448685, births: 7500 },
  { name: 'Laâyoune-Sakia El Hamra', population: 451028, births: 7500 },
  { name: 'Dakhla-Oued Ed-Dahab', population: 219965, births: 3700 },
]

// Simulate coverage & stock for demo purposes (since we lack regional DB data)
const MOCK_REGIONAL_DATA = REGIONS_STATIC.map((r) => {
  // Random coverage between 80% and 98%
  const coverage = Math.floor(Math.random() * (99 - 80) + 80)
  let status: RegionStatus = 'red'
  if (coverage >= 95) status = 'green'
  else if (coverage >= 85) status = 'yellow'

  // Projected need approx
  const need = Math.round(r.births * 0.95 * 1.1)
  // Stock varies around need
  const stock = Math.round(need * (Math.random() * 0.4 + 0.8)) // 0.8 to 1.2 x need

  return {
    ...r,
    id: Math.random(),
    coverage,
    status,
    stock,
  }
})

const AdminDashboard: FC = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'map' | 'supply'>('map')

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err) => console.error('Failed to load admin stats', err))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = () => {
    clearToken()
    navigate('/signin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col items-center text-center">
            <Logo className="h-12 w-auto" linkToHome={false} />
            <h1 className="mt-3 font-bold text-lg leading-tight text-gray-900">Admin</h1>
            <p className="text-xs text-gray-500">Vaccination Monitor</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab('map')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'map'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MapIcon className="w-5 h-5" />
            Regional Immunity
          </button>
          <button
            onClick={() => setActiveTab('supply')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'supply'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Syringe className="w-5 h-5" />
            Vaccine Supply
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ms-64 p-4 md:p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-gray-500 text-sm">Real-time vaccination analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              View User App
            </Link>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Parents"
            value={stats?.total_parents ?? 0}
            icon={Users}
            color="bg-blue-500"
            loading={loading}
          />
          <StatCard
            title="Registered Children"
            value={stats?.total_children ?? 0}
            icon={Baby}
            color="bg-teal-500"
            loading={loading}
          />
          <StatCard
            title="Total Vaccinations"
            value={stats?.total_vaccinations ?? 0}
            icon={Syringe}
            color="bg-indigo-500"
            loading={loading}
          />
          <StatCard
            title="Avg. Coverage"
            value={`${stats?.overall_coverage_percent ?? 0}%`}
            icon={Activity}
            color="bg-orange-500"
            loading={loading}
          />
        </div>

        {/* Main Sections */}
        {activeTab === 'map' ? (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Map Column */}
              <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapIcon className="w-5 h-5 text-gray-400" />
                  Morocco Map
                </h3>
                <MapErrorBoundary>
                  <MoroccoMap
                    data={MOCK_REGIONAL_DATA}
                    hoveredRegion={hoveredRegion}
                    onHover={setHoveredRegion}
                  />
                </MapErrorBoundary>
              </div>

              {/* Table Column */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TableIcon className="w-5 h-5 text-gray-400" />
                    Regional Statistics
                  </h3>
                  <RegionTable
                    data={MOCK_REGIONAL_DATA}
                    hoveredRegion={hoveredRegion}
                    onHover={setHoveredRegion}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Syringe className="w-5 h-5 text-gray-400" />
              Vaccine Supply Dashboard
            </h3>
            <SupplyDashboard
              data={MOCK_REGIONAL_DATA}
            />
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
}: {
  title: string
  value: string | number
  icon: any
  color: string
  loading: boolean
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {loading ? (
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mt-1" />
        ) : (
          <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
