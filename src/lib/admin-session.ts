import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'admin-session'
const rawSecret = process.env.ADMIN_SESSION_SECRET
const SECRET = new TextEncoder().encode(rawSecret && rawSecret.length >= 32 ? rawSecret : 'fallback-insecure-secret-change-in-production-min-32-chars')
const EXPIRY = '7d'

export interface AdminSession {
  email: string
}

export async function signSession(payload: AdminSession): Promise<string> {
  if (!rawSecret || rawSecret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be set to a strong random value (min 32 chars)')
  }
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET)
}

export async function verifySession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    if (!payload.email) return null
    return { email: String(payload.email) }
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
}

export function getSessionFromRequest(req: Request): Promise<AdminSession | null> {
  let token: string | undefined
  if ('cookies' in req && typeof (req as any).cookies?.get === 'function') {
    token = (req as any).cookies.get(COOKIE_NAME)?.value
  } else {
    const cookieHeader = req.headers.get('cookie')
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(^|;)\\s*${COOKIE_NAME}\\s*=\\s*([^;]+)`))
      if (match) {
        token = decodeURIComponent(match[2])
      }
    }
  }
  if (!token) return Promise.resolve(null)
  return verifySession(token)
}
