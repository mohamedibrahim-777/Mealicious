import webpush from 'web-push'

let configured = false

function ensureConfigured(): boolean {
  if (configured) return true
  const pub = process.env.VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@mealicious.store'
  if (!pub || !priv) return false
  webpush.setVapidDetails(subject, pub, priv)
  configured = true
  return true
}

export function isPushConfigured() {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  icon?: string
  tag?: string
}

export interface SubscriptionRecord {
  endpoint: string
  p256dh: string
  auth: string
}

export async function sendPush(sub: SubscriptionRecord, payload: PushPayload): Promise<boolean> {
  if (!ensureConfigured()) return false
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload)
    )
    return true
  } catch (e: unknown) {
    // 404/410 = expired subscription
    const statusCode = (e as { statusCode?: number })?.statusCode
    if (statusCode === 404 || statusCode === 410) throw { expired: true, endpoint: sub.endpoint }
    return false
  }
}
