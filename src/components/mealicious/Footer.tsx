'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Leaf, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'

export default function Footer() {
  const navigate = useAppStore((s) => s.navigate)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  const quickLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'Shop', page: 'shop' as const },
    { label: 'About Us', page: 'about' as const },
    { label: 'Contact Us', page: 'contact' as const },
    { label: 'Blog', page: 'blog' as const },
    { label: 'FAQ', page: 'faq' as const },
  ]

  const policyLinks = [
    { label: 'Privacy Policy', page: 'privacy' as const },
    { label: 'Terms & Conditions', page: 'terms' as const },
    { label: 'Shipping Policy', page: 'shipping-policy' as const },
    { label: 'Refund Policy', page: 'refund-policy' as const },
    { label: 'Track Order', page: 'track-order' as const },
  ]

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Youtube, label: 'YouTube', href: '#' },
  ]

  return (
    <footer className="mt-auto bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
            <div className="max-w-md">
              <h3 className="text-xl font-bold text-white">Subscribe to Our Newsletter</h3>
              <p className="mt-1 text-sm text-gray-400">
                Get the latest updates on new products, exclusive deals & healthy snacking tips.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full max-w-sm gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-700 bg-gray-800 text-gray-200 placeholder:text-gray-500 focus:border-orange-400 focus:ring-orange-400"
              />
              <Button
                type="submit"
                className="shrink-0 bg-orange-400 hover:bg-orange-400 text-white"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <Leaf className="h-7 w-7 text-orange-400" />
              <span className="text-xl font-extrabold tracking-wide text-white">MEALICIOUS</span>
            </div>
            <p className="mt-1 text-sm font-medium text-blue-400">
              Premium Health Snacks &amp; Dry Fruits
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              We bring you the finest selection of premium dry fruits, nuts, and health snacks —
              sourced from the best farms, packed with care, and delivered fresh to your doorstep.
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-orange-400 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, page }) => (
                <li key={page}>
                  <button
                    onClick={() => navigate(page)}
                    className="text-sm text-gray-400 transition-colors hover:text-blue-400"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Policies
            </h4>
            <ul className="space-y-2.5">
              {policyLinks.map(({ label, page }) => (
                <li key={page}>
                  <button
                    onClick={() => navigate(page)}
                    className="text-sm text-gray-400 transition-colors hover:text-blue-400"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <span className="text-sm text-gray-400">support@mealicious.store</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <span className="text-sm text-gray-400">+91-7397075166</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <span className="text-sm text-gray-400">
                  Mealicious Ventures Pvt. Ltd.,
                  <br />
                  Mumbai, India
                </span>
              </li>
            </ul>

            {/* Payment Icons */}
            <div className="mt-6">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                We Accept
              </p>
              <div className="flex flex-wrap gap-2">
                {['Visa', 'Mastercard', 'UPI', 'PayPal', 'RuPay'].map((method) => (
                  <span
                    key={method}
                    className="inline-flex items-center rounded bg-gray-800 px-2 py-1 text-[10px] font-semibold text-gray-300"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500">
            &copy; 2024 Mealicious Ventures Private Limited. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
