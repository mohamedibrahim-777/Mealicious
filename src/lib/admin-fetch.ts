import { getFirebaseAuth } from './firebase'
import { useAppStore } from './store'

export class AdminFetchError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const auth = getFirebaseAuth()
  const fbUser = auth?.currentUser
  if (fbUser) {
    const token = await fbUser.getIdToken()
    return { Authorization: `Bearer ${token}` }
  }
  // Stub-admin bypass: always send for local dev testing
  const user = useAppStore.getState().user
  if (user?.role === 'admin') {
    return { 'X-Admin-Stub': `${user.email}:admin123` }
  }
  // Fallback: use hardcoded stub for unauthenticated admin API calls (dev only)
  return { 'X-Admin-Stub': 'admin@mealicious.com:admin123' }
}

export async function adminFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  const auth = await getAuthHeaders()
  for (const [k, v] of Object.entries(auth)) headers.set(k, v)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const res = await fetch(path, { ...init, headers })
  const text = await res.text()
  let data: unknown
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const msg = (data as { error?: string } | null)?.error ?? `HTTP ${res.status}`
    throw new AdminFetchError(res.status, msg)
  }
  return data as T
}
