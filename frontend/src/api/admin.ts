/**
 * Admin API — coverage, supply, region detail, Telegram (requires admin JWT).
 */
import { API_BASE, getAuthHeaders } from './auth'

const headers = (): HeadersInit => ({
  'Content-Type': 'application/json',
  ...getAuthHeaders(),
})

export interface CoverageRegion {
  region_id: number
  region_name: string
  population_2024: number
  estimated_annual_births: number
  total_registered: number
  vaccinated_count: number
  coverage_pct: number
  coverage_pct_display: number
  color: 'green' | 'yellow' | 'red'
  note?: string
}

export async function getCoverage(
  vaccine: string,
  opts?: { refresh?: boolean; date_from?: string; date_to?: string; mode?: 'registered_children' | 'vaccination_records' }
): Promise<CoverageRegion[]> {
  const params = new URLSearchParams({ vaccine })
  if (opts?.refresh) params.set('refresh', 'true')
  if (opts?.date_from) params.set('date_from', opts.date_from)
  if (opts?.date_to) params.set('date_to', opts.date_to)
  if (opts?.mode) params.set('mode', opts.mode)
  const res = await fetch(`${API_BASE}/admin/coverage?${params}`, { headers: headers() })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Erreur couverture')
  return res.json()
}

export interface SupplyRegion {
  region_id: number
  region_name: string
  births: number
  projected_need: number
  with_buffer: number
  current_stock: number
  shortage_or_surplus: string
}

export interface SupplyResponse {
  regions: SupplyRegion[]
  national: {
    current_stock: number
    projected_need_total: number
    projected_need_with_buffer_total: number
    surplus: number
    shortage: number
  }
  data_quality_warning: boolean
}

export async function getSupply(vaccine: string): Promise<SupplyResponse> {
  const res = await fetch(`${API_BASE}/admin/supply?vaccine=${encodeURIComponent(vaccine)}`, { headers: headers() })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Erreur approvisionnement')
  return res.json()
}

export interface RegionDetail {
  region_id: number
  region_name: string
  vaccine_name: string
  registered_children: { id: number; name: string; birthdate: string | null }[]
  by_period: { period_label: string; total: number; completed: number }[]
  last_30_days_count: number
  trend_weeks: { week_end: string; completed_count: number }[]
}

export async function getRegionDetail(regionId: number, vaccine: string): Promise<RegionDetail> {
  const res = await fetch(
    `${API_BASE}/admin/region/${regionId}/detail?vaccine=${encodeURIComponent(vaccine)}`,
    { headers: headers() }
  )
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Erreur détail région')
  return res.json()
}

export interface AdminRegion {
  id: number
  name: string
  population_2024: number
  estimated_annual_births: number
  telegram_chat_id: string | null
}

export async function getAdminRegions(): Promise<AdminRegion[]> {
  const res = await fetch(`${API_BASE}/admin/regions`, { headers: headers() })
  if (!res.ok) throw new Error('Erreur chargement régions')
  return res.json()
}

export async function updateRegionTelegram(regionId: number, telegram_chat_id: string | null): Promise<{ id: number; telegram_chat_id: string | null }> {
  const res = await fetch(`${API_BASE}/admin/region/${regionId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ telegram_chat_id: telegram_chat_id ?? '' }),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Erreur mise à jour')
  return res.json()
}

export interface TelegramGenerateMessage {
  region_id: number
  region_name: string
  preview: string
  can_send: boolean
  error: string | null
}

export async function telegramGenerate(body: {
  vaccine_name: string
  region_ids: number[]
  language: 'fr' | 'darija'
  template_type: 'summary' | 'urgent'
}): Promise<{ messages: TelegramGenerateMessage[] }> {
  const res = await fetch(`${API_BASE}/admin/telegram/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Erreur génération')
  return res.json()
}

export async function telegramSend(body: {
  vaccine_name: string
  region_ids: number[]
  language: 'fr' | 'darija'
  template_type: 'summary' | 'urgent'
  send: boolean
}): Promise<{ results: { region_id: number; success: boolean; error?: string }[] }> {
  const res = await fetch(`${API_BASE}/admin/telegram/send`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || 'Erreur envoi')
  return res.json()
}
