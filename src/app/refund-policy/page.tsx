'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import Header from '@/components/mealicious/Header'
import Footer from '@/components/mealicious/Footer'
import { RefundPolicyPage } from '@/components/mealicious/PolicyPages'

export default function RefundRoute() {
  useEffect(() => {
    useAppStore.setState({ currentPage: 'refund-policy' })
  }, [])
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1"><RefundPolicyPage /></main>
      <Footer />
    </div>
  )
}
