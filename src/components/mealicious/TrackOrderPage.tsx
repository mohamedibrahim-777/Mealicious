'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  ArrowRight,
  HelpCircle,
  PackageCheck,
  CircleDot,
  CircleCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/lib/store'

/* ─────────────────────── animation helpers ─────────────────────── */

function FadeInWhenVisible({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────── tracking timeline data ─────────────────────── */

const trackingSteps = [
  {
    label: 'Order Placed',
    date: 'Mar 1, 2025 - 10:30 AM',
    detail: 'Your order has been placed successfully',
    status: 'completed' as const,
    icon: Package,
  },
  {
    label: 'Confirmed',
    date: 'Mar 1, 2025 - 11:15 AM',
    detail: 'Order confirmed and payment verified',
    status: 'completed' as const,
    icon: CheckCircle2,
  },
  {
    label: 'Processing',
    date: 'Mar 2, 2025 - 9:00 AM',
    detail: 'Your order is being prepared for shipment',
    status: 'completed' as const,
    icon: PackageCheck,
  },
  {
    label: 'Shipped',
    date: 'Mar 3, 2025 - 2:45 PM',
    detail: 'Package dispatched via BlueDart - AWB: BD1234567890',
    status: 'current' as const,
    icon: Truck,
  },
  {
    label: 'Out for Delivery',
    date: 'Expected: Mar 5, 2025',
    detail: 'Package will be delivered today by our delivery partner',
    status: 'upcoming' as const,
    icon: CircleDot,
  },
  {
    label: 'Delivered',
    date: 'Expected: Mar 5, 2025',
    detail: 'Package will be handed over to you',
    status: 'upcoming' as const,
    icon: CheckCircle2,
  },
]

/* ═══════════════════════ TRACK ORDER PAGE ═══════════════════════ */

export default function TrackOrderPage() {
  const navigate = useAppStore((s) => s.navigate)
  const [orderNumber, setOrderNumber] = useState('')
  const [isTracking, setIsTracking] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const handleTrack = () => {
    if (!orderNumber.trim()) {
      setIsTracking(true)
      return
    }
    setIsTracking(true)
    // Simulate loading
    setTimeout(() => {
      setShowResult(true)
    }, 1500)
  }

  const handleReset = () => {
    setOrderNumber('')
    setIsTracking(false)
    setShowResult(false)
  }

  return (
    <div className="flex flex-col">
      {/* ──────── 1. Hero Section ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-400 to-orange-400">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Track Your Order
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
              Enter your order number to check the current status of your delivery.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ──────── 2. Track Order Input ──────── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <Card>
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-foreground mb-4">Enter Order Details</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    placeholder="Enter order number (e.g., ML-DEMO1234)"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                    className="h-11 flex-1"
                  />
                  <Button
                    size="lg"
                    className="bg-orange-400 hover:bg-orange-400 text-white font-semibold shrink-0"
                    onClick={handleTrack}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Track
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Try entering <strong className="text-foreground">ML-DEMO1234</strong> for a demo tracking result.
                </p>
              </CardContent>
            </Card>
          </FadeInWhenVisible>

          {/* Empty State — No order number entered */}
          {isTracking && !orderNumber.trim() && !showResult && (
            <FadeInWhenVisible>
              <Card className="mt-6">
                <CardContent className="p-8 text-center">
                  <HelpCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No Order Number?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You can find your order number in your order confirmation email or SMS.
                    If you&apos;re having trouble, our support team is happy to help.
                  </p>
                  <Button
                    variant="outline"
                    className="border-blue-200 text-orange-400 hover:bg-blue-50"
                    onClick={() => navigate('contact')}
                  >
                    Contact Support
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </FadeInWhenVisible>
          )}

          {/* Loading State */}
          {isTracking && orderNumber.trim() && !showResult && (
            <FadeInWhenVisible>
              <Card className="mt-6">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-400 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Tracking your order...</p>
                </CardContent>
              </Card>
            </FadeInWhenVisible>
          )}

          {/* Tracking Result */}
          {showResult && (
            <FadeInWhenVisible>
              <div className="mt-6 space-y-6">
                {/* Order Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-foreground">Order #{orderNumber || 'ML-DEMO1234'}</h3>
                          <Badge className="bg-blue-100 text-orange-400 border-blue-200">
                            In Transit
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Placed on March 1, 2025 at 10:30 AM
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                      >
                        Track Another Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Estimated Delivery */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="rounded-full bg-blue-100 p-3 shrink-0">
                      <Clock className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-orange-400">Estimated Delivery</p>
                      <p className="text-orange-400 text-sm">March 5, 2025 (Wednesday) by 8:00 PM</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Tracking Timeline */}
                <Card>
                  <CardContent className="p-6 sm:p-8">
                    <h3 className="font-bold text-foreground mb-6">Order Status Timeline</h3>
                    <div className="space-y-0">
                      {trackingSteps.map((step, idx) => {
                        const Icon = step.icon
                        const isLast = idx === trackingSteps.length - 1
                        return (
                          <div key={step.label} className="flex gap-4">
                            {/* Timeline Line + Dot */}
                            <div className="flex flex-col items-center">
                              <div
                                className={`rounded-full p-2 shrink-0 ${
                                  step.status === 'completed'
                                    ? 'bg-blue-100'
                                    : step.status === 'current'
                                    ? 'bg-orange-400 ring-4 ring-blue-100'
                                    : 'bg-muted'
                                }`}
                              >
                                <Icon
                                  className={`h-4 w-4 ${
                                    step.status === 'completed'
                                      ? 'text-orange-400'
                                      : step.status === 'current'
                                      ? 'text-white'
                                      : 'text-muted-foreground/50'
                                  }`}
                                />
                              </div>
                              {!isLast && (
                                <div
                                  className={`w-0.5 flex-1 min-h-[40px] ${
                                    step.status === 'completed' ? 'bg-blue-300' : 'bg-muted'
                                  }`}
                                />
                              )}
                            </div>

                            {/* Content */}
                            <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                              <div className="flex items-center gap-2">
                                <h4
                                  className={`font-semibold text-sm ${
                                    step.status === 'completed'
                                      ? 'text-orange-400'
                                      : step.status === 'current'
                                      ? 'text-orange-400'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {step.label}
                                </h4>
                                {step.status === 'current' && (
                                  <Badge className="bg-orange-400 text-white text-[10px] px-1.5 py-0">
                                    CURRENT
                                  </Badge>
                                )}
                                {step.status === 'completed' && (
                                  <CheckCircle2 className="h-4 w-4 text-orange-400" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{step.date}</p>
                              <p className="text-sm text-muted-foreground mt-1">{step.detail}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Details */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-foreground mb-4">Shipping Details</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Shipping Address</p>
                          <p className="text-sm text-foreground mt-1">
                            Priya Sharma<br />
                            42, Green Valley Apartments<br />
                            Andheri West, Mumbai<br />
                            Maharashtra - 400058
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Courier Partner</p>
                          <p className="text-sm text-foreground mt-1">BlueDart Express</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">AWB Number</p>
                          <p className="text-sm text-orange-400 mt-1 font-mono">BD1234567890</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Items in Order</p>
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-foreground">1x Premium Whole Cashews W240 (500g)</p>
                            <p className="text-sm text-foreground">1x Classic Trail Mix (400g)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Help Card */}
                <Card>
                  <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold text-sm text-foreground">Need help with your order?</p>
                        <p className="text-xs text-muted-foreground">Our support team is available Mon-Sat, 10 AM - 8 PM</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-orange-400 hover:bg-blue-50"
                        onClick={() => navigate('contact')}
                      >
                        Contact Us
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-orange-400 hover:bg-blue-50"
                        onClick={() => navigate('faq')}
                      >
                        FAQ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </FadeInWhenVisible>
          )}
        </div>
      </section>
    </div>
  )
}
