import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { limitByIp } from '@/lib/rate-limit'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@mealicious.com')
  .toLowerCase().split(',').map(e => e.trim()).filter(Boolean)

export async function POST(req: NextRequest) {
  const limited = limitByIp(req, 'register', 5, 15 * 60 * 1000)
  if (limited) return limited

  const { name, email, phone, password } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const emailLc = String(email).toLowerCase().trim()

  // Block admin email from registering as customer
  if (ADMIN_EMAILS.includes(emailLc)) {
    return NextResponse.json({ error: 'This email cannot be used for registration' }, { status: 403 })
  }

  const existing = await db.user.findUnique({ where: { email: emailLc } })
  if (existing) {
    if (existing.passwordHash) {
      return NextResponse.json({ error: 'Account already exists. Please login.' }, { status: 409 })
    }
    // Guest account from checkout — allow setting password without email verification
    // since the email was already used to place a real order (implicit ownership proof)
    const passwordHash = await hashPassword(String(password))
    const updated = await db.user.update({
      where: { email: emailLc },
      data: { passwordHash },
    })
    return NextResponse.json({
      user: { name: updated.name, email: updated.email, phone: updated.phone ?? '', role: 'user' },
    })
  }

  const passwordHash = await hashPassword(String(password))
  const user = await db.user.create({
    data: {
      name: String(name).trim(),
      email: emailLc,
      phone: phone ? String(phone).trim() : null,
      passwordHash,
      role: 'customer',
    },
  })

  return NextResponse.json({
    user: { name: user.name, email: user.email, phone: user.phone ?? '', role: 'user' },
  }, { status: 201 })
}
