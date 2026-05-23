'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
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
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M16.003 3C9.374 3 4 8.373 4 14.998c0 2.31.654 4.467 1.79 6.302L4 29l7.892-1.736A11.94 11.94 0 0 0 16.003 28C22.63 28 28 22.626 28 16.001 28 9.376 22.63 3 16.003 3Zm0 22.182a9.96 9.96 0 0 1-5.07-1.385l-.364-.216-4.682 1.03 1.046-4.555-.237-.374a9.95 9.95 0 0 1-1.523-5.282c0-5.515 4.487-10 10.005-10 5.518 0 10.005 4.485 10.005 10s-4.487 10.782-9.18 10.782Zm5.49-7.473c-.3-.15-1.778-.876-2.053-.976-.275-.1-.475-.15-.675.15-.2.3-.776.976-.95 1.176-.176.2-.35.225-.65.075-.3-.15-1.27-.468-2.42-1.494-.895-.798-1.498-1.784-1.674-2.084-.176-.3-.019-.462.132-.612.136-.135.3-.35.45-.525.15-.176.2-.3.3-.5.1-.2.05-.376-.025-.526-.075-.15-.675-1.625-.925-2.225-.244-.586-.493-.508-.675-.516l-.575-.011a1.1 1.1 0 0 0-.8.376c-.275.3-1.05 1.026-1.05 2.5 0 1.476 1.075 2.9 1.225 3.1.15.2 2.114 3.225 5.124 4.52.717.31 1.276.493 1.712.63.72.23 1.376.198 1.894.12.578-.086 1.778-.726 2.029-1.427.25-.7.25-1.302.176-1.426-.075-.124-.275-.2-.575-.35Z"
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
    detail: '+91-9876543210',
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
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
  { icon: WhatsAppIcon, label: 'WhatsApp', href: '#', brand: true },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormState({ name: '', email: '', phone: '', subject: '', message: '' })
    }, 3000)
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
                        className="bg-orange-400 hover:bg-orange-400 text-white font-semibold"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
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
                  <Card
                    key={social.label}
                    className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
                    onClick={() => navigate('home')}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div
                        className={`rounded-full p-2.5 ${
                          social.brand ? 'bg-[#25D366]' : 'bg-blue-50'
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${
                            social.brand ? 'text-white' : 'text-orange-400'
                          }`}
                        />
                      </div>
                      <span className="text-sm font-medium">{social.label}</span>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </FadeInWhenVisible>
        </div>
      </section>
    </div>
  )
}
