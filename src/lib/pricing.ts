import { db } from './db'

export interface CouponDef {
  discount: number
  type: 'percent' | 'flat'
  minOrder: number
  maxDiscount?: number
}

export const COUPON_CODES: Record<string, CouponDef> = {
  MEAL10: { discount: 10, type: 'percent', minOrder: 499 },
  SNACK20: { discount: 20, type: 'percent', minOrder: 999 },
  FLAT50: { discount: 50, type: 'flat', minOrder: 599 },
  WELCOME: { discount: 15, type: 'percent', minOrder: 399 },
  IBUU50: { discount: 49, type: 'flat', minOrder: 0 },
}

export interface PricingItemInput {
  productId: string
  quantity: number
  variant?: string | null
}

export interface PricedItem {
  productId: string
  name: string
  image: string
  price: number
  salePrice: number | null
  unitPrice: number
  quantity: number
  variant: string | null
  lineSubtotal: number
}

export interface Totals {
  items: PricedItem[]
  subtotal: number
  discount: number
  appliedCoupon: string | null
  couponError: string | null
  shipping: number
  codFee: number
  gst: number
  total: number
}

export async function priceCartFromDb(input: PricingItemInput[]): Promise<PricedItem[]> {
  if (!Array.isArray(input) || input.length === 0) return []
  const ids = [...new Set(input.map((i) => String(i.productId)).filter(Boolean))]
  if (ids.length === 0) throw new Error('items: missing productId')
  const rows = await db.product.findMany({
    where: { id: { in: ids }, isActive: true },
  })
  const byId = new Map(rows.map((r) => [r.id, r]))
  const out: PricedItem[] = []
  for (const it of input) {
    const p = byId.get(String(it.productId))
    if (!p) throw new Error(`Unknown or inactive productId: ${it.productId}`)
    const qty = Math.max(1, Math.floor(Number(it.quantity) || 0))
    if (qty < 1) throw new Error(`Invalid quantity for ${p.name}`)
    const unit = p.salePrice ?? p.price
    let firstImage = ''
    try {
      const parsed = JSON.parse(p.images)
      if (Array.isArray(parsed) && typeof parsed[0] === 'string') firstImage = parsed[0]
    } catch {}
    out.push({
      productId: p.id,
      name: p.name,
      image: firstImage,
      price: p.price,
      salePrice: p.salePrice,
      unitPrice: unit,
      quantity: qty,
      variant: it.variant ?? null,
      lineSubtotal: unit * qty,
    })
  }
  return out
}

export function computeTotals(
  items: PricedItem[],
  opts: { couponCode?: string | null; paymentMethod?: 'cod' | 'online' | string | null } = {},
): Totals {
  const subtotal = items.reduce((s, it) => s + it.lineSubtotal, 0)
  const shipping = subtotal >= 499 ? 0 : (subtotal > 0 ? 49 : 0)
  const codFee = 0

  let discount = 0
  let appliedCoupon: string | null = null
  let couponError: string | null = null
  const rawCode = opts.couponCode?.trim().toUpperCase() ?? ''
  if (rawCode) {
    const coupon = COUPON_CODES[rawCode]
    if (!coupon) {
      couponError = 'Invalid coupon code'
    } else if (subtotal < coupon.minOrder) {
      couponError = `Minimum order of ₹${coupon.minOrder} required`
    } else {
      let d = coupon.type === 'percent'
        ? Math.round((subtotal * coupon.discount) / 100)
        : coupon.discount
      if (coupon.maxDiscount != null) d = Math.min(d, coupon.maxDiscount)
      d = Math.min(d, subtotal)
      discount = d
      appliedCoupon = rawCode
    }
  }

  // Apply 10% prepaid discount on online orders
  const prepaidDiscount = opts.paymentMethod === 'online' ? Math.round((subtotal - discount) * 0.10) : 0
  discount += prepaidDiscount

  const afterDiscount = subtotal - discount
  const gst = 0
  const total = afterDiscount + shipping + codFee + gst

  return { items, subtotal, discount, appliedCoupon, couponError, shipping, codFee, gst, total }
}
