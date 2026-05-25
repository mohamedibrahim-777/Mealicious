import { jwtVerify, createRemoteJWKSet } from 'jose'
import { NextResponse } from 'next/server'

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ''
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@mealicious.com')
  .toLowerCase()
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean)

const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
)

export interface AuthUser {
  uid: string
  email: string
  isAdmin: boolean
}

export async function verifyFirebaseToken(authHeader: string | null): Promise<AuthUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7).trim()
  if (!token || !PROJECT_ID) return null
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    })
    const email = String(payload.email || '').toLowerCase()
    if (!email) return null
    return {
      uid: String(payload.sub || payload.user_id || ''),
      email,
      isAdmin: ADMIN_EMAILS.includes(email),
    }
  } catch {
    return null
  }
}

export async function requireAdmin(req: Request) {
  // Local stub-admin bypass: allow header X-Admin-Stub: admin@mealicious.com:admin123
  // (matches the client-side stub login in the Zustand store, so the existing
  // demo admin flow keeps working without a real Firebase session).
  const stub = req.headers.get('x-admin-stub')
  if (stub) {
    const [email, password] = stub.split(':')
    if (email && password === 'admin123' && ADMIN_EMAILS.includes(email.toLowerCase())) {
      return {
        user: { uid: 'stub-admin', email: email.toLowerCase(), isAdmin: true } as AuthUser,
        error: null as NextResponse | null,
      }
    }
  }
  const user = await verifyFirebaseToken(req.headers.get('authorization'))
  if (!user) return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (!user.isAdmin) return { user, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { user, error: null }
}
