'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Leaf } from 'lucide-react'

/* ───────────────────────────────────────────────────────────────
   ShuffleHero — adapted from hover.dev "Shuffle Hero"
   Themed for Mealicious (premium dry fruits & healthy snacks).
   ─────────────────────────────────────────────────────────────── */

interface ShuffleHeroProps {
  title?: string
  subtitle?: string
  onShop?: () => void
}

export default function ShuffleHero({
  title = 'Premium dry fruits & healthy snacks',
  subtitle = "Experience nature's premium harvest — clean, nutrient-dense snacking sourced from elite farms and delivered fresh to your door.",
  onShop,
}: ShuffleHeroProps) {
  return (
    <section className="mx-auto grid min-h-[calc(100svh_-_7rem)] w-full max-w-6xl grid-cols-1 items-center gap-8 border-y border-stone-200 px-8 py-8 md:grid-cols-2">
      <div>
        <span className="mb-4 block text-xs font-semibold uppercase tracking-wider text-amber-600 md:text-sm">
          <Leaf className="mr-1.5 inline h-4 w-4" /> Better snacking, every day
        </span>
        <h3 className="font-serif text-4xl font-semibold leading-tight text-stone-900 md:text-6xl">
          {title}
        </h3>
        <p className="my-4 text-base text-stone-600 md:my-6 md:text-lg">
          {subtitle}
        </p>
        <button
          onClick={onShop}
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-medium text-white shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-orange-400 active:scale-95"
        >
          Shop Collection
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      <ShuffleGrid />
    </section>
  )
}

/* ─────────────────────── shuffle helpers ─────────────────────── */

interface Square {
  id: number
  src: string
}

function shuffle(array: Square[]) {
  let currentIndex = array.length
  let randomIndex: number

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

// only clean, text-free food photos for a cohesive mosaic
const squareData: Square[] = [
  { id: 1, src: '/images/products/dried-fruits.png' },
  { id: 2, src: '/images/products/honey-cashews-pistachios.png' },
  { id: 3, src: '/images/products/makhana.png' },
  { id: 4, src: '/images/products/seeds-mix.png' },
  { id: 5, src: '/images/products/trail-mix.png' },
  { id: 6, src: '/images/products/quinoa-walnuts.png' },
  { id: 7, src: '/images/products/chocolate-almonds.png' },
  { id: 8, src: '/images/banners/hero-banner.png' },
  { id: 9, src: '/images/products/combo-pack.png' },
  { id: 10, src: '/images/products/dried-fruits.png' },
  { id: 11, src: '/images/products/honey-cashews-pistachios.png' },
  { id: 12, src: '/images/products/trail-mix.png' },
  { id: 13, src: '/images/products/makhana.png' },
  { id: 14, src: '/images/products/quinoa-walnuts.png' },
  { id: 15, src: '/images/products/seeds-mix.png' },
  { id: 16, src: '/images/products/chocolate-almonds.png' },
]

function generateSquares() {
  return shuffle([...squareData]).map((sq) => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: 'spring' }}
      className="h-full w-full rounded-md"
      style={{
        backgroundImage: `url(${sq.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    />
  ))
}

function ShuffleGrid() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [squares, setSquares] = useState(generateSquares)

  useEffect(() => {
    const shuffleSquares = () => {
      setSquares(generateSquares())
      timeoutRef.current = setTimeout(shuffleSquares, 3000)
    }
    shuffleSquares()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div className="grid h-[clamp(280px,calc(100svh_-_16rem),500px)] grid-cols-4 grid-rows-4 gap-1">
      {squares}
    </div>
  )
}
