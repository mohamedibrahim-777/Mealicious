'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { HelpCircle, MessageCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { faqData } from '@/lib/data'

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

/* ─────────────────────── category icons ─────────────────────── */

const categoryIcons: Record<string, string> = {
  'Orders & Shipping': '🚚',
  'Products & Quality': '✨',
  'Payments & Returns': '💳',
  'Account & Support': '🤝',
}

/* ═══════════════════════ FAQ PAGE ═══════════════════════ */

export default function FAQPage() {
  const navigate = useAppStore((s) => s.navigate)
  const defaultTab = faqData[0]?.category.replace(/\s+/g, '-').toLowerCase() || 'orders-shipping'

  return (
    <div className="flex flex-col">
      {/* ──────── 1. Hero Section ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto">
              Find quick answers to common questions about our products, shipping, returns, and more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ──────── 2. FAQ Content ──────── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <Tabs defaultValue={defaultTab} className="w-full">
              {/* Category Tabs */}
              <div className="flex justify-center mb-8">
                <TabsList className="flex-wrap h-auto gap-1 p-1">
                  {faqData.map((cat) => (
                    <TabsTrigger
                      key={cat.category.replace(/\s+/g, '-').toLowerCase()}
                      value={cat.category.replace(/\s+/g, '-').toLowerCase()}
                      className="text-xs sm:text-sm px-3 py-2"
                    >
                      <span className="mr-1.5">{categoryIcons[cat.category] || '📋'}</span>
                      <span className="hidden sm:inline">{cat.category}</span>
                      <span className="sm:hidden">{cat.category.split('&')[0].trim()}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab Content */}
              {faqData.map((cat) => {
                const tabValue = cat.category.replace(/\s+/g, '-').toLowerCase()
                return (
                  <TabsContent key={tabValue} value={tabValue}>
                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* FAQ Accordion */}
                      <div className="lg:col-span-2">
                        <Card>
                          <CardContent className="p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="rounded-full bg-emerald-100 p-2.5">
                                <HelpCircle className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div>
                                <h2 className="text-lg font-bold text-foreground">
                                  {cat.category}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                  {cat.questions.length} questions
                                </p>
                              </div>
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                              {cat.questions.map((item, idx) => (
                                <AccordionItem key={idx} value={`q-${idx}`}>
                                  <AccordionTrigger className="text-left text-sm sm:text-base font-medium hover:text-emerald-600 transition-colors">
                                    {item.q}
                                  </AccordionTrigger>
                                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                                    {item.a}
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Sidebar */}
                      <div className="space-y-6">
                        {/* Quick Stats */}
                        <Card>
                          <CardContent className="p-5 space-y-4">
                            <h3 className="font-semibold text-foreground">Quick Help</h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 text-sm">
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 shrink-0">
                                  🚚
                                </Badge>
                                <span className="text-muted-foreground">Free shipping above ₹599</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 shrink-0">
                                  🔄
                                </Badge>
                                <span className="text-muted-foreground">7-day easy returns</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 shrink-0">
                                  ✅
                                </Badge>
                                <span className="text-muted-foreground">FSSAI certified products</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 shrink-0">
                                  💳
                                </Badge>
                                <span className="text-muted-foreground">COD available up to ₹5,000</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Other Categories */}
                        <Card>
                          <CardContent className="p-5 space-y-3">
                            <h3 className="font-semibold text-foreground">Other Categories</h3>
                            {faqData
                              .filter((c) => c.category !== cat.category)
                              .map((otherCat) => (
                                <button
                                  key={otherCat.category}
                                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-emerald-600 transition-colors w-full text-left py-1"
                                  onClick={() => {
                                    const tabEl = document.querySelector(
                                      `[data-state="inactive"][value="${otherCat.category.replace(/\s+/g, '-').toLowerCase()}"]`
                                    ) as HTMLElement | null
                                    tabEl?.click()
                                  }}
                                >
                                  <span>{categoryIcons[otherCat.category] || '📋'}</span>
                                  <span>{otherCat.category}</span>
                                  <Badge variant="outline" className="ml-auto text-xs">
                                    {otherCat.questions.length}
                                  </Badge>
                                </button>
                              ))}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ──────── 3. Still Have Questions CTA ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <FadeInWhenVisible>
            <div className="text-center max-w-xl mx-auto space-y-4">
              <div className="rounded-full bg-emerald-500/30 p-3 mx-auto w-fit">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Still Have Questions?
              </h2>
              <p className="text-emerald-100">
                Our friendly support team is here to help. Reach out and we&apos;ll get back to you within 24 hours.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-6">
                <Button
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold"
                  onClick={() => navigate('contact')}
                >
                  Contact Us
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 font-semibold"
                  onClick={() => navigate('track-order')}
                >
                  Track Your Order
                </Button>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>
    </div>
  )
}
