import { API_BASE, getAuthHeaders } from './auth'

export interface NotificationItem {
  id: number
  child_id: number
  child_name: string
  vaccine_name: string
  period_label: string
  due_date: string | null
  audio_url: string
}

const headers = (): HeadersInit => ({
  'Content-Type': 'application/json',
  ...getAuthHeaders(),
})

export async function getNotifications(): Promise<NotificationItem[]> {
  const res = await fetch(`${API_BASE}/notifications`, { headers: headers() })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { detail?: string }).detail || res.statusText)
  }
  return res.json()
}

export async function deleteNotification(vaccinationId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/${vaccinationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { detail?: string }).detail || res.statusText)
  }
}
