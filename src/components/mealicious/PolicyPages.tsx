'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  ChevronRight,
  ShieldCheck,
  FileText,
  RotateCcw,
  Home,
  AlertCircle,
  Mail,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

/* ─────────────────────── shared Breadcrumb ─────────────────────── */

function PolicyBreadcrumb({ current }: { current: string }) {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
      <button
        onClick={() => navigate('home')}
        className="flex items-center gap-1 hover:text-orange-400 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        Home
      </button>
      <ChevronRight className="h-3 w-3" />
      <span className="text-foreground font-medium">{current}</span>
    </nav>
  )
}

/* ─────────────────────── shared Table of Contents ─────────────────────── */

function TableOfContents({
  items,
  activeId,
}: {
  items: { id: string; label: string }[]
  activeId: string
}) {
  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Card className="sticky top-24">
      <CardContent className="p-5 space-y-3">
        <h3 className="font-semibold text-foreground text-sm font-serif">Table of Contents</h3>
        <nav className="space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`block text-xs sm:text-sm text-left w-full py-1.5 px-2 rounded transition-colors ${
                activeId === item.id
                  ? 'bg-amber-50 text-orange-500 font-medium dark:bg-amber-950/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════════ */
/* PRIVACY POLICY PAGE                                               */
/* ══════════════════════════════════════════════════════════════════ */

const privacySections = [
  { id: 'privacy-intro', label: '1. Introduction' },
  { id: 'privacy-collection', label: '1.1 Information We Collect' },
  { id: 'privacy-usage', label: '1.2 How We Use Information' },
  { id: 'privacy-sharing', label: '1.3 Sharing of Information' },
  { id: 'privacy-cookies', label: '1.4 Cookies Policy' },
  { id: 'privacy-retention', label: '1.5 Data Retention' },
  { id: 'privacy-rights', label: '1.6 Your Rights' },
  { id: 'privacy-security', label: '1.7 Data Security' },
  { id: 'privacy-third', label: '1.8 Third-Party Links' },
  { id: 'privacy-changes', label: '1.9 Changes to This Policy' },
  { id: 'privacy-contact', label: '1.10 Contact Us' },
]

export function PrivacyPolicyPage() {
  const [activeSection] = useState(privacySections[0].id)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto"
          >
            <ShieldCheck className="h-12 w-12 text-amber-100 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight font-serif">
              Privacy Policy
            </h1>
            <p className="mt-3 text-amber-50">Last updated: June 2025</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PolicyBreadcrumb current="Privacy Policy" />

          <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Sidebar TOC */}
            <div className="hidden lg:block">
              <TableOfContents items={privacySections} activeId={activeSection} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <FadeInWhenVisible>
                <div className="prose prose-sm sm:prose max-w-none space-y-8">
                  <div id="privacy-intro">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">1. Introduction</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Mealicious Ventures Private Limited (&quot;Mealicious&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <a href="https://www.mealicious.in" className="text-orange-500 font-medium hover:underline">www.mealicious.in</a> or purchase our products.
                    </p>
                  </div>

                  <Separator />

                  <div id="privacy-collection">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">1.1 Information We Collect</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">Personal Information</h4>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Full name and contact details (phone number, email address)</li>
                          <li>Delivery address and billing address</li>
                          <li>Payment information (processed securely via third-party payment gateways)</li>
                          <li>Order history and purchase preferences</li>
                          <li>Account login credentials (if you create an account)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">Automatically Collected Information</h4>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>IP address, browser type, and device information</li>
                          <li>Pages visited, time spent, and navigation patterns on our website</li>
                          <li>Cookies and similar tracking technologies</li>
                          <li>Referring website or source of visit</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div id="privacy-usage">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">1.2 How We Use Your Information</h2>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>To process and fulfil your orders</li>
                      <li>To send order confirmations, invoices, and shipping updates</li>
                      <li>To respond to customer support queries and complaints</li>
                      <li>To improve our website, products, and services</li>
                      <li>To send promotional offers, newsletters, and updates (with your consent)</li>
                      <li>To comply with applicable legal and regulatory obligations</li>
                      <li>To prevent fraud, unauthorised transactions, and other illegal activities</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="privacy-sharing">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">1.3 Sharing of Information</h2>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      We do not sell, trade, or rent your personal information to third parties. We may share your data with:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Logistics and delivery partners (for order fulfilment)</li>
                      <li>Payment gateway providers (for secure transaction processing)</li>
                      <li>Technology and cloud service providers (for website and data hosting)</li>
                      <li>Government authorities (when required by law or court order)</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="privacy-cookies">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">1.4 Cookies Policy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We use cookies to enhance your browsing experience. Cookies are small data files stored on your device. You may disable cookies through your browser settings; however, doing so may affect certain website functionalities.
                    </p>
                  </div>

                  <Separator />

                  <div id="privacy-retention">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">1.5 Data Retention</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We retain your personal data for as long as necessary to fulfil the purposes outlined in this policy or as required by applicable laws. Order-related data is retained for a minimum of 7 years for GST and accounting compliance.
                    </p>
                  </div>

                  <Separator />

                  <div id="privacy-rights">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">1.6 Your Rights</h2>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Right to access the personal data we hold about you</li>
                      <li>Right to correct inaccurate or incomplete information</li>
                      <li>Right to request deletion of your personal data (subject to legal obligations)</li>
                      <li>Right to withdraw consent for marketing communications at any time</li>
                      <li>Right to lodge a complaint with the relevant data protection authority</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="privacy-security">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">1.7 Data Security</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We implement industry-standard security measures including SSL encryption, secure servers, and access controls to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                    </p>
                  </div>

                  <Separator />

                  <div id="privacy-third">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">1.8 Third-Party Links</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Our website may contain links to third-party websites. We are not responsible for the privacy practices of such sites and encourage you to review their respective privacy policies.
                    </p>
                  </div>

                  <Separator />

                  <div id="privacy-changes">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">1.9 Changes to This Policy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We reserve the right to update this Privacy Policy at any time. Changes will be posted on our website with a revised effective date. Continued use of our services after changes constitutes acceptance of the updated policy.
                    </p>
                  </div>

                  <Separator />

                  <div id="privacy-contact">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">1.10 Contact Us</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      For privacy-related queries or requests:
                    </p>
                    <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      <p><strong className="text-foreground">Mealicious Ventures Private Limited</strong></p>
                      <p>Email: <span className="text-orange-500 font-medium">support@mealicious.in</span></p>
                      <p>Address: 1/108, Elappankadu, Malankadu, Uthamasolapuram, Salem - 636010, Tamil Nadu, India</p>
                    </div>
                  </div>
                </div>
              </FadeInWhenVisible>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════ */
/* TERMS & CONDITIONS PAGE                                           */
/* ══════════════════════════════════════════════════════════════════ */

const termsSections = [
  { id: 'terms-intro', label: '2. Acceptance of Terms' },
  { id: 'terms-pricing', label: '2.2 Products and Pricing' },
  { id: 'terms-orders', label: '2.3 Orders and Payment' },
  { id: 'terms-ip', label: '2.4 Intellectual Property' },
  { id: 'terms-conduct', label: '2.5 User Conduct' },
  { id: 'terms-liability', label: '2.6 Limitation of Liability' },
  { id: 'terms-governing', label: '2.7 Governing Law & Jurisdiction' },
  { id: 'terms-amendments', label: '2.8 Amendments' },
  { id: 'terms-contact', label: '2.9 Contact for Legal Queries' },
]

export function TermsPage() {
  const [activeSection] = useState(termsSections[0].id)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto"
          >
            <FileText className="h-12 w-12 text-amber-100 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight font-serif">
              Terms &amp; Conditions
            </h1>
            <p className="mt-3 text-amber-50">Last updated: June 2025</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PolicyBreadcrumb current="Terms & Conditions" />

          <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Sidebar TOC */}
            <div className="hidden lg:block">
              <TableOfContents items={termsSections} activeId={activeSection} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <FadeInWhenVisible>
                <div className="prose prose-sm sm:prose max-w-none space-y-8">
                  <div id="terms-intro">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">2. Acceptance of Terms</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Welcome to Mealicious. By accessing our website (<a href="https://www.mealicious.in" className="text-orange-500 font-medium hover:underline">www.mealicious.in</a>) or placing an order, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mt-3">
                      By using our website or purchasing our products, you confirm that you are at least 18 years of age (or have parental consent) and legally capable of entering into a binding contract. If you do not agree to these terms, please do not use our services.
                    </p>
                  </div>

                  <Separator />

                  <div id="terms-pricing">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">2.2 Products and Pricing</h2>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>All products listed on our website are subject to availability.</li>
                      <li>Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes (GST) unless stated otherwise.</li>
                      <li>We reserve the right to change product prices, descriptions, or availability at any time without prior notice.</li>
                      <li>Product images are for illustrative purposes only. Actual product packaging may vary slightly.</li>
                      <li>Promotional prices are valid only for the specified period and cannot be combined with other offers unless explicitly stated.</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="terms-orders">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">2.3 Orders and Payment</h2>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Orders are confirmed only upon successful payment processing.</li>
                      <li>We accept payments via UPI, credit/debit cards, net banking, and other payment methods available at checkout.</li>
                      <li>In the event of payment failure, please retry or contact your bank before placing a new order.</li>
                      <li>We reserve the right to cancel any order in case of pricing errors, stock unavailability, or suspected fraudulent activity.</li>
                      <li>An order confirmation email and/or SMS will be sent upon successful placement of order.</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="terms-ip">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">2.4 Intellectual Property</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      All content on our website—including logos, brand name, product images, text, graphics, and design—is the exclusive property of Mealicious Ventures Private Limited and is protected under applicable intellectual property laws. Unauthorised reproduction, distribution, or commercial use of any content is strictly prohibited.
                    </p>
                  </div>

                  <Separator />

                  <div id="terms-conduct">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">2.5 User Conduct</h2>
                    <p className="text-muted-foreground leading-relaxed mb-3">You agree not to:</p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Use our website for any unlawful or fraudulent purpose</li>
                      <li>Attempt to gain unauthorised access to any part of our website or systems</li>
                      <li>Post or transmit any offensive, defamatory, or harmful content</li>
                      <li>Use automated tools or bots to access or scrape our website</li>
                      <li>Impersonate any person or entity or misrepresent your affiliation</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="terms-liability">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">2.6 Limitation of Liability</h2>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      To the maximum extent permitted by applicable law, Mealicious shall not be liable for:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Any indirect, incidental, special, or consequential damages arising from use of our products or services</li>
                      <li>Loss of data, revenue, or profits</li>
                      <li>Delays or failures caused by events beyond our reasonable control (force majeure)</li>
                    </ul>
                    <p className="text-muted-foreground mt-3">
                      Our total liability in any case shall not exceed the amount paid by you for the specific product or order in question.
                    </p>
                  </div>

                  <Separator />

                  <div id="terms-governing">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">2.7 Governing Law and Jurisdiction</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      These Terms and Conditions are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts at Salem, Tamil Nadu, India.
                    </p>
                  </div>

                  <Separator />

                  <div id="terms-amendments">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">2.8 Amendments</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We reserve the right to modify these Terms and Conditions at any time. Updates will be published on our website. Continued use of our services after any modification constitutes your acceptance of the revised terms.
                    </p>
                  </div>

                  <Separator />

                  <div id="terms-contact">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">2.9 Contact for Legal Queries</h2>
                    <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      <p><strong className="text-foreground">Mealicious Ventures Private Limited</strong></p>
                      <p>Email: <span className="text-orange-500 font-medium">support@mealicious.in</span></p>
                      <p>CIN: U10799TZ2025PTC037179</p>
                      <p>Address: 1/108, Elappankadu, Malankadu, Uthamasolapuram, Salem - 636010, Tamil Nadu, India</p>
                    </div>
                  </div>
                </div>
              </FadeInWhenVisible>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════ */
/* REFUND POLICY PAGE                                                */
/* ══════════════════════════════════════════════════════════════════ */

const refundSections = [
  { id: 'refund-no-return', label: '4.1 No Return Policy' },
  { id: 'refund-eligible', label: '4.2 Eligible Cases' },
  { id: 'refund-process', label: '4.3 Refund Process' },
  { id: 'refund-non-eligible', label: '4.4 Non-Eligible Cases' },
  { id: 'refund-cancellation', label: '4.5 Cancellation Policy' },
]

export function RefundPolicyPage() {
  const [activeSection] = useState(refundSections[0].id)
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto"
          >
            <RotateCcw className="h-12 w-12 text-amber-100 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight font-serif">
              Refund &amp; Return Policy
            </h1>
            <p className="mt-3 text-amber-50">Last updated: June 2025</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PolicyBreadcrumb current="Refund Policy" />

          <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Sidebar TOC */}
            <div className="hidden lg:block">
              <TableOfContents items={refundSections} activeId={activeSection} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <FadeInWhenVisible>
                <div className="prose prose-sm sm:prose max-w-none space-y-8">
                  <div id="refund-no-return">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">4.1 No Return Policy for Food Products</h2>
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-lg p-4 mb-4 text-amber-800 dark:text-amber-300 text-sm font-semibold flex gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>IMPORTANT NOTICE: As per FSSAI regulations and standard food industry practices, we DO NOT accept returns on any food products once delivered. This policy is in place to maintain the highest standards of food safety and hygiene for all our customers.</p>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      In the interest of food safety and hygiene, Mealicious strictly does not accept returns of any food products under any circumstances once they have been delivered. This applies to all products in our range including:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                      <li>Premium Flavoured Makhana (Cheese, Magic Masala, Peri Peri)</li>
                      <li>Healthy Chips (Ragi Chips, Mixed Vegetable Chips, Beetroot Chips)</li>
                      <li>Premium Dry Fruits (Almonds, Cashews, Mixed Dry Fruits, Flavoured Cashews)</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-3">
                      This no-return policy is in strict compliance with FSSAI food safety standards and the Food Safety and Standards Act, 2006.
                    </p>
                  </div>

                  <Separator />

                  <div id="refund-eligible">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">4.2 Eligible Cases for Refund</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      While returns are not accepted, refunds or replacements may be considered in the following limited circumstances:
                    </p>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">4.2.1 Wrong Product Delivered</h4>
                        <p className="text-xs text-muted-foreground">If you receive a product that is different from what you ordered, please contact us within 24 hours of delivery with your order number and a photograph of the product received. We will arrange for a replacement or refund after verification.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">4.2.2 Damaged Product</h4>
                        <p className="text-xs text-muted-foreground">If the product is damaged in transit (manufacturing seal broken, package crushed or torn), please notify us within 24 hours of delivery with photographic evidence. We will process a replacement or refund after review.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">4.2.3 Missing Items</h4>
                        <p className="text-xs text-muted-foreground">If your order is incomplete or items are missing, please report within 24 hours of receiving the package with your order details. We will verify and dispatch the missing items or issue a refund for the missing products.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">4.2.4 Order Not Delivered</h4>
                        <p className="text-xs text-muted-foreground">If your order has not been delivered within the expected delivery window and the tracking status is not updated, please contact us. We will investigate with the logistics partner and resolve within 5–7 business days.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">4.2.5 Payment Debited but Order Not Confirmed</h4>
                        <p className="text-xs text-muted-foreground">If payment has been deducted but you did not receive an order confirmation, please contact us with payment proof. We will verify and either confirm the order or initiate a full refund within 5–7 business days.</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div id="refund-process">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">4.3 Refund Process</h2>
                    <div className="space-y-3 text-muted-foreground text-sm">
                      <p>1. Contact our support team at <span className="text-orange-500 font-medium">support@mealicious.in</span> within 24 hours of delivery (for delivery-related issues) or within 7 business days for payment issues.</p>
                      <p>2. Provide your order number, registered mobile number, and relevant photographs or documentation.</p>
                      <p>3. Our team will review your case within 2–3 business days.</p>
                      <p>4. If approved, refunds will be credited to the original payment method within 5–7 business days after approval.</p>
                      <p>5. You will be notified via email/SMS at every stage of the refund process.</p>
                    </div>
                  </div>

                  <Separator />

                  <div id="refund-non-eligible">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">4.4 Non-Eligible Cases</h2>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Change of mind or personal preference after delivery</li>
                      <li>Products that have been partially consumed or tampered with</li>
                      <li>Claims made after 24 hours from the time of delivery (for product condition complaints)</li>
                      <li>Discounts, promotional items, or combo packs where terms explicitly state non-refundable</li>
                      <li>Delays in delivery caused by logistics partners, natural calamities, or events beyond our control</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="refund-cancellation">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 font-serif">4.5 Cancellation Policy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Orders can be cancelled only before they are dispatched from our warehouse. Once dispatched, orders cannot be cancelled. To cancel an order, please contact us immediately at <span className="text-orange-500 font-medium">support@mealicious.in</span> with your order number. Approved cancellations will receive a full refund within 5–7 business days.
                    </p>
                    <Card className="mt-6 border-amber-200/50 bg-stone-50/50 dark:bg-stone-900/10">
                      <CardContent className="p-6 space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-amber-500" />
                          <p className="font-semibold text-stone-900 dark:text-stone-100">Mealicious Ventures Private Limited</p>
                        </div>
                        <Separator />
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <p>Email: <span className="text-orange-500">support@mealicious.in</span></p>
                          <p>FSSAI: 22426193000120</p>
                          <p>GSTIN: 33AAUCM2609Q1ZT</p>
                          <p>CIN: U10799TZ2025PTC037179</p>
                          <p>Address: 1/108, Elappankadu, Malankadu, Uthamasolapuram, Salem - 636010, Tamil Nadu, India</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </FadeInWhenVisible>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
