const CASHFREE_API_VERSION = '2023-08-01'

type CashfreeMode = 'sandbox' | 'production'

function getMode(): CashfreeMode {
  return (process.env.CASHFREE_ENV as CashfreeMode) === 'production' ? 'production' : 'sandbox'
}

function getBaseUrl(): string {
  return getMode() === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg'
}

export class CashfreeNotConfiguredError extends Error {
  constructor() {
    super('Cashfree credentials missing. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env')
    this.name = 'CashfreeNotConfiguredError'
  }
}

export function isCashfreeConfigured(): boolean {
  return Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY)
}

function getCreds() {
  const appId = process.env.CASHFREE_APP_ID
  const secretKey = process.env.CASHFREE_SECRET_KEY
  if (!appId || !secretKey) {
    throw new CashfreeNotConfiguredError()
  }
  return { appId, secretKey }
}

export type CashfreeCustomer = {
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
}

export type CreateOrderInput = {
  orderId: string
  orderAmount: number
  orderCurrency?: string
  customer: CashfreeCustomer
  returnUrl: string
  notifyUrl?: string
  orderNote?: string
}

export type CashfreeOrderResponse = {
  order_id: string
  payment_session_id: string
  order_status: string
  order_amount: number
  order_currency: string
}

export async function createCashfreeOrder(
  input: CreateOrderInput
): Promise<CashfreeOrderResponse> {
  const { appId, secretKey } = getCreds()
  const body = {
    order_id: input.orderId,
    order_amount: input.orderAmount,
    order_currency: input.orderCurrency ?? 'INR',
    customer_details: input.customer,
    order_meta: {
      return_url: input.returnUrl,
      ...(input.notifyUrl ? { notify_url: input.notifyUrl } : {}),
    },
    ...(input.orderNote ? { order_note: input.orderNote } : {}),
  }

  const res = await fetch(`${getBaseUrl()}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': CASHFREE_API_VERSION,
      'x-client-id': appId,
      'x-client-secret': secretKey,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(
      `Cashfree createOrder failed (${res.status}): ${data?.message ?? JSON.stringify(data)}`
    )
  }
  return data as CashfreeOrderResponse
}

export type CashfreeOrderStatus = {
  order_id: string
  order_status: 'PAID' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | string
  order_amount: number
  order_currency: string
}

export async function verifyCashfreeOrder(orderId: string): Promise<CashfreeOrderStatus> {
  const { appId, secretKey } = getCreds()
  const res = await fetch(`${getBaseUrl()}/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: {
      'x-api-version': CASHFREE_API_VERSION,
      'x-client-id': appId,
      'x-client-secret': secretKey,
    },
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(
      `Cashfree verifyOrder failed (${res.status}): ${data?.message ?? JSON.stringify(data)}`
    )
  }
  return data as CashfreeOrderStatus
}

export function getCashfreeMode(): CashfreeMode {
  return getMode()
}
