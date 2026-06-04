// Client-side conversion event tracking — fires to both GA4 and Facebook Pixel.
// Safe no-op when analytics not configured (scripts absent).

/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
  }
}

function ga(event: string, params: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) window.gtag('event', event, params)
}

function fb(event: string, params: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) window.fbq('track', event, params)
}

export function trackViewContent(item: { id: string; name: string; price: number }) {
  ga('view_item', { currency: 'INR', value: item.price, items: [{ item_id: item.id, item_name: item.name, price: item.price }] })
  fb('ViewContent', { content_ids: [item.id], content_name: item.name, content_type: 'product', value: item.price, currency: 'INR' })
}

export function trackAddToCart(item: { id: string; name: string; price: number; quantity: number }) {
  const value = item.price * item.quantity
  ga('add_to_cart', { currency: 'INR', value, items: [{ item_id: item.id, item_name: item.name, price: item.price, quantity: item.quantity }] })
  fb('AddToCart', { content_ids: [item.id], content_name: item.name, content_type: 'product', value, currency: 'INR' })
}

export function trackInitiateCheckout(value: number, numItems: number) {
  ga('begin_checkout', { currency: 'INR', value })
  fb('InitiateCheckout', { value, currency: 'INR', num_items: numItems })
}

export function trackPurchase(params: { orderId: string; value: number; items: { id: string; name: string; quantity: number; price: number }[] }) {
  ga('purchase', {
    transaction_id: params.orderId,
    currency: 'INR',
    value: params.value,
    items: params.items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })),
  })
  fb('Purchase', {
    value: params.value,
    currency: 'INR',
    content_ids: params.items.map(i => i.id),
    content_type: 'product',
    num_items: params.items.reduce((s, i) => s + i.quantity, 0),
  })
}

export function trackSearch(query: string) {
  ga('search', { search_term: query })
  fb('Search', { search_string: query })
}

export function trackLead(type: string) {
  ga('generate_lead', { type })
  fb('Lead', { content_name: type })
}
