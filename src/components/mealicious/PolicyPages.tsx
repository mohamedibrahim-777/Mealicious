'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  ChevronRight,
  ShieldCheck,
  FileText,
  RotateCcw,
  Home,
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
        className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
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
        <h3 className="font-semibold text-foreground text-sm">Table of Contents</h3>
        <nav className="space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`block text-xs sm:text-sm text-left w-full py-1 px-2 rounded transition-colors ${
                activeId === item.id
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
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
  { id: 'privacy-intro', label: 'Introduction' },
  { id: 'privacy-collection', label: 'Data Collection' },
  { id: 'privacy-usage', label: 'Data Usage' },
  { id: 'privacy-cookies', label: 'Cookies & Tracking' },
  { id: 'privacy-third', label: 'Third-Party Sharing' },
  { id: 'privacy-rights', label: 'Your Rights' },
  { id: 'privacy-security', label: 'Data Security' },
  { id: 'privacy-contact', label: 'Contact Us' },
]

export function PrivacyPolicyPage() {
  const [activeSection] = useState(privacySections[0].id)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto"
          >
            <ShieldCheck className="h-12 w-12 text-emerald-200 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-3 text-emerald-100">Last updated: March 1, 2025</p>
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
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">1. Introduction</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      MEALICIOUS VENTURES PRIVATE LIMITED (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting
                      the privacy and security of your personal information. This Privacy Policy describes how we
                      collect, use, disclose, and protect information when you visit our website mealicious.store
                      (&quot;Site&quot;), use our mobile application, or interact with our services. By accessing or using
                      our services, you agree to the practices described in this Privacy Policy.
                    </p>
                  </div>

                  <Separator />

                  <div id="privacy-collection">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">2. Data Collection</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We collect information that you provide directly to us, including:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li><strong className="text-foreground">Account Information:</strong> Name, email address, phone number, and password when you create an account.</li>
                      <li><strong className="text-foreground">Order Information:</strong> Shipping address, billing address, payment details, and order history when you make a purchase.</li>
                      <li><strong className="text-foreground">Communication Data:</strong> Information you provide when contacting our customer support team, including chat messages, emails, and feedback.</li>
                      <li><strong className="text-foreground">Device & Usage Data:</strong> IP address, browser type, operating system, referring URLs, access times, pages viewed, and links clicked.</li>
                      <li><strong className="text-foreground">Location Data:</strong> Approximate location based on your IP address for delivery estimation and localized content.</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="privacy-usage">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">3. Data Usage</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We use the information we collect for the following purposes:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>To process and fulfill your orders, including shipping and delivery</li>
                      <li>To communicate with you about your orders, account, and customer support inquiries</li>
                      <li>To personalize your shopping experience and recommend products</li>
                      <li>To send promotional communications, newsletters, and marketing offers (with your consent)</li>
                      <li>To improve our website, products, and services through analytics and research</li>
                      <li>To detect, prevent, and address fraud, security breaches, and other illegal activities</li>
                      <li>To comply with legal obligations and enforce our terms and conditions</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="privacy-cookies">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">4. Cookies &amp; Tracking</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We use cookies, web beacons, and similar tracking technologies to enhance your browsing
                      experience and collect information about how you use our Site. Types of cookies we use include:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li><strong className="text-foreground">Essential Cookies:</strong> Required for the Site to function properly (e.g., shopping cart, login session)</li>
                      <li><strong className="text-foreground">Analytics Cookies:</strong> Help us understand how visitors interact with our Site (e.g., Google Analytics)</li>
                      <li><strong className="text-foreground">Advertising Cookies:</strong> Used to deliver relevant advertisements and track campaign performance</li>
                      <li><strong className="text-foreground">Preference Cookies:</strong> Remember your settings and preferences for a personalized experience</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                      You can control cookie preferences through your browser settings. Disabling certain cookies
                      may affect the functionality of our Site.
                    </p>
                  </div>

                  <Separator />

                  <div id="privacy-third">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">5. Third-Party Sharing</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We do not sell your personal information. We may share your information with:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li><strong className="text-foreground">Service Providers:</strong> Logistics partners for delivery, payment processors (Razorpay), and analytics providers</li>
                      <li><strong className="text-foreground">Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                      <li><strong className="text-foreground">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                      <li><strong className="text-foreground">With Your Consent:</strong> When you have given us explicit permission to share your information</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="privacy-rights">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">6. Your Rights</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Under applicable data protection laws, you have the following rights:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li><strong className="text-foreground">Access:</strong> Request a copy of the personal data we hold about you</li>
                      <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate or incomplete personal data</li>
                      <li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal data, subject to legal obligations</li>
                      <li><strong className="text-foreground">Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                      <li><strong className="text-foreground">Data Portability:</strong> Request your data in a structured, machine-readable format</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                      To exercise any of these rights, please contact us at privacy@mealicious.store.
                    </p>
                  </div>

                  <Separator />

                  <div id="privacy-security">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">7. Data Security</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We implement appropriate technical and organizational security measures to protect your
                      personal information against unauthorized access, alteration, disclosure, or destruction.
                      These measures include encryption (SSL/TLS), secure server infrastructure, access controls,
                      and regular security audits. However, no method of transmission over the Internet is 100%
                      secure, and we cannot guarantee absolute security.
                    </p>
                  </div>

                  <Separator />

                  <div id="privacy-contact">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">8. Contact Us</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      If you have any questions or concerns about this Privacy Policy, please contact us:
                    </p>
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <p><strong className="text-foreground">MEALICIOUS VENTURES PRIVATE LIMITED</strong></p>
                      <p>Email: privacy@mealicious.store</p>
                      <p>Phone: +91-9876543210</p>
                      <p>Address: 123 Health Street, Mumbai, Maharashtra 400001, India</p>
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
  { id: 'terms-intro', label: 'Introduction' },
  { id: 'terms-usage', label: 'Site Usage' },
  { id: 'terms-orders', label: 'Orders & Pricing' },
  { id: 'terms-ip', label: 'Intellectual Property' },
  { id: 'terms-liability', label: 'Limitation of Liability' },
  { id: 'terms-indemnity', label: 'Indemnification' },
  { id: 'terms-governing', label: 'Governing Law' },
  { id: 'terms-changes', label: 'Changes to Terms' },
]

export function TermsPage() {
  const [activeSection] = useState(termsSections[0].id)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto"
          >
            <FileText className="h-12 w-12 text-emerald-200 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Terms &amp; Conditions
            </h1>
            <p className="mt-3 text-emerald-100">Last updated: March 1, 2025</p>
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
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">1. Introduction</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      These Terms and Conditions (&quot;Terms&quot;) govern your use of the mealicious.store website
                      and the services provided by MEALICIOUS VENTURES PRIVATE LIMITED (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot;
                      or &quot;us&quot;). By accessing or using our website, you agree to be bound by these Terms.
                      If you do not agree with any part of these Terms, you should not use our website or services.
                    </p>
                  </div>

                  <Separator />

                  <div id="terms-usage">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">2. Site Usage</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      By using our website, you agree to:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Use the website only for lawful purposes and in accordance with these Terms</li>
                      <li>Provide accurate, current, and complete information when creating an account or placing an order</li>
                      <li>Maintain the confidentiality of your account credentials</li>
                      <li>Not engage in any activity that could damage, disable, or impair the website&apos;s operation</li>
                      <li>Not use automated systems (bots, scrapers) to access the website without prior written consent</li>
                      <li>Not attempt to gain unauthorized access to any portion of the website or its related systems</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="terms-orders">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">3. Orders &amp; Pricing</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      By placing an order on our website, you agree to the following:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li><strong className="text-foreground">Order Acceptance:</strong> All orders are subject to acceptance and availability. We reserve the right to cancel any order due to stock unavailability, pricing errors, or suspected fraud.</li>
                      <li><strong className="text-foreground">Pricing:</strong> All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise. Prices may change without prior notice.</li>
                      <li><strong className="text-foreground">Payment:</strong> Payment must be made at the time of order placement through our accepted payment methods (UPI, Credit/Debit Cards, Net Banking, COD).</li>
                      <li><strong className="text-foreground">Shipping:</strong> Free shipping is available on orders above ₹599. A flat shipping fee of ₹49 applies for orders below ₹599. Delivery timelines are estimates and may vary.</li>
                      <li><strong className="text-foreground">COD Orders:</strong> Cash on Delivery is available for orders up to ₹5,000 with a nominal COD fee of ₹50.</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="terms-ip">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">4. Intellectual Property</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      All content on this website, including text, graphics, logos, images, product descriptions,
                      and software, is the property of MEALICIOUS VENTURES PRIVATE LIMITED and is protected by
                      Indian and international copyright, trademark, and intellectual property laws. You may not
                      reproduce, distribute, modify, create derivative works from, or commercially exploit any
                      content from our website without our express written permission.
                    </p>
                  </div>

                  <Separator />

                  <div id="terms-liability">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">5. Limitation of Liability</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      To the fullest extent permitted by law:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Our website and services are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind</li>
                      <li>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages</li>
                      <li>Our total liability for any claim arising from your use of our website or services shall not exceed the amount you paid for the specific product or service giving rise to the claim</li>
                      <li>We are not responsible for any delays or failures in performance resulting from causes beyond our reasonable control</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="terms-indemnity">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">6. Indemnification</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      You agree to indemnify, defend, and hold harmless MEALICIOUS VENTURES PRIVATE LIMITED,
                      its officers, directors, employees, agents, and affiliates from any claims, damages,
                      losses, liabilities, and expenses (including legal fees) arising from your use of the
                      website, violation of these Terms, or infringement of any third-party rights.
                    </p>
                  </div>

                  <Separator />

                  <div id="terms-governing">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">7. Governing Law</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      These Terms shall be governed by and construed in accordance with the laws of India.
                      Any disputes arising out of or in connection with these Terms shall be subject to the
                      exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.
                    </p>
                  </div>

                  <Separator />

                  <div id="terms-changes">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">8. Changes to Terms</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We reserve the right to modify or update these Terms at any time without prior notice.
                      Changes will be effective immediately upon posting on the website. Your continued use
                      of the website after any changes constitutes your acceptance of the new Terms.
                      We encourage you to review these Terms periodically.
                    </p>
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
  { id: 'refund-overview', label: 'Return Policy Overview' },
  { id: 'refund-eligibility', label: 'Eligibility' },
  { id: 'refund-process', label: 'Refund Process' },
  { id: 'refund-exchange', label: 'Exchange Policy' },
  { id: 'refund-non-returnable', label: 'Non-Returnable Items' },
  { id: 'refund-contact', label: 'Contact for Returns' },
]

export function RefundPolicyPage() {
  const [activeSection] = useState(refundSections[0].id)
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto"
          >
            <RotateCcw className="h-12 w-12 text-emerald-200 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
              Refund &amp; Return Policy
            </h1>
            <p className="mt-3 text-emerald-100">Last updated: March 1, 2025</p>
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
                  <div id="refund-overview">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">1. Return Policy Overview</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      At MEALICIOUS VENTURES PRIVATE LIMITED, we take pride in the quality of our products.
                      If you are not completely satisfied with your purchase, we offer a <strong className="text-foreground">7-day return policy</strong> from
                      the date of delivery. This policy applies to all products purchased through our website
                      mealicious.store.
                    </p>
                    <Card className="mt-4 bg-emerald-50 border-emerald-200">
                      <CardContent className="p-4 flex items-start gap-3">
                        <RotateCcw className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-emerald-800 text-sm">7-Day Easy Returns</p>
                          <p className="text-xs text-emerald-600 mt-0.5">
                            Return any product within 7 days of delivery if you&apos;re not satisfied.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div id="refund-eligibility">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">2. Eligibility</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      To be eligible for a return, the following conditions must be met:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>The return request must be initiated within 7 days of delivery</li>
                      <li>The product must be in its original packaging, unused, and in the same condition as received</li>
                      <li>The product seal must not be broken (for sealed food products)</li>
                      <li>A valid proof of purchase (order number or invoice) must be provided</li>
                      <li>Products received in a damaged or defective condition are eligible for return regardless of the above conditions</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="refund-process">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">3. Refund Process</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Once your return request is approved, the refund will be processed as follows:
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-100 p-1.5 mt-0.5">
                          <span className="text-xs font-bold text-emerald-700">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">Initiate Return</p>
                          <p className="text-xs text-muted-foreground">Contact our support team via email, phone, or WhatsApp to initiate a return request.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-100 p-1.5 mt-0.5">
                          <span className="text-xs font-bold text-emerald-700">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">Review &amp; Approval</p>
                          <p className="text-xs text-muted-foreground">Our team will review your request within 24-48 hours and confirm eligibility.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-100 p-1.5 mt-0.5">
                          <span className="text-xs font-bold text-emerald-700">3</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">Pickup / Self-Ship</p>
                          <p className="text-xs text-muted-foreground">We will arrange a pickup or provide shipping instructions for returning the product.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-emerald-100 p-1.5 mt-0.5">
                          <span className="text-xs font-bold text-emerald-700">4</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">Refund Issued</p>
                          <p className="text-xs text-muted-foreground">Refunds are processed within 5-7 business days after receiving and inspecting the returned product.</p>
                        </div>
                      </div>
                    </div>

                    <Card className="mt-6">
                      <CardContent className="p-4 space-y-2">
                        <h4 className="font-semibold text-sm text-foreground">Refund Methods:</h4>
                        <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                          <li><strong className="text-foreground">Prepaid Orders:</strong> Refund credited to the original payment method (5-7 business days)</li>
                          <li><strong className="text-foreground">COD Orders:</strong> Refund transferred to your bank account via NEFT/IMPS (5-7 business days)</li>
                          <li><strong className="text-foreground">Wallet:</strong> Refund can be credited to your Mealicious wallet for instant reuse</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  <div id="refund-exchange">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">4. Exchange Policy</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We currently offer exchanges under the following conditions:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Exchanges are available for products of equal or greater value</li>
                      <li>If the exchanged product costs more, the price difference must be paid</li>
                      <li>If the exchanged product costs less, the difference will be refunded</li>
                      <li>Exchange requests must be made within 7 days of delivery</li>
                      <li>Exchanges are subject to product availability</li>
                      <li>Damaged or wrong product deliveries are eligible for free exchange with free shipping</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="refund-non-returnable">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">5. Non-Returnable Items</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      The following items are not eligible for return or exchange:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                      <li>Products with broken seals or opened packaging (unless damaged upon delivery)</li>
                      <li>Products returned after the 7-day return window</li>
                      <li>Products not in their original condition or packaging</li>
                      <li>Gift cards and promotional items</li>
                      <li>Products purchased during clearance or final sale events (unless defective)</li>
                    </ul>
                  </div>

                  <Separator />

                  <div id="refund-contact">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">6. Contact for Returns</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      To initiate a return, exchange, or for any refund-related queries, please contact us:
                    </p>
                    <Card>
                      <CardContent className="p-5 space-y-3">
                        <div className="space-y-2 text-sm">
                          <p><strong className="text-foreground">MEALICIOUS VENTURES PRIVATE LIMITED</strong></p>
                          <p className="text-muted-foreground">Email: <span className="text-emerald-600">support@mealicious.store</span></p>
                          <p className="text-muted-foreground">Phone: <span className="text-emerald-600">+91-9876543210</span></p>
                          <p className="text-muted-foreground">WhatsApp: <span className="text-emerald-600">+91-9876543210</span></p>
                          <p className="text-muted-foreground">Hours: Monday - Saturday, 10 AM - 8 PM IST</p>
                          <p className="text-muted-foreground">Address: 123 Health Street, Mumbai, Maharashtra 400001, India</p>
                        </div>
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white mt-2"
                          onClick={() => navigate('contact')}
                        >
                          Contact Support
                        </Button>
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
