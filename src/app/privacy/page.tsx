'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import Header from '@/components/mealicious/Header'
import Footer from '@/components/mealicious/Footer'
import { PrivacyPolicyPage } from '@/components/mealicious/PolicyPages'

export default function PrivacyRoute() {
  useEffect(() => {
    useAppStore.setState({ currentPage: 'privacy' })
  }, [])
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1"><PrivacyPolicyPage /></main>
      <Footer />
    </div>
  )
}
