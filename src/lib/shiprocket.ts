import fs from 'fs'
import path from 'path'

function initEnv() {
  const targets = [
    process.cwd(),
    path.join(process.cwd(), '..'),
    path.join(process.cwd(), '..', '..'),
  ]
  for (const dir of targets) {
    const envPath = path.join(dir, '.env')
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf-8')
        content.split('\n').forEach(line => {
          const trimmed = line.trim()
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=')
            const key = trimmed.substring(0, idx).trim()
            const val = trimmed.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '')
            if (key) {
              // Always load/overwrite SHIPROCKET variables to ensure they are fresh from .env
              if (key.startsWith('SHIPROCKET_') || !(key in process.env)) {
                process.env[key] = val
              }
            }
          }
        })
        console.log(`[Shiprocket Env] Loaded environment from: ${envPath}`)
        break
      } catch (e) {
        console.error(`[Shiprocket Env] Failed to read/parse ${envPath}:`, e)
      }
    }
  }
}

// Run environment loader immediately
initEnv()

const BASE = 'https://apiv2.shiprocket.in/v1/external'

let _token: string | null = null
let _tokenExpiry = 0

export interface ShiprocketToken {
  token: string
  expiresAt: number
}

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token

  const email = process.env.SHIPROCKET_EMAIL
  const password = process.env.SHIPROCKET_PASSWORD

  if (!email || !password) {
    throw new Error(`Shiprocket credentials missing. Please set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in your env. (Email status: ${email ? 'set' : 'missing'}, Password status: ${password ? 'set' : 'missing'})`)
  }

  console.log(`[Shiprocket] Attempting auth login for email: ${email}`)

  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  
  if (!res.ok) {
    const errorText = await res.text().catch(() => '')
    throw new Error(`Shiprocket auth failed: status ${res.status} - ${errorText}`)
  }
  
  const data = await res.json()
  if (!data.token) {
    throw new Error(`Shiprocket auth response missing token: ${JSON.stringify(data)}`)
  }

  _token = data.token
  _tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000 // 9 days (token valid 10 days)
  return _token!
}

async function sr(path: string, options: RequestInit = {}) {
  const token = await getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  })
  const text = await res.text()
  let data: unknown
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) throw new Error(`Shiprocket ${path} failed: ${JSON.stringify(data)}`)
  return data
}

export interface ShippingRate {
  courier_name: string
  courier_id: number
  rate: number
  estimated_delivery_days: number
  etd: string
  cod: boolean
}

export async function getShippingRates(params: {
  pickupPostcode: string
  deliveryPostcode: string
  weight: number   // kg
  cod: boolean
  declaredValue: number
}): Promise<ShippingRate[]> {
  const { pickupPostcode, deliveryPostcode, weight, cod, declaredValue } = params
  const data = await sr(
    `/courier/serviceability/?pickup_postcode=${pickupPostcode}&delivery_postcode=${deliveryPostcode}&weight=${weight}&cod=${cod ? 1 : 0}&declared_value=${declaredValue}&is_return=0`
  ) as { data?: { available_courier_companies?: ShippingRate[] } }
  return data?.data?.available_courier_companies ?? []
}

export interface CreateOrderParams {
  orderId: string
  orderDate: string
  pickupLocation: string
  billingName: string
  billingAddress: string
  billingCity: string
  billingPincode: string
  billingState: string
  billingCountry: string
  billingEmail: string
  billingPhone: string
  shippingIsBilling?: boolean
  orderItems: { name: string; sku: string; units: number; sellingPrice: number; discount?: number; tax?: number; hsn?: number }[]
  paymentMethod: 'COD' | 'Prepaid'
  subTotal: number
  length: number
  breadth: number
  height: number
  weight: number
}

export async function createShiprocketOrder(params: CreateOrderParams) {
  const data = await sr('/orders/create/adhoc', {
    method: 'POST',
    body: JSON.stringify({
      order_id: params.orderId,
      order_date: params.orderDate,
      pickup_location: params.pickupLocation || process.env.SHIPROCKET_PICKUP_NAME || 'Primary',
      billing_customer_name: params.billingName,
      billing_address: params.billingAddress,
      billing_city: params.billingCity,
      billing_pincode: params.billingPincode,
      billing_state: params.billingState,
      billing_country: params.billingCountry || 'India',
      billing_email: params.billingEmail,
      billing_phone: params.billingPhone,
      shipping_is_billing: params.shippingIsBilling ?? true,
      order_items: params.orderItems,
      payment_method: params.paymentMethod,
      sub_total: params.subTotal,
      length: params.length,
      breadth: params.breadth,
      height: params.height,
      weight: params.weight,
      channel_id: process.env.SHIPROCKET_CHANNEL_ID ? Number(process.env.SHIPROCKET_CHANNEL_ID) : undefined,
    }),
  }) as { order_id?: number; shipment_id?: number; status?: string; awb_code?: string; courier_name?: string; label_url?: string }
  return data
}

export async function assignAWB(shipmentId: number, courierId: number) {
  return sr('/courier/assign/awb', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: String(shipmentId), courier_id: String(courierId) }),
  }) as Promise<{ awb_assign_status?: number; response?: { data?: { awb_code?: string; courier_name?: string; routing_code?: string } } }>
}

export async function generateLabel(shipmentIds: number[]) {
  return sr('/courier/generate/label', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: shipmentIds }),
  }) as Promise<{ label_created?: number; url?: string }>
}

export async function getShipmentTracking(awb: string) {
  return sr(`/courier/track/awb/${awb}`) as Promise<{
    tracking_data?: {
      track_status?: number
      shipment_status?: string
      shipment_track?: { current_status?: string; delivered_date?: string; etd?: string }[]
      shipment_track_activities?: { date?: string; activity?: string; location?: string }[]
    }
  }>
}

export async function cancelShiprocketOrder(orderIds: number[]) {
  return sr('/orders/cancel', {
    method: 'POST',
    body: JSON.stringify({ ids: orderIds }),
  })
}
