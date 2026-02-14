/**
 * Admin Dashboard — Monitor régional d'immunité et approvisionnement.
 * (Telegram / Twilio : à ajouter plus tard si besoin.)
 * French UI; requires admin JWT.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE, getAuthHeaders, AUTH_KEYS } from '../api/auth'
import { getMe } from '../api/auth'
import {
  getCoverage,
  getSupply,
  getRegionDetail,
  type CoverageRegion,
  type SupplyResponse,
  type RegionDetail,
} from '../api/admin'
import { Logo } from '../components/Logo'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [vaccines, setVaccines] = useState<string[]>([])
  const [vaccine, setVaccine] = useState<string>('')
  const [coverage, setCoverage] = useState<CoverageRegion[]>([])
  const [supply, setSupply] = useState<SupplyResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refresh, setRefresh] = useState(false)
  const [detailRegion, setDetailRegion] = useState<RegionDetail | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)

  useEffect(() => {
    getMe()
      .then(me => {
        if (!me.is_admin) navigate('/dashboard')
      })
      .catch(() => navigate('/signin'))
  }, [navigate])

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_KEYS.TOKEN) : null
    if (!token) {
      navigate('/signin')
      return
    }
    fetch(`${API_BASE}/api/vaccines`, { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(setVaccines)
      .catch(() => setVaccines([]))
  }, [navigate])

  useEffect(() => {
    if (!vaccine) {
      setCoverage([])
      setSupply(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    Promise.all([
      getCoverage(vaccine, { refresh }).then(setCoverage),
      getSupply(vaccine).then(setSupply),
    ])
      .catch(e => setError(e instanceof Error ? e.message : 'Erreur'))
      .finally(() => { setLoading(false); setRefresh(false) })
  }, [vaccine, refresh])

  useEffect(() => {
    if (detailId == null || !vaccine) return
    getRegionDetail(detailId, vaccine).then(setDetailRegion).catch(() => setDetailRegion(null))
  }, [detailId, vaccine])

  const openDetail = (regionId: number) => setDetailId(regionId)
  const closeDetail = () => { setDetailId(null); setDetailRegion(null) }

  const colorClass = (c: string) =>
    c === 'green' ? 'bg-green-500' : c === 'yellow' ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo className="h-9 w-auto object-contain" />
            <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin — Immunité régionale</h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={vaccine}
              onChange={e => setVaccine(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 bg-white text-gray-900"
            >
              <option value="">Choisir un vaccin</option>
              {vaccines.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setRefresh(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Actualiser
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Retour
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 p-4">
            {error}
          </div>
        )}

        {loading && vaccine && (
          <p className="text-gray-500">Chargement…</p>
        )}

        {!loading && vaccine && coverage.length > 0 && (
          <>
            {/* Supply card */}
            {supply && (
              <section className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm w-full">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Approvisionnement national</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="p-3 rounded-lg bg-gray-50 flex flex-col items-center min-w-[120px]">
                    <p className="text-sm text-gray-500 text-center">Stock actuel</p>
                    <p className="text-xl font-bold text-gray-900 text-center">{supply.national.current_stock}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 flex flex-col items-center min-w-[120px]">
                    <p className="text-sm text-gray-500 text-center">Besoin projeté</p>
                    <p className="text-xl font-bold text-gray-900 text-center">{supply.national.projected_need_total}</p>
                  </div>
                  {/* <div className="p-3 rounded-lg bg-amber-50 flex flex-col items-center min-w-[120px]">
                    <p className="text-sm text-gray-500 text-center">Avec tampon 10%</p>
                    <p className="text-xl font-bold text-amber-800 text-center">{supply.national.projected_need_with_buffer_total}</p>
                  </div> */}
                  <div className="p-3 rounded-lg bg-red-50 flex flex-col items-center min-w-[120px]">
                    <p className="text-sm text-gray-500 text-center">Pénurie</p>
                    <p className="text-xl font-bold text-red-700 text-center">{supply.national.shortage}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 flex flex-col items-center min-w-[120px]">
                    <p className="text-sm text-gray-500 text-center">Surplus</p>
                    <p className="text-xl font-bold text-green-700 text-center">{supply.national.surplus}</p>
                  </div>
                </div>
                {supply.data_quality_warning && (
                  <p className="mt-2 text-sm text-amber-600 text-center">Attention : pas de donnée de stock pour ce vaccin (considéré 0).</p>
                )}
              </section>
            )}

            {/* Bar chart (fallback heatmap) */}
            <section className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Couverture par région</h2>
              <div className="space-y-2">
                {coverage.map(r => (
                  <div key={r.region_id} className="flex items-center gap-3">
                    <div className="w-48 text-sm text-gray-700 truncate" title={r.region_name}>{r.region_name}</div>
                    <div className="flex-1 h-8 bg-gray-100 rounded overflow-hidden flex">
                      <div
                        className={colorClass(r.color)}
                        style={{ width: `${Math.min(100, r.coverage_pct_display)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16">
                      {r.total_registered === 0 ? 'N/A' : `${r.coverage_pct_display}%`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {r.vaccinated_count}/{r.total_registered}
                    </span>
                    <button
                      type="button"
                      onClick={() => openDetail(r.region_id)}
                      className="text-sm text-teal-600 hover:underline"
                    >
                      Détail
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Region list */}
            <section className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Régions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-600">
                      <th className="pb-2 pr-2">Région</th>
                      <th className="pb-2 pr-2">Inscrits</th>
                      <th className="pb-2 pr-2">Vaccinés</th>
                      <th className="pb-2 pr-2">Couverture</th>
                      <th className="pb-2 pr-2">Couleur</th>
                      <th className="pb-2 pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverage.map(r => (
                      <tr key={r.region_id} className="border-b border-gray-100">
                        <td className="py-2 pr-2 font-medium">{r.region_name}</td>
                        <td className="py-2 pr-2">{r.total_registered}</td>
                        <td className="py-2 pr-2">{r.vaccinated_count}</td>
                        <td className="py-2 pr-2">{r.total_registered === 0 ? '—' : `${r.coverage_pct_display}%`}</td>
                        <td className="py-2 pr-2">
                          <span className={`inline-block w-3 h-3 rounded-full ${colorClass(r.color)}`} />
                        </td>
                        <td className="py-2 pr-2">
                          <button type="button" onClick={() => openDetail(r.region_id)} className="text-teal-600 hover:underline">Détail</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {!loading && vaccine && coverage.length === 0 && vaccines.length > 0 && (
          <p className="text-gray-500">Aucune donnée de couverture pour ce vaccin.</p>
        )}
      </div>

      {/* Region detail modal */}
      {detailId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeDetail}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Détail région {detailRegion?.region_name ?? detailId}
            </h3>
            {detailRegion ? (
              <div className="space-y-3 text-sm">
                <p>Vaccin : {detailRegion.vaccine_name}</p>
                <p>Enfants inscrits : {detailRegion.registered_children.length}</p>
                <p>Vaccinations (30 derniers jours) : {detailRegion.last_30_days_count}</p>
                <div>
                  <p className="font-medium text-gray-700">Par période</p>
                  <ul className="list-disc list-inside">
                    {detailRegion.by_period.map(p => (
                      <li key={p.period_label}>{p.period_label} : {p.completed}/{p.total}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Tendance (4 semaines)</p>
                  <ul className="list-disc list-inside">
                    {detailRegion.trend_weeks.map((w, i) => (
                      <li key={i}>{w.week_end} : {w.completed_count}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Chargement…</p>
            )}
            <button type="button" onClick={closeDetail} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Fermer</button>
          </div>
        </div>
      )}

    </div>
  )
}
