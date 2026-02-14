import { API_BASE, getAuthHeaders } from './auth'

const headers = (): HeadersInit => ({
  'Content-Type': 'application/json',
  ...getAuthHeaders(),
})

export interface Child {
  id: number
  name: string
  birthdate: string | null
  gender: string | null
  created_at: string
}

export interface TimelineItem {
  id: number
  vaccine_name: string
  period_label: string
  due_date: string | null
  completed: boolean
  completed_at: string | null
  status: 'completed' | 'due' | 'overdue' | 'upcoming'
  remindable: boolean
}

export interface ApiError {
  detail: string
}

async function handleRes<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as ApiError).detail || res.statusText)
  return data as T
}

export async function getChildren(): Promise<Child[]> {
  const res = await fetch(`${API_BASE}/children/`, { headers: headers() })
  return handleRes<Child[]>(res)
}

export async function getTimeline(childId: number): Promise<TimelineItem[]> {
  const res = await fetch(`${API_BASE}/children/${childId}/timeline`, {
    headers: headers(),
  })
  return handleRes<TimelineItem[]>(res)
}

export async function completeVaccination(vaccinationId: number): Promise<void> {
  const res = await fetch(
    `${API_BASE}/vaccinations/${vaccinationId}/complete`,
    { method: 'PATCH', headers: headers() }
  )
  await handleRes<unknown>(res)
}

export interface CreateChildPayload {
  name: string
  birthdate: string
  gender?: string | null
}

export interface UpdateChildPayload {
  name?: string
  gender?: string | null
}

export async function createChild(payload: CreateChildPayload): Promise<Child> {
  const res = await fetch(`${API_BASE}/children/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      name: payload.name,
      birthdate: payload.birthdate,
      gender: payload.gender || null,
    }),
  })
  return handleRes<Child>(res)
}

export async function updateChild(
  childId: number,
  payload: UpdateChildPayload
): Promise<Child> {
  const body: Record<string, unknown> = {}
  if (payload.name !== undefined) body.name = payload.name
  if (payload.gender !== undefined) body.gender = payload.gender ?? null
  const res = await fetch(`${API_BASE}/children/${childId}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(body),
  })
  return handleRes<Child>(res)
}

export async function deleteChild(childId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/children/${childId}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as ApiError).detail || res.statusText)
  }
}
