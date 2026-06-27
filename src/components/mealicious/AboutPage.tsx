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
  Award,
  Sparkles,
  CheckCircle,
  Shield,
  FileText,
  Bookmark,
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

const coreValues = [
  {
    icon: ShieldCheck,
    title: 'Quality First',
    desc: 'We never compromise on the quality of our ingredients or finished products.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
  },
  {
    icon: Heart,
    title: 'Customer Happiness',
    desc: 'Every decision begins with one question: "Will this create happiness for our customers?"',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    desc: 'We continuously explore new recipes, flavours, and healthier alternatives.',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
  },
  {
    icon: Shield,
    title: 'Integrity',
    desc: 'We believe honesty, transparency, and trust are the foundation of lasting relationships.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
  },
]

const beliefs = [
  'Healthy food should always be delicious.',
  'Every family deserves access to quality snacks.',
  'Honest ingredients build lasting trust.',
  'Small lifestyle choices create a healthier future.',
  'Customer happiness is our greatest achievement.',
  'Innovation and quality go hand in hand.',
]

const productRanges = [
  {
    category: 'Premium Flavoured Makhana',
    desc: 'Light, crunchy, protein-rich, and roasted to perfection.',
    items: ['Cheese Makhana', 'Magic Masala Makhana', 'Peri Peri Makhana'],
  },
  {
    category: 'Healthy Chips',
    desc: 'Made using wholesome ingredients for a delicious and satisfying crunch.',
    items: ['Ragi Chips', 'Mixed Vegetable Chips', 'Beetroot Chips'],
  },
  {
    category: 'Premium Dry Fruits',
    desc: 'Perfect for everyday nutrition, festive gifting, and healthy snacking.',
    items: ['Mixed Dry Fruits', 'Almonds', 'Cashews', 'Peri Peri Cashews', 'Pepper Cashews'],
  },
]

const features = [
  {
    title: 'Carefully Selected Ingredients',
    desc: 'We source quality ingredients that meet our standards for freshness and consistency.',
  },
  {
    title: 'Delicious Flavours',
    desc: 'Our recipes are developed to satisfy modern taste preferences while supporting healthier snacking choices.',
  },
  {
    title: 'Hygienic Manufacturing',
    desc: 'Every product is prepared under strict hygiene practices with attention to food safety and quality.',
  },
  {
    title: 'Trusted Quality',
    desc: 'From sourcing to packaging, every step is carefully monitored to ensure consistency and customer satisfaction.',
  },
  {
    title: 'Customer First',
    desc: 'Your trust inspires us to continuously improve our products, services, and overall experience.',
  },
]

/* ═══════════════════════ ABOUT PAGE ═══════════════════════ */

export default function AboutPage() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div className="flex flex-col">
      {/* ──────── 1. Hero Section ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight font-serif">
              About Mealicious
            </h1>
            <p className="text-xl sm:text-2xl text-amber-50 font-serif italic">
              "Happiness For You. Nature's Goodness in Every Bite."
            </p>
            <p className="text-sm text-amber-100 max-w-xl mx-auto font-mono tracking-widest uppercase">
              Mealicious Ventures Private Limited
            </p>
          </motion.div>
        </div>
      </section>

      {/* ──────── 2. About & Story Section ──────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left: About Text */}
            <FadeInWhenVisible className="space-y-6">
              <div className="space-y-2">
                <span className="text-amber-500 text-sm font-semibold tracking-wider uppercase font-mono">Welcome to Mealicious</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground font-serif">
                  Redefining Indian Snacking
                </h2>
              </div>
              <Separator className="w-16 bg-amber-500 h-1" />
              <p className="text-muted-foreground leading-relaxed">
                At Mealicious, we believe that every snack should bring a smile, nourish the body, and create memorable moments with family and friends. Born from a passion for healthier living and delicious food, Mealicious is committed to redefining the way India snacks by offering wholesome, flavourful, and high-quality products that everyone can enjoy.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We understand that today's consumers seek more than just convenience—they want snacks that combine great taste with quality ingredients. That's why every Mealicious product is thoughtfully crafted using carefully selected raw materials, innovative recipes, and hygienic manufacturing processes to deliver the perfect balance of nutrition and flavour.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether it's a quick office break, a school lunchbox, a family movie night, or a post-workout snack, Mealicious is your trusted companion for every occasion.
              </p>
            </FadeInWhenVisible>

            {/* Right: Our Story */}
            <FadeInWhenVisible className="space-y-6" delay={0.2}>
              <div className="space-y-2">
                <span className="text-amber-500 text-sm font-semibold tracking-wider uppercase font-mono">Our Humble Beginnings</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground font-serif">
                  Our Story
                </h2>
              </div>
              <Separator className="w-16 bg-amber-500 h-1" />
              <p className="text-muted-foreground leading-relaxed">
                Mealicious began with a simple yet meaningful vision—to make healthy snacking enjoyable for every household.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                In a market filled with heavily processed snacks, we saw an opportunity to create products that people could enjoy with greater confidence. We wanted to prove that healthier choices don't have to compromise on taste. Every product we introduce reflects our belief that nutritious food can be exciting, satisfying, and accessible to everyone.
              </p>
              <p className="text-muted-foreground leading-relaxed font-medium text-foreground">
                From our first roasted makhana to our expanding range of millet chips, vegetable chips, and premium dry fruits, our journey has been guided by one promise: delivering happiness through wholesome snacking.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, Mealicious continues to innovate with a customer-first approach, creating products that celebrate nature's goodness while embracing modern food standards.
              </p>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* ──────── 3. Mission & Vision ──────── */}
      <section className="py-16 sm:py-24 bg-stone-50 dark:bg-stone-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            {/* Mission */}
            <FadeInWhenVisible>
              <Card className="h-full border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-white dark:from-stone-900 dark:to-stone-950 shadow-md">
                <CardContent className="p-8 sm:p-10 space-y-5">
                  <div className="rounded-2xl bg-amber-100 dark:bg-amber-950/40 p-4 w-fit text-amber-600 dark:text-amber-400">
                    <Heart className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 font-serif">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    To inspire healthier lifestyles by creating delicious, nutritious, and affordable snacks made with premium ingredients, uncompromising quality, and a commitment to customer happiness.
                  </p>
                </CardContent>
              </Card>
            </FadeInWhenVisible>

            {/* Vision */}
            <FadeInWhenVisible delay={0.2}>
              <Card className="h-full border-amber-200/50 bg-gradient-to-br from-amber-50/50 to-white dark:from-stone-900 dark:to-stone-950 shadow-md">
                <CardContent className="p-8 sm:p-10 space-y-5">
                  <div className="rounded-2xl bg-amber-100 dark:bg-amber-950/40 p-4 w-fit text-amber-600 dark:text-amber-400">
                    <Lightbulb className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 font-serif">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    To become one of India's most trusted healthy snacking brands, delivering innovative products that promote better eating habits, support healthier lifestyles, and bring happiness to millions of families.
                  </p>
                </CardContent>
              </Card>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* ──────── 4. What We Believe Section ──────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground font-serif">
              What We Believe
            </h2>
            <p className="mt-2 text-muted-foreground">The foundational values of the Mealicious philosophy</p>
            <Separator className="w-16 bg-amber-500 h-1 mx-auto mt-4" />
          </div>

          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {beliefs.map((belief, idx) => (
              <motion.div key={idx} variants={staggerChild}>
                <Card className="h-full border-border/50 bg-stone-50/40 dark:bg-stone-900/10">
                  <CardContent className="p-6 flex items-start gap-4">
                    <CheckCircle className="h-5 w-5 text-amber-500 mt-1 shrink-0" />
                    <p className="text-stone-700 dark:text-stone-300 font-medium text-sm sm:text-base leading-relaxed">
                      {belief}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ──────── 5. Our Products Section ──────── */}
      <section className="py-16 sm:py-24 bg-stone-50 dark:bg-stone-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground font-serif">
              Our Products
            </h2>
            <p className="mt-2 text-muted-foreground">Thoughtfully designed healthy snacks for all ages</p>
            <Separator className="w-16 bg-amber-500 h-1 mx-auto mt-4" />
          </div>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {productRanges.map((range, idx) => (
              <motion.div key={idx} variants={staggerChild}>
                <Card className="h-full border-border/60 hover:shadow-md transition-shadow">
                  <CardContent className="p-8 space-y-4">
                    <h4 className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono tracking-wide">
                      {range.category}
                    </h4>
                    <p className="text-sm text-stone-500 leading-normal min-h-[40px]">
                      {range.desc}
                    </p>
                    <Separator />
                    <ul className="space-y-2.5 pt-2">
                      {range.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-center gap-2.5 text-sm text-stone-700 dark:text-stone-300 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ──────── 6. Why Choose Us Section ──────── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground font-serif">
              Why Choose Mealicious?
            </h2>
            <p className="mt-2 text-muted-foreground">Doing honest business that puts your health first</p>
            <Separator className="w-16 bg-amber-500 h-1 mx-auto mt-4" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <FadeInWhenVisible key={idx} delay={idx * 0.05}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold text-sm font-mono">
                      0{idx + 1}
                    </span>
                    <h3 className="font-bold text-lg text-stone-800 dark:text-stone-200">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                    {feat.desc}
                  </p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── 7. Core Values & Commitments ──────── */}
      <section className="py-16 sm:py-24 bg-stone-50 dark:bg-stone-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Values */}
          <div className="mb-16">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground font-serif">
                Our Values
              </h2>
              <Separator className="w-16 bg-amber-500 h-1 mx-auto mt-4" />
            </div>
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {coreValues.map((value, idx) => {
                const Icon = value.icon
                return (
                  <motion.div key={idx} variants={staggerChild}>
                    <Card className="text-center h-full border-border/50">
                      <CardContent className="p-6 space-y-3 flex flex-col items-center">
                        <div className={`rounded-2xl ${value.bg} p-4 text-stone-800`}>
                          <Icon className={`h-6 w-6 ${value.color}`} />
                        </div>
                        <h3 className="font-bold text-stone-800 dark:text-stone-200">{value.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {value.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </StaggerContainer>
          </div>

          <Separator className="my-16" />

          {/* Commitments & Sustainability */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Quality Commitment */}
            <FadeInWhenVisible className="space-y-4">
              <h3 className="text-2xl font-bold font-serif text-stone-800 dark:text-stone-200">Quality Commitment</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Quality is at the heart of everything we do. We focus on:
              </p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-stone-700 dark:text-stone-300 font-medium">
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-amber-500 shrink-0" /> Careful ingredient selection</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-amber-500 shrink-0" /> Hygienic production practices</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-amber-500 shrink-0" /> Strict quality inspections</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-amber-500 shrink-0" /> Food safety compliance</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-amber-500 shrink-0" /> Freshness preservation</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-amber-500 shrink-0" /> Secure packaging</li>
              </ul>
              <p className="text-xs text-muted-foreground italic pt-2">
                Every pack reflects our commitment to delivering snacks you can enjoy with confidence.
              </p>
            </FadeInWhenVisible>

            {/* Sustainability */}
            <FadeInWhenVisible className="space-y-4" delay={0.2}>
              <h3 className="text-2xl font-bold font-serif text-stone-800 dark:text-stone-200">Sustainability</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We believe responsible businesses create lasting value. Mealicious is committed to:
              </p>
              <ul className="space-y-2 text-sm text-stone-700 dark:text-stone-300 font-medium">
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  Responsible sourcing practices.
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  Reducing unnecessary waste in manufacturing.
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  Improving shipping & packaging solutions.
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  Ethical business operations and community support.
                </li>
              </ul>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* ──────── 8. Legal & Compliance Card ──────── */}
      <section className="py-16 bg-background border-t">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <FadeInWhenVisible>
            <Card className="border-stone-200 bg-stone-50/50 dark:bg-stone-900/10">
              <CardContent className="p-8 sm:p-10 space-y-6">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-amber-500" />
                  <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                    Legal &amp; Compliance Information
                  </h3>
                </div>
                <Separator />
                <div className="grid sm:grid-cols-2 gap-6 text-sm text-stone-700 dark:text-stone-300">
                  <div className="space-y-3">
                    <p className="flex items-center gap-2.5">
                      <span className="font-bold text-stone-900 dark:text-stone-100 shrink-0">FSSAI License:</span>
                      22426193000120
                    </p>
                    <p className="flex items-center gap-2.5">
                      <span className="font-bold text-stone-900 dark:text-stone-100 shrink-0">GSTIN:</span>
                      33AAUCM2609Q1ZT
                    </p>
                    <p className="flex items-center gap-2.5">
                      <span className="font-bold text-stone-900 dark:text-stone-100 shrink-0">CIN:</span>
                      U10799TZ2025PTC037179
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 dark:text-stone-100 mb-1">Registered Address:</p>
                    <p className="text-muted-foreground leading-relaxed">
                      Mealicious Ventures Private Limited
                      <br />
                      1/108, Elappankadu, Malankadu,
                      <br />
                      Uthamasolapuram, Salem - 636010,
                      <br />
                      Tamil Nadu, India
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ──────── 9. CTA Section ──────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600">
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-black/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <FadeInWhenVisible>
            <div className="text-center max-w-xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">
                Join the Mealicious Family
              </h2>
              <p className="text-amber-50 text-base">
                Explore our growing range of premium dry fruits, nuts, and healthy snacks.
              </p>
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-amber-50 font-bold mt-4 rounded-xl shadow-md"
                onClick={() => navigate('shop')}
              >
                Shop Now
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>
    </div>
  )
}
