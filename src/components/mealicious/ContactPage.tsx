'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { toast } from 'sonner'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 175.216 175.552"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wa-bg-contact" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#57d163" />
          <stop offset="1" stopColor="#23b33a" />
        </linearGradient>
      </defs>
      <path
        fill="#fff"
        d="M147.516 27.516C131.275 11.252 109.679 2.296 86.704 2.286 39.357 2.286.823 40.81.803 88.169c-.006 15.143 3.95 29.926 11.467 42.957L.078 175.216l45.122-11.83c12.554 6.846 26.683 10.456 41.06 10.461h.035c47.343 0 85.88-38.532 85.901-85.892.01-22.945-8.913-44.535-25.137-60.793z"
      />
      <path
        fill="url(#wa-bg-contact)"
        d="M86.74 16.703c-39.395 0-71.451 32.054-71.467 71.45-.006 13.494 3.769 26.628 10.916 38.005l1.697 2.7-7.215 26.34 27.022-7.087 2.609 1.547c10.973 6.515 23.555 9.95 36.387 9.957h.029c39.366 0 71.421-32.057 71.437-71.453.008-19.097-7.426-37.054-20.929-50.566-13.503-13.512-31.452-20.953-50.486-20.963z"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M65.49 49.891c-1.61-3.579-3.302-3.651-4.832-3.713l-4.117-.05c-1.43 0-3.755.537-5.722 2.683-1.968 2.146-7.514 7.34-7.514 17.903s7.693 20.77 8.766 22.202c1.073 1.43 14.85 23.794 36.671 32.39 18.137 7.146 21.825 5.725 25.76 5.368 3.935-.358 12.7-5.193 14.49-10.205 1.79-5.012 1.79-9.308 1.253-10.207-.537-.895-1.968-1.43-4.116-2.504-2.146-1.073-12.7-6.265-14.668-6.98-1.968-.715-3.398-1.073-4.832 1.075-1.43 2.144-5.541 6.978-6.794 8.41-1.253 1.434-2.504 1.612-4.65.538-2.149-1.075-9.066-3.344-17.27-10.661-6.385-5.692-10.694-12.726-11.946-14.873-1.253-2.146-.134-3.308.945-4.378.962-.961 2.146-2.504 3.22-3.757 1.073-1.253 1.43-2.146 2.146-3.578.715-1.432.358-2.685-.18-3.758-.535-1.075-4.696-11.65-6.594-15.91z"
      />
    </svg>
  )
}

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

/* ─────────────────────── data ─────────────────────── */

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    detail: 'support@mealicious.store',
    subDetail: 'We reply within 24 hours',
    color: 'text-orange-400',
    bg: 'bg-blue-50',
  },
  {
    icon: Phone,
    title: 'Call Us',
    detail: '+91-7397075166',
    subDetail: 'Mon-Sat, 10 AM - 8 PM IST',
    color: 'text-orange-400',
    bg: 'bg-blue-50',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    detail: 'MEALICIOUS VENTURES PRIVATE LIMITED',
    subDetail: '123 Health Street, Mumbai, Maharashtra 400001, India',
    color: 'text-orange-400',
    bg: 'bg-blue-50',
  },
  {
    icon: Clock,
    title: 'Business Hours',
    detail: 'Monday - Saturday',
    subDetail: '10:00 AM - 8:00 PM IST',
    color: 'text-orange-400',
    bg: 'bg-blue-50',
  },
]

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/' },
  { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/' },
  { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/' },
  { icon: WhatsAppIcon, label: 'WhatsApp', href: 'https://wa.me/917397075166', brand: true },
]

/* ═══════════════════════ CONTACT PAGE ═══════════════════════ */

export default function ContactPage() {
  const navigate = useAppStore((s) => s.navigate)
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to send message')
        return
      }
      setSubmitted(true)
      toast.success(data.message ?? 'Message sent!')
      setTimeout(() => {
        setSubmitted(false)
        setFormState({ name: '', email: '', phone: '', subject: '', message: '' })
      }, 3000)
    } catch {
      toast.error('Network error. Try again.')
    } finally {
      setSubmitting(false)
    }
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
              Get in Touch
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
              Have a question, feedback, or need help with an order? We&apos;d love to hear from you.
              Our team is always ready to assist.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ──────── 2. Contact Form + Info ──────── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact Form */}
            <FadeInWhenVisible className="lg:col-span-3">
              <Card className="h-full">
                <CardContent className="p-6 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                    Send Us a Message
                  </h2>

                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-12 space-y-4"
                    >
                      <div className="rounded-full bg-blue-100 p-4">
                        <Send className="h-8 w-8 text-orange-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-orange-400">Message Sent!</h3>
                      <p className="text-muted-foreground text-center">
                        Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            placeholder="Enter your name"
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={formState.email}
                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Phone Number
                          </label>
                          <Input
                            type="tel"
                            placeholder="+91-XXXXXXXXXX"
                            value={formState.phone}
                            onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">
                            Subject <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={formState.subject}
                            onValueChange={(val) => setFormState({ ...formState, subject: val })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="order">Order Inquiry</SelectItem>
                              <SelectItem value="product">Product Question</SelectItem>
                              <SelectItem value="return">Returns &amp; Refunds</SelectItem>
                              <SelectItem value="feedback">Feedback</SelectItem>
                              <SelectItem value="partnership">Business Partnership</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          placeholder="How can we help you?"
                          rows={5}
                          value={formState.message}
                          onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        disabled={submitting}
                        className="bg-orange-400 hover:bg-orange-400 text-white font-semibold"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {submitting ? 'Sending…' : 'Send Message'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </FadeInWhenVisible>

            {/* Contact Info */}
            <FadeInWhenVisible delay={0.2} className="lg:col-span-2">
              <div className="space-y-4">
                {contactInfo.map((info) => {
                  const Icon = info.icon
                  return (
                    <Card key={info.title} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-5 flex items-start gap-4">
                        <div className={`rounded-full ${info.bg} p-3 shrink-0`}>
                          <Icon className={`h-5 w-5 ${info.color}`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm">{info.title}</h3>
                          <p className="text-sm text-foreground mt-0.5">{info.detail}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{info.subDetail}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* ──────── 3. Map Placeholder ──────── */}
      <section className="py-14 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Our Location</h2>
              <p className="mt-2 text-muted-foreground">
                Find us at our headquarters in Mumbai
              </p>
            </div>
          </FadeInWhenVisible>

          <FadeInWhenVisible delay={0.1}>
            <Card className="overflow-hidden">
              <div className="relative bg-gradient-to-br from-blue-100 via-blue-50 to-muted flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                <div className="text-center space-y-4 p-8">
                  <div className="rounded-full bg-blue-200/60 p-4 mx-auto w-fit">
                    <MapPin className="h-10 w-10 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-orange-400">MEALICIOUS VENTURES PRIVATE LIMITED</h3>
                  <p className="text-orange-400 text-sm max-w-sm mx-auto">
                    123 Health Street, Mumbai, Maharashtra 400001, India
                  </p>
                  <Separator className="max-w-xs mx-auto bg-blue-200" />
                  <p className="text-xs text-muted-foreground">
                    Interactive map coming soon
                  </p>
                </div>
              </div>
            </Card>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ──────── 4. Social Media Links ──────── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Follow Us</h2>
              <p className="mt-2 text-muted-foreground">
                Stay connected on social media for the latest updates, recipes, and offers
              </p>
            </div>
          </FadeInWhenVisible>

          <FadeInWhenVisible delay={0.1}>
            <div className="flex flex-wrap justify-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <Card className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-1">
                      <CardContent className="p-4 flex items-center gap-3">
                        {social.brand ? (
                          <Icon className="h-10 w-10" />
                        ) : (
                          <div className="rounded-full bg-blue-50 p-2.5">
                            <Icon className="h-5 w-5 text-orange-400" />
                          </div>
                        )}
                        <span className="text-sm font-medium">{social.label}</span>
                      </CardContent>
                    </Card>
                  </a>
                )
              })}
            </div>
          </FadeInWhenVisible>
        </div>
      </section>
    </div>
  )
}
