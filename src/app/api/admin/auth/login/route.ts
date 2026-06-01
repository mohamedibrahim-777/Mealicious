import { NextRequest, NextResponse } from 'next/server'
import { signSession, setSessionCookie } from '@/lib/admin-session'
import { timingSafeEqual } from 'crypto'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .toLowerCase().split(',').map(e => e.trim()).filter(Boolean)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

if (!ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD env var must be set')
}
if (ADMIN_EMAILS.length === 0) {
  throw new Error('ADMIN_EMAILS env var must be set')
}

function safeEqual(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a)
    const bb = Buffer.from(b)
    if (ab.length !== bb.length) {
      // still run comparison to avoid timing leak on length
      timingSafeEqual(ab, ab)
      return false
    }
    return timingSafeEqual(ab, bb)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  if (req.headers.get('content-type') !== 'application/json') {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  const { email, password } = await req.json()
  if (
    !email || !password ||
    !ADMIN_EMAILS.includes(String(email).toLowerCase()) ||
    !safeEqual(String(password), ADMIN_PASSWORD)
  ) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  const token = await signSession({ email: String(email).toLowerCase() })
  const res = NextResponse.json({ ok: true })
  setSessionCookie(res, token)
  return res
}
