import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/password'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@mealicious.com')
  .toLowerCase().split(',').map(e => e.trim()).filter(Boolean)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const emailLc = String(email).toLowerCase().trim()

  // Admin login
  if (ADMIN_EMAILS.includes(emailLc)) {
    if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    return NextResponse.json({
      user: { name: 'Admin', email: emailLc, phone: '', role: 'admin' },
    })
  }

  // Customer login — must exist in DB with a password set
  const user = await db.user.findUnique({ where: { email: emailLc } })

  if (!user) {
    return NextResponse.json({ error: 'No account found with this email. Please register first.' }, { status: 404 })
  }

  if (!user.passwordHash) {
    return NextResponse.json({ error: 'This account has no password set. Please register again.' }, { status: 401 })
  }

  const valid = await verifyPassword(String(password), user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role === 'admin' ? 'admin' : 'user',
    },
  })
}
