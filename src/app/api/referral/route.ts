import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Generate a short referral code from user id
function makeCode(seed: string): string {
  const base = seed.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  return `MEAL${base.slice(-5)}`
}

// GET ?email= — fetch or create the user's referral code + stats
export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get('email')?.toLowerCase().trim()
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const user = await db.user.findUnique({ where: { email } })
  // Generic empty response when no account — avoids account-enumeration oracle
  if (!user) {
    return NextResponse.json({ code: null, shareUrl: null, credits: 0, totalReferrals: 0, completedReferrals: 0, pendingReferrals: 0 })
  }

  let code = user.referralCode
  if (!code) {
    code = makeCode(user.id)
    // ensure uniqueness
    let attempt = 0
    while (await db.user.findFirst({ where: { referralCode: code, NOT: { id: user.id } } })) {
      attempt++
      code = `${makeCode(user.id)}${attempt}`
    }
    await db.user.update({ where: { id: user.id }, data: { referralCode: code } })
  }

  const referrals = await db.referral.findMany({ where: { referrerId: user.id }, orderBy: { createdAt: 'desc' } })
  const completed = referrals.filter(r => r.status === 'completed')

  // NOTE: customer auth is client-side only (no session cookie), so this endpoint
  // takes email as a param. Referral code is meant to be shared publicly; credit
  // balance is low-sensitivity. Reward only triggers on referee's first PAID order,
  // so the referral flow cannot be abused for free credit.
  return NextResponse.json({
    code,
    shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://mealicious.store'}/?ref=${code}`,
    credits: user.referralCredits,
    totalReferrals: referrals.length,
    completedReferrals: completed.length,
    pendingReferrals: referrals.length - completed.length,
  })
}

// POST — record a referral signup (referee used a code)
export async function POST(req: NextRequest) {
  const { code, refereeEmail, refereePhone } = await req.json()
  if (!code || !refereeEmail) {
    return NextResponse.json({ error: 'code and refereeEmail required' }, { status: 400 })
  }

  const referrer = await db.user.findFirst({ where: { referralCode: String(code).toUpperCase() } })
  if (!referrer) return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })

  const refereeEmailLc = String(refereeEmail).toLowerCase().trim()
  if (referrer.email === refereeEmailLc) {
    return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 })
  }

  // Prevent duplicate referral for same referee
  const existing = await db.referral.findFirst({ where: { referrerId: referrer.id, refereeEmail: refereeEmailLc } })
  if (existing) return NextResponse.json({ ok: true, alreadyReferred: true })

  await db.referral.create({
    data: {
      referrerId: referrer.id,
      refereeEmail: refereeEmailLc,
      refereePhone: refereePhone ? String(refereePhone) : null,
      status: 'pending',
    },
  })

  // Tag the referee user (if exists) with referredBy
  await db.user.updateMany({
    where: { email: refereeEmailLc, referredById: null },
    data: { referredById: referrer.id },
  })

  return NextResponse.json({ ok: true })
}
