'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import Header from '@/components/mealicious/Header'
import Footer from '@/components/mealicious/Footer'
import ShopPage from '@/components/mealicious/ShopPage'

export default function ShopRoute() {
  useEffect(() => {
    useAppStore.setState({ currentPage: 'shop' })
  }, [])
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1"><ShopPage /></main>
      <Footer />
    </div>
  )
}
