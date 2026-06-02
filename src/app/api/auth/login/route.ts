import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { timingSafeEqual } from 'crypto'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@mealicious.com')
  .toLowerCase().split(',').map(e => e.trim()).filter(Boolean)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

const INVALID = NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
const NO_ACCOUNT = NextResponse.json({ error: 'No account found with this email. Please register first.' }, { status: 404 })

function safeCompare(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a); const bb = Buffer.from(b)
    if (ab.length !== bb.length) { timingSafeEqual(ab, ab); return false }
    return timingSafeEqual(ab, bb)
  } catch { return false }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const email = typeof body.email === 'string' ? body.email : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const emailLc = email.toLowerCase().trim()

  // Admin login — constant-time compare
  if (ADMIN_EMAILS.includes(emailLc)) {
    if (!ADMIN_PASSWORD || !safeCompare(password, ADMIN_PASSWORD)) return INVALID
    return NextResponse.json({ user: { name: 'Admin', email: emailLc, phone: '', role: 'admin' } })
  }

  // Customer login
  const user = await db.user.findUnique({ where: { email: emailLc } })
  if (!user) return NO_ACCOUNT
  if (!user.passwordHash) return NextResponse.json({ error: 'No password set — please register to set one.' }, { status: 401 })

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return INVALID

  return NextResponse.json({
    user: { name: user.name, email: user.email, phone: user.phone ?? '', role: user.role === 'admin' ? 'admin' : 'user' },
  })
}
