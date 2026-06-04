import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Allow-list of legitimate push service hosts — prevents SSRF where web-push
// would later POST to an attacker-controlled endpoint.
const ALLOWED_PUSH_HOSTS = [
  'fcm.googleapis.com',
  'push.services.mozilla.com',
  'updates.push.services.mozilla.com',
  'web.push.apple.com',
  'notify.windows.com',
]

function isAllowedEndpoint(endpoint: string): boolean {
  try {
    const u = new URL(endpoint)
    if (u.protocol !== 'https:') return false
    const host = u.hostname.toLowerCase()
    return ALLOWED_PUSH_HOSTS.some(h => host === h || host.endsWith(`.${h}`))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const { subscription, email } = await req.json()

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  if (!isAllowedEndpoint(subscription.endpoint)) {
    return NextResponse.json({ error: 'Invalid push endpoint' }, { status: 400 })
  }

  await db.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      email: email ? String(email).toLowerCase() : null,
    },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      ...(email ? { email: String(email).toLowerCase() } : {}),
    },
  })

  return NextResponse.json({ ok: true })
}

// DELETE — unsubscribe
export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json()
  if (!endpoint) return NextResponse.json({ error: 'endpoint required' }, { status: 400 })
  await db.pushSubscription.deleteMany({ where: { endpoint } })
  return NextResponse.json({ ok: true })
}
