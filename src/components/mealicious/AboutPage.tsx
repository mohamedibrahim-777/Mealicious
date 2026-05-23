'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Heart,
  ShieldCheck,
  Leaf,
  Lightbulb,
  Star,
  ArrowRight,
  Users,
  Package,
  MapPin,
  Award,
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

function StaggerContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const staggerChild = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

/* ─────────────────────── data ─────────────────────── */

const stats = [
  { icon: Users, label: 'Customers', value: '10,000+', color: 'text-orange-400' },
  { icon: Package, label: 'Products', value: '50+', color: 'text-orange-400' },
  { icon: MapPin, label: 'Cities', value: '100+', color: 'text-orange-400' },
  { icon: Star, label: 'Rating', value: '4.8★', color: 'text-orange-400' },
]

const teamValues = [
  {
    icon: ShieldCheck,
    title: 'Quality First',
    desc: 'Every product undergoes rigorous quality checks. We source only the finest ingredients from trusted farms worldwide.',
    color: 'text-orange-400',
    bg: 'bg-blue-50',
  },
  {
    icon: Heart,
    title: 'Customer Love',
    desc: 'Our customers are at the heart of everything we do. From packaging to delivery, every detail is crafted with care.',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
  {
    icon: Leaf,
    title: 'Sustainability',
    desc: 'We are committed to eco-friendly practices — from recyclable packaging to supporting sustainable farming communities.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    desc: 'We constantly innovate — new flavors, healthier options, and better ways to bring premium snacking to your doorstep.',
    color: 'text-orange-400',
    bg: 'bg-orange-50',
  },
]

/* ═══════════════════════ ABOUT PAGE ═══════════════════════ */

export default function AboutPage() {
  const navigate = useAppStore((s) => s.navigate)

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
              About Mealicious Store
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
              We&apos;re on a mission to make premium, healthy snacking accessible to everyone.
              Fresh, natural, and delicious — that&apos;s the Mealicious promise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ──────── 2. Our Story Section ──────── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <FadeInWhenVisible>
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Our Story
                </h2>
                <Separator className="w-16 bg-orange-400 h-1" />
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">MEALICIOUS VENTURES PRIVATE LIMITED</strong> was born from a simple
                  realization — finding truly premium, chemical-free dry fruits and healthy snacks in India
                  shouldn&apos;t be this hard. Founded by health enthusiasts who were tired of compromising
                  on quality, we set out to create a brand that delivers farm-fresh goodness directly
                  to your doorstep.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  What started as a small operation sourcing the finest cashews from Kerala and almonds
                  from California has grown into a trusted name serving over 10,000 happy customers
                  across 100+ cities in India. Every product in our catalog is handpicked, quality-checked,
                  and packaged with care to ensure you receive nothing but the best.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  At Mealicious, we believe that healthy eating should never mean compromising on taste.
                  Our range of flavored nuts, trail mixes, and traditional Indian superfoods like Makhana
                  are crafted to delight your taste buds while nourishing your body. From our family
                  to yours — welcome to the Mealicious experience.
                </p>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50 p-8 sm:p-12 flex flex-col items-center justify-center min-h-[320px]">
                  <Award className="h-20 w-20 text-orange-400 mb-4" />
                  <h3 className="text-2xl font-bold text-orange-400 mb-2">FSSAI Certified</h3>
                  <p className="text-orange-400 text-center max-w-xs">
                    All our products are FSSAI certified and manufactured in licensed facilities
                    following strict quality standards.
                  </p>
                  <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-orange-400">ISO</div>
                      <div className="text-xs text-orange-400">Certified</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-400">GMP</div>
                      <div className="text-xs text-orange-400">Compliant</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-400">HACCP</div>
                      <div className="text-xs text-orange-400">Standards</div>
                    </div>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-blue-200/50 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-blue-300/30 blur-2xl" />
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* ──────── 3. Mission & Vision ──────── */}
      <section className="py-14 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Mission &amp; Vision
              </h2>
              <p className="mt-2 text-muted-foreground">
                What drives us every single day
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <FadeInWhenVisible delay={0.1}>
              <Card className="h-full border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6 sm:p-8 space-y-4">
                  <div className="rounded-full bg-blue-100 p-3 w-fit">
                    <Heart className="h-6 w-6 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-orange-400">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To make premium, chemical-free dry fruits and healthy snacks accessible to every
                    Indian household. We strive to bridge the gap between farm-fresh quality and
                    consumer convenience, ensuring that every bite you take is packed with nutrition
                    and free from harmful additives.
                  </p>
                </CardContent>
              </Card>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <Card className="h-full border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6 sm:p-8 space-y-4">
                  <div className="rounded-full bg-blue-100 p-3 w-fit">
                    <Lightbulb className="h-6 w-6 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-orange-400">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To become India&apos;s most trusted and loved health snack brand, known for
                    uncompromising quality, innovative flavors, and a commitment to sustainability.
                    We envision a future where every family chooses Mealicious as their go-to
                    source for wholesome, delicious snacking.
                  </p>
                </CardContent>
              </Card>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* ──────── 4. Stats Section ──────── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <motion.div key={stat.label} variants={staggerChild}>
                  <Card className="text-center py-8 hover:shadow-md transition-shadow border-border/50 h-full">
                    <CardContent className="p-4 sm:p-6 space-y-3 flex flex-col items-center">
                      <div className="rounded-full bg-blue-50 p-3 sm:p-4">
                        <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${stat.color}`} />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ──────── 5. Team Values ──────── */}
      <section className="py-14 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Our Core Values
              </h2>
              <p className="mt-2 text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>
          </FadeInWhenVisible>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {teamValues.map((item) => {
              const Icon = item.icon
              return (
                <motion.div key={item.title} variants={staggerChild}>
                  <Card className="text-center py-6 hover:shadow-md transition-shadow border-border/50 h-full">
                    <CardContent className="p-4 sm:p-6 space-y-3 flex flex-col items-center">
                      <div className={`rounded-full ${item.bg} p-3 sm:p-4`}>
                        <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${item.color}`} />
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ──────── 6. CTA Section ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-400 to-orange-400">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-orange-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <FadeInWhenVisible>
            <div className="text-center max-w-xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Ready to taste the difference?
              </h2>
              <p className="text-blue-100">
                Explore our collection of premium dry fruits &amp; healthy snacks today.
              </p>
              <Button
                size="lg"
                className="bg-white text-orange-400 hover:bg-blue-50 font-semibold mt-4"
                onClick={() => navigate('shop')}
              >
                Shop Now
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>
    </div>
  )
}
