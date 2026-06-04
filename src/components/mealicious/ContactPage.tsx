'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { toast } from 'sonner'
import {
  Mail,
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
    website: '', // honeypot
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
        setFormState({ name: '', email: '', phone: '', subject: '', message: '', website: '' })
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
                      {/* Honeypot — hidden from humans, bots fill it */}
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="absolute -left-[9999px] h-0 w-0 opacity-0"
                        onChange={(e) => setFormState({ ...formState, website: e.target.value })}
                      />
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
