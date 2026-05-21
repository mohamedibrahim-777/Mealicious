'use client'

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
import AIChatWidget from '@/components/mealicious/AIChatWidget'

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
      return <WishlistPage />
    default:
      return <HomePage />
  }
}

export default function MealiciousStore() {
  const { currentPage } = useAppStore()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <PageRenderer page={currentPage} />
      </main>
      <Footer />
      <CartSidebar />
      <AIChatWidget />
    </div>
  )
}
