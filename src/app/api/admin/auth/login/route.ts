import { NextRequest, NextResponse } from 'next/server'
import { signSession, setSessionCookie } from '@/lib/admin-session'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@mealicious.com')
  .toLowerCase().split(',').map(e => e.trim()).filter(Boolean)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (
    !email || !password ||
    !ADMIN_EMAILS.includes(email.toLowerCase()) ||
    password !== ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  const token = await signSession({ email: email.toLowerCase() })
  const res = NextResponse.json({ ok: true })
  setSessionCookie(res, token)
  return res
}
