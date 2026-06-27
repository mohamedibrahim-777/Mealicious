'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Search, Package, Truck, CheckCircle2, Clock,
  ArrowRight, HelpCircle, PackageCheck, CircleDot, FileText,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'

function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.6, delay, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  )
}

const STEP_ICONS = [Package, CheckCircle2, PackageCheck, Truck, CircleDot]

interface OrderData {
  orderNumber: string
  status: string
  paymentStatus: string
  paymentMethod: string | null
  createdAt: string
  total: number
  items: { name: string; quantity: number; variant: string | null }[]
  shippingAddr: Record<string, string>
  trackingId: string | null
  trackingUrl: string | null
  shippingProvider: string | null
  steps: { label: string; status: 'completed' | 'current' | 'upcoming' }[]
}

export default function TrackOrderPage() {
  const navigate = useAppStore((s) => s.navigate)
  const [orderNumber, setOrderNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<OrderData | null>(null)
  const [error, setError] = useState('')

  async function handleTrack() {
    if (!orderNumber.trim()) { setError('Enter an order number'); return }
    setError(''); setLoading(true); setOrder(null)
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Order not found'); return }
      setOrder(data.order)
    } catch {
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-400 to-orange-400">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight font-serif">Track Your Order</h1>
            <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">Enter your order number to check live delivery status.</p>
          </motion.div>
        </div>
      </section>

      {/* Input */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-foreground mb-4">Enter Order Details</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="e.g. ML-ABC12345"
                    value={orderNumber}
                    onChange={(e) => { setOrderNumber(e.target.value.toUpperCase()); setError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                    className="h-11 flex-1 font-mono"
                  />
                  <Button size="lg" className="bg-orange-400 hover:bg-orange-500 text-white font-semibold shrink-0" onClick={handleTrack} disabled={loading}>
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? 'Tracking…' : 'Track'}
                  </Button>
                </div>
                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Loading */}
          {loading && (
            <FadeIn>
              <Card className="mt-6">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-400 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Tracking your order…</p>
                </CardContent>
              </Card>
            </FadeIn>
          )}

          {/* Result */}
          {order && (
            <FadeIn>
              <div className="mt-6 space-y-6">
                {/* Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-foreground">Order #{order.orderNumber}</h3>
                          <Badge className={`capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-orange-500'}`}>
                            {order.status}
                          </Badge>
                          <Badge variant="outline" className="capitalize text-xs">{order.paymentStatus}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Placed on {order.createdAt}</p>
                        <p className="text-sm font-medium mt-0.5">Total: ₹{order.total.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setOrder(null); setOrderNumber('') }}>Track Another</Button>
                        <a href={`/api/invoices/${order.orderNumber}`} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm" className="text-orange-500 border-orange-200">
                            <FileText className="h-3.5 w-3.5 mr-1" />Invoice
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardContent className="p-6 sm:p-8">
                    <h3 className="font-bold text-foreground mb-6">Order Status</h3>
                    <div className="space-y-0">
                      {order.steps.map((step, idx) => {
                        const Icon = STEP_ICONS[idx] ?? Package
                        const isLast = idx === order.steps.length - 1
                        return (
                          <div key={step.label} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`rounded-full p-2 shrink-0 ${step.status === 'completed' ? 'bg-blue-100' : step.status === 'current' ? 'bg-orange-400 ring-4 ring-blue-100' : 'bg-muted'}`}>
                                <Icon className={`h-4 w-4 ${step.status === 'completed' ? 'text-orange-400' : step.status === 'current' ? 'text-white' : 'text-muted-foreground/50'}`} />
                              </div>
                              {!isLast && <div className={`w-0.5 flex-1 min-h-[40px] ${step.status === 'completed' ? 'bg-blue-300' : 'bg-muted'}`} />}
                            </div>
                            <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                              <div className="flex items-center gap-2">
                                <h4 className={`font-semibold text-sm ${step.status === 'upcoming' ? 'text-muted-foreground' : 'text-orange-400'}`}>{step.label}</h4>
                                {step.status === 'current' && <Badge className="bg-orange-400 text-white text-[10px] px-1.5 py-0">CURRENT</Badge>}
                                {step.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-orange-400" />}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping + Items */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-foreground mb-4">Shipping Details</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Shipping Address</p>
                        <p className="text-sm text-foreground">
                          {order.shippingAddr.fullName || order.shippingAddr.name}<br />
                          {order.shippingAddr.address1 || order.shippingAddr.address}<br />
                          {order.shippingAddr.address2 && <>{order.shippingAddr.address2}<br /></>}
                          {order.shippingAddr.city}, {order.shippingAddr.state} - {order.shippingAddr.pincode}
                        </p>
                        {order.trackingId && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                              {order.shippingProvider || 'Courier'} AWB
                            </p>
                            {order.trackingUrl
                              ? <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="text-sm text-orange-500 font-mono hover:underline">{order.trackingId}</a>
                              : <p className="text-sm text-foreground font-mono">{order.trackingId}</p>
                            }
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Items</p>
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <p key={i} className="text-sm text-foreground">
                              {item.quantity}× {item.name}{item.variant ? ` (${item.variant})` : ''}
                            </p>
                          ))}
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Payment</p>
                          <p className="text-sm text-foreground capitalize">{order.paymentMethod || 'N/A'} — <span className="capitalize">{order.paymentStatus}</span></p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Help */}
                <Card>
                  <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold text-sm text-foreground">Need help with your order?</p>
                        <p className="text-xs text-muted-foreground">Support available Mon–Sat, 10 AM – 8 PM</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-blue-200 text-orange-400 hover:bg-blue-50" onClick={() => navigate('contact')}>
                      Contact Us <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </FadeIn>
          )}
        </div>
      </section>
    </div>
  )
}
