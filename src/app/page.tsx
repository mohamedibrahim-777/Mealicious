'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore, Page } from '@/lib/store'
import Header from '@/components/mealicious/Header'
import Footer from '@/components/mealicious/Footer'
import HomePage from '@/components/mealicious/HomePage'
import ShopPage from '@/components/mealicious/ShopPage'
import ProductDetail from '@/components/mealicious/ProductDetail'
import CartSidebar from '@/components/mealicious/CartSidebar'
import CheckoutPage from '@/components/mealicious/CheckoutPage'
import { LoginPage, RegisterPage } from '@/components/mealicious/AuthPages'
import AboutPage from '@/components/mealicious/AboutPage'
import ContactPage from '@/components/mealicious/ContactPage'
import FAQPage from '@/components/mealicious/FAQPage'
import BlogPage from '@/components/mealicious/BlogPage'
import { PrivacyPolicyPage, TermsPage, RefundPolicyPage } from '@/components/mealicious/PolicyPages'
import ShippingPolicyPage from '@/components/mealicious/ShippingPolicyPage'
import TrackOrderPage from '@/components/mealicious/TrackOrderPage'
import WishlistPage from '@/components/mealicious/WishlistPage'
import ProfilePage from '@/components/mealicious/ProfilePage'

function PageRenderer({ page }: { page: Page }) {
  switch (page) {
    case 'home':
      return <HomePage />
    case 'shop':
      return <ShopPage />
    case 'product':
      return <ProductDetail />
    case 'checkout':
      return <CheckoutPage />
    case 'about':
      return <AboutPage />
    case 'contact':
      return <ContactPage />
    case 'faq':
      return <FAQPage />
    case 'blog':
      return <BlogPage />
    case 'blog-post':
      return <BlogPage />
    case 'privacy':
      return <PrivacyPolicyPage />
    case 'terms':
      return <TermsPage />
    case 'shipping-policy':
      return <ShippingPolicyPage />
    case 'refund-policy':
      return <RefundPolicyPage />
    case 'track-order':
      return <TrackOrderPage />
    case 'login':
      return <LoginPage />
    case 'register':
      return <RegisterPage />
    case 'wishlist':
      return <WishlistPage />
    case 'cart':
      return <CheckoutPage />
    case 'profile':
      return <ProfilePage />
    default:
      return <HomePage />
  }
}

export default function MealiciousStore() {
  const { currentPage } = useAppStore()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // Cashfree return-URL handler: after the user pays, Cashfree redirects to
  // `/?cashfree_order_id=...#payment-return`. Verify the order server-side and notify the user.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const cfOrderId = url.searchParams.get('cashfree_order_id')
    if (!cfOrderId) return
    ;(async () => {
      try {
        const res = await fetch(`/api/payments/cashfree/verify?orderId=${encodeURIComponent(cfOrderId)}`)
        const data = await res.json()
        if (data.paid) {
          const { clearCart, navigate } = useAppStore.getState()
          clearCart()
          alert(`Payment successful! Order ${cfOrderId} confirmed.`)
          navigate('track-order', { orderId: cfOrderId })
        } else {
          alert(`Payment status: ${data.status ?? 'unknown'}. If you were charged, please contact support.`)
        }
      } catch {
        alert('Could not verify payment. Please contact support if you were charged.')
      } finally {
        url.searchParams.delete('cashfree_order_id')
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
      }
    })()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Seed initial history entry
    if (!window.history.state?.page) {
      window.history.replaceState(
        { page: useAppStore.getState().currentPage, params: useAppStore.getState().pageParams },
        '',
        '#' + useAppStore.getState().currentPage,
      )
    }
    const onPopState = (e: PopStateEvent) => {
      const state = e.state as { page?: Page; params?: Record<string, string> } | null
      if (state?.page) {
        useAppStore.setState({
          currentPage: state.page,
          pageParams: state.params ?? {},
          mobileMenuOpen: false,
        })
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <PageRenderer page={currentPage} />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <CartSidebar />
    </div>
  )
}
