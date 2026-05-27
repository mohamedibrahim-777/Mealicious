'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import Header from '@/components/mealicious/Header'
import Footer from '@/components/mealicious/Footer'
import { TermsPage } from '@/components/mealicious/PolicyPages'

export default function TermsRoute() {
  useEffect(() => {
    useAppStore.setState({ currentPage: 'terms' })
  }, [])
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1"><TermsPage /></main>
      <Footer />
    </div>
  )
}
