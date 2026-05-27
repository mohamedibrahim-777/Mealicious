'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import Header from '@/components/mealicious/Header'
import Footer from '@/components/mealicious/Footer'
import ShippingPolicyPage from '@/components/mealicious/ShippingPolicyPage'

export default function ShippingRoute() {
  useEffect(() => {
    useAppStore.setState({ currentPage: 'shipping-policy' })
  }, [])
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1"><ShippingPolicyPage /></main>
      <Footer />
    </div>
  )
}
