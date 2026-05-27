'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import Header from '@/components/mealicious/Header'
import Footer from '@/components/mealicious/Footer'
import ContactPage from '@/components/mealicious/ContactPage'

export default function ContactRoute() {
  useEffect(() => {
    useAppStore.setState({ currentPage: 'contact' })
  }, [])
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1"><ContactPage /></main>
      <Footer />
    </div>
  )
}
