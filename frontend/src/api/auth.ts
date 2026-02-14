/**
 * Auth API – login and register against backend.
 * Backend base URL from env or default for dev.
 */
export const API_BASE =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'

const AUTH = `${API_BASE}/auth`

export const AUTH_KEYS = {
  TOKEN: 'vaccitrack_access_token',
  TYPE: 'vaccitrack_token_type',
} as const

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone_number?: string | null
  region_id?: number | null
}

export interface RegisterResponse {
  id: number
  name: string
  email: string
  phone_number: string | null
  created_at: string
}

export interface ApiError {
  detail: string | { msg?: string; loc?: unknown }[]
}

function getDetail(err: ApiError): string {
  const d = err.detail
  if (typeof d === 'string') return d
  if (Array.isArray(d) && d[0] && typeof d[0] === 'object' && 'msg' in d[0])
    return (d[0] as { msg: string }).msg
  return 'Request failed'
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${AUTH}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = (await res.json()) as LoginResponse | ApiError
  if (!res.ok) throw new Error(getDetail(data as ApiError))
  return data as LoginResponse
}

export async function register(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  const res = await fetch(`${AUTH}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone_number: payload.phone_number || null,
      region_id: payload.region_id ?? null,
    }),
  })
  const data = (await res.json()) as RegisterResponse | ApiError
  if (!res.ok) throw new Error(getDetail(data as ApiError))
  return data as RegisterResponse
}

export function saveToken(accessToken: string, tokenType: string): void {
  localStorage.setItem(AUTH_KEYS.TOKEN, accessToken)
  localStorage.setItem(AUTH_KEYS.TYPE, tokenType)
}

export function clearToken(): void {
  localStorage.removeItem(AUTH_KEYS.TOKEN)
  localStorage.removeItem(AUTH_KEYS.TYPE)
}

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem(AUTH_KEYS.TOKEN)
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

export interface MeResponse {
  id: number
  name: string
  email: string
  phone_number: string | null
  preferred_language: string | null
  is_admin?: boolean
  region_id: number | null
  created_at: string
}

export async function getMe(): Promise<MeResponse> {
  const res = await fetch(`${AUTH}/me`, { headers: getAuthHeaders() })
  const data = (await res.json()) as MeResponse | ApiError
  if (!res.ok) throw new Error(getDetail(data as ApiError))
  return data as MeResponse
}

export async function updatePreferredLanguage(
  preferred_language: 'ar' | 'fr' | 'en'
): Promise<MeResponse> {
  const res = await fetch(`${AUTH}/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ preferred_language }),
  })
  const data = (await res.json()) as MeResponse | ApiError
  if (!res.ok) throw new Error(getDetail(data as ApiError))
  return data as MeResponse
}
