'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import {
  Leaf,
  ShieldCheck,
  Package,
  Truck,
  Star,
  ArrowRight,
  ChevronRight,
  Send,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import {
  categories,
  testimonials,
  getFeaturedProducts,
  getBestSellers,
  getNewArrivals,
} from '@/lib/data'
import ProductCard from '@/components/mealicious/ProductCard'

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
        visible: { transition: { staggerChildren: 0.08 } },
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

/* ─────────────────────── stat items ─────────────────────── */

const stats = [
  { label: 'Happy Customers', value: '10,000+' },
  { label: 'Products', value: '50+' },
  { label: 'Natural', value: '100%' },
  { label: 'Free Shipping', value: '₹599+' },
]

/* ─────────────────────── why choose us items ─────────────────────── */

const whyChooseItems = [
  {
    icon: Leaf,
    title: 'Farm Fresh Quality',
    desc: 'Directly sourced from premium farms',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: ShieldCheck,
    title: 'No Preservatives',
    desc: '100% natural, no artificial additives',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Package,
    title: 'Secure Packaging',
    desc: 'Vacuum-sealed for maximum freshness',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    desc: '3-7 days delivery across India',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
]

/* ═══════════════════════ HOME PAGE ═══════════════════════ */

export default function HomePage() {
  const navigate = useAppStore((s) => s.navigate)
  const featuredProducts = getFeaturedProducts()
  const bestSellers = getBestSellers()
  const newArrivals = getNewArrivals()

  return (
    <div className="flex flex-col">
      {/* ──────── 1. Hero Section ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800">
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left — text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="text-center lg:text-left"
            >
              <Badge className="bg-emerald-500/40 text-emerald-100 border-emerald-400/30 mb-4 text-sm px-3 py-1">
                🌿 100% Natural & Premium Quality
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight tracking-tight">
                Premium Dry Fruits
                <br />
                &amp; Healthy Snacks
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-emerald-100 max-w-lg mx-auto lg:mx-0">
                Handpicked from the finest farms. Delivered fresh to your doorstep.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold shadow-lg"
                  onClick={() => navigate('shop')}
                >
                  Shop Now
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 font-semibold"
                  onClick={() => navigate('shop', { category: 'combo-packs' })}
                >
                  Explore Combos
                </Button>
              </div>
            </motion.div>

            {/* Right — decorative image / pattern */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="hidden lg:flex justify-center items-center"
            >
              <div className="relative w-80 h-80 xl:w-96 xl:h-96">
                {/* Background circle */}
                <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl" />
                <div className="absolute inset-4 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 p-6">
                    {[
                      { emoji: '🥜', label: 'Cashews' },
                      { emoji: '🌰', label: 'Almonds' },
                      { emoji: '🍇', label: 'Berries' },
                      { emoji: '🥣', label: 'Trail Mix' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex flex-col items-center gap-1 rounded-2xl bg-white/15 backdrop-blur-sm p-4"
                      >
                        <span className="text-4xl">{item.emoji}</span>
                        <span className="text-xs text-emerald-100 font-medium">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-emerald-900/60 backdrop-blur-sm border-t border-emerald-500/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-xl sm:text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-200">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────── 2. Category Section ──────── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Shop by Category
              </h2>
              <p className="mt-2 text-muted-foreground">
                Explore our curated collection of premium dry fruits &amp; snacks
              </p>
            </div>
          </FadeInWhenVisible>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <motion.div key={cat.id} variants={staggerChild}>
                <Card
                  className="group cursor-pointer overflow-hidden py-0 gap-0 border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  onClick={() => navigate('shop', { category: cat.slug })}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end gap-2">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <h3 className="font-semibold text-white text-sm leading-tight drop-shadow">
                          {cat.name}
                        </h3>
                        <span className="text-xs text-white/80">
                          {cat.productCount} Products
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ──────── 3. Featured Products Section ──────── */}
      <section className="py-14 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Featured Products
                </h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Our handpicked favorites just for you
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
                onClick={() => navigate('shop')}
              >
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </FadeInWhenVisible>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <motion.div key={product.id} variants={staggerChild}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ──────── 4. Best Sellers Section ──────── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Best Sellers
                </h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Loved by thousands of our customers
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
                onClick={() => navigate('shop')}
              >
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </FadeInWhenVisible>

          {/* Horizontal scrollable row */}
          <FadeInWhenVisible>
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
              {bestSellers.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[220px] sm:min-w-[260px] snap-start shrink-0"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ──────── 5. Why Choose Us Section ──────── */}
      <section className="py-14 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Why Choose Mealicious?
              </h2>
              <p className="mt-2 text-muted-foreground">
                We take pride in delivering the best to your table
              </p>
            </div>
          </FadeInWhenVisible>

          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {whyChooseItems.map((item) => {
              const Icon = item.icon
              return (
                <motion.div key={item.title} variants={staggerChild}>
                  <Card className="text-center py-6 hover:shadow-md transition-shadow border-border/50 h-full">
                    <CardContent className="p-4 sm:p-6 space-y-3 flex flex-col items-center">
                      <div
                        className={`rounded-full ${item.bg} p-3 sm:p-4`}
                      >
                        <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${item.color}`} />
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base">
                        {item.title}
                      </h3>
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

      {/* ──────── 6. New Arrivals Section ──────── */}
      <section className="py-14 sm:py-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  New Arrivals
                </h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Fresh additions to our collection
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
                onClick={() => navigate('shop')}
              >
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </FadeInWhenVisible>

          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <motion.div key={product.id} variants={staggerChild}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ──────── 7. Testimonials Section ──────── */}
      <section className="py-14 sm:py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInWhenVisible>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                What Our Customers Say
              </h2>
              <p className="mt-2 text-muted-foreground">
                Real reviews from real customers
              </p>
            </div>
          </FadeInWhenVisible>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {testimonials.map((t) => (
              <motion.div key={t.id} variants={staggerChild}>
                <Card className="h-full border-border/50 hover:shadow-md transition-shadow">
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    {/* Avatar + info */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                        {t.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {t.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.location}
                        </p>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < t.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-muted text-muted'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      &ldquo;{t.comment}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ──────── 8. Newsletter Section ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <FadeInWhenVisible>
            <div className="text-center max-w-xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Join the Mealicious Family
              </h2>
              <p className="text-emerald-100">
                Subscribe for exclusive offers and health tips
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="h-11 bg-white/10 border-white/20 text-white placeholder:text-emerald-200 focus-visible:border-white/50 focus-visible:ring-white/30"
                />
                <Button
                  size="lg"
                  className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold shrink-0"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-emerald-200/80 mt-2">
                No spam, unsubscribe anytime. We respect your privacy.
              </p>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>
    </div>
  )
}
