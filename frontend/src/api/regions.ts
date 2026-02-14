import { API_BASE } from './auth'

export interface Region {
  id: number
  name: string
}

export async function getRegions(): Promise<Region[]> {
  const res = await fetch(`${API_BASE}/api/regions`)
  if (!res.ok) throw new Error('Failed to load regions')
  return res.json()
}
