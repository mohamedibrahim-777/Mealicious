// WhatsApp Cloud API (Meta)
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
// Setup: developers.facebook.com > App > WhatsApp > API Setup

import { db } from '@/lib/db'

const BASE = 'https://graph.facebook.com/v19.0'

function phoneId() { return process.env.WHATSAPP_PHONE_NUMBER_ID || '' }
function token() { return process.env.WHATSAPP_ACCESS_TOKEN || '' }

export function isConfigured() {
  return !!(process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_ACCESS_TOKEN)
}

// Normalize Indian phone: strip country code, add 91
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) return digits
  if (digits.length === 10) return `91${digits}`
  return digits
}

async function sendMessage(payload: unknown) {
  if (!isConfigured()) {
    console.log('[WhatsApp] Not configured. Payload:', JSON.stringify(payload))
    return { status: 'skipped' }
  }
  const res = await fetch(`${BASE}/${phoneId()}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`WhatsApp API error: ${JSON.stringify(data)}`)
  return data
}

// ─── Text message ───
export async function sendText(to: string, text: string) {
  return sendMessage({
    messaging_product: 'whatsapp',
    to: normalizePhone(to),
    type: 'text',
    text: { body: text },
  })
}

// ─── Template message ───
export async function sendTemplate(to: string, templateName: string, languageCode = 'en', components?: unknown[]) {
  return sendMessage({
    messaging_product: 'whatsapp',
    to: normalizePhone(to),
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(components ? { components } : {}),
    },
  })
}

// ─── Pre-built notification helpers ───

export async function notifyOrderConfirmed(phone: string, params: {
  customerName: string
  orderNumber: string
  items: string
  total: number
  paymentMethod: string
}) {
  const text = `Hi ${params.customerName}! 🎉\n\nYour Mealicious order *${params.orderNumber}* is confirmed!\n\n📦 *Items:* ${params.items}\n💰 *Total:* ₹${params.total}\n💳 *Payment:* ${params.paymentMethod.toUpperCase()}\n\nWe'll notify you when it ships. Track at: https://mealicious.store\n\nThank you for shopping with us! 🥗`
  return sendText(phone, text)
}

export async function notifyOrderShipped(phone: string, params: {
  customerName: string
  orderNumber: string
  courierName: string
  awb: string
  trackingUrl: string
}) {
  const text = `Hi ${params.customerName}! 🚚\n\nYour Mealicious order *${params.orderNumber}* has been shipped!\n\n📮 *Courier:* ${params.courierName}\n🔍 *AWB:* ${params.awb}\n\nTrack your order: ${params.trackingUrl}\n\nExpected delivery in 3–7 business days. 📦`
  return sendText(phone, text)
}

export async function notifyOrderDelivered(phone: string, params: {
  customerName: string
  orderNumber: string
}) {
  const text = `Hi ${params.customerName}! ✅\n\nYour Mealicious order *${params.orderNumber}* has been delivered!\n\nWe hope you enjoy your healthy snacks. 🥜\n\nPlease share your experience: https://mealicious.store\n\nFor any issues, contact us on WhatsApp: https://wa.me/916379858978`
  return sendText(phone, text)
}

export async function notifyOrderCancelled(phone: string, params: {
  customerName: string
  orderNumber: string
  total: number
}) {
  const text = `Hi ${params.customerName},\n\nYour Mealicious order *${params.orderNumber}* (₹${params.total}) has been cancelled.\n\nIf you paid online, refund will be processed in 5–7 business days.\n\nQuestions? Chat with us: https://wa.me/916379858978`
  return sendText(phone, text)
}

// Check opt-out before marketing messages (transactional msgs bypass this)
async function isOptedOut(phone: string): Promise<boolean> {
  try {
    const row = await db.whatsAppOptOut.findUnique({ where: { phone: normalizePhone(phone) } })
    return !!row
  } catch { return false }
}

export async function sendCartRecovery(phone: string, params: {
  customerName: string
  items: string
  cartValue: number
  couponCode?: string
}) {
  if (await isOptedOut(phone)) return { status: 'opted_out' }
  const couponLine = params.couponCode ? `\n🎁 Use code *${params.couponCode}* for extra discount!` : ''
  const text = `Hi ${params.customerName}! 👋\n\nYou left some items in your Mealicious cart:\n\n🛒 ${params.items}\n💰 Cart Value: ₹${params.cartValue}${couponLine}\n\nComplete your order before they sell out! 🔥\n👉 https://mealicious.store\n\nReply STOP to opt out.`
  return sendText(phone, text)
}

export async function sendPromotion(phone: string, params: {
  customerName: string
  message: string
  couponCode?: string
}) {
  if (await isOptedOut(phone)) return { status: 'opted_out' }
  const couponLine = params.couponCode ? `\n\n🎁 Use code: *${params.couponCode}*` : ''
  const text = `Hi ${params.customerName}! 🎉\n\n${params.message}${couponLine}\n\n👉 Shop now: https://mealicious.store\n\nReply STOP to opt out.`
  return sendText(phone, text)
}
