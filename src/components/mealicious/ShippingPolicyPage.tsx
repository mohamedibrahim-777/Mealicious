'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ChevronRight,
  Home,
  Truck,
  Clock,
  Globe,
  AlertCircle,
  Package,
  PartyPopper,
  Banknote,
  Check,
  Mail,
} from 'lucide-react'

export default function ShippingPolicyPage() {
  const { navigate } = useAppStore()

  const sections = [
    { id: 'overview', title: 'Shipping Overview' },
    { id: 'domestic', title: 'Domestic Shipping' },
    { id: 'delivery-time', title: 'Delivery Timeframes' },
    { id: 'charges', title: 'Shipping Charges' },
    { id: 'tracking', title: 'Order Tracking' },
    { id: 'restrictions', title: 'Shipping Restrictions' },
    { id: 'damaged', title: 'Damaged in Transit' },
    { id: 'contact', title: 'Contact Us' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-400 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-blue-100 mb-4">
            <button onClick={() => navigate('home')} className="hover:text-white transition-colors">
              <Home className="h-4 w-4" />
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-sm">Shipping Policy</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Shipping Policy</h1>
          <p className="text-blue-100 mt-2">Last updated: June 2025</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <Card className="p-4 sticky top-24">
              <h3 className="font-semibold text-sm mb-3">On This Page</h3>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-blue-50 hover:text-orange-400 transition-colors"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="flex-1 max-w-3xl">
            <Card className="p-6 md:p-8 space-y-8">
              <section id="overview">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5 text-orange-400" />
                  <h2 className="text-xl font-bold">Shipping Overview</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  At Mealicious Store, we take great care in ensuring your premium dry fruits and healthy snacks reach you in perfect condition. We partner with trusted logistics providers including Shiprocket, Delhivery, and BlueDart to deliver your orders safely and on time across India.
                </p>
              </section>

              <Separator />

              <section id="domestic">
                <h2 className="text-xl font-bold mb-4">Domestic Shipping</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We currently deliver across all major cities and pin codes in India. Our products are carefully packed in food-grade, vacuum-sealed packaging to maintain freshness and quality during transit.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-400 mb-2 inline-flex items-center gap-2"><Package className="h-4 w-4" /> Packaging Standards</h4>
                  <ul className="space-y-1 text-sm text-orange-400">
                    <li>• Food-grade, BPA-free packaging</li>
                    <li>• Vacuum-sealed for maximum freshness</li>
                    <li>• Protective cushioning for fragile items</li>
                    <li>• Temperature-controlled packaging for sensitive products</li>
                    <li>• Tamper-evident seals on all packages</li>
                  </ul>
                </div>
              </section>

              <Separator />

              <section id="delivery-time">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-orange-400" />
                  <h2 className="text-xl font-bold">Delivery Timeframes</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="text-left p-3 font-semibold text-orange-400">Zone</th>
                        <th className="text-left p-3 font-semibold text-orange-400">Estimated Delivery</th>
                        <th className="text-left p-3 font-semibold text-orange-400">Cities</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr><td className="p-3">Metro Cities</td><td className="p-3">2-3 business days</td><td className="p-3 text-gray-500">Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata</td></tr>
                      <tr className="bg-gray-50"><td className="p-3">Tier 1 Cities</td><td className="p-3">3-5 business days</td><td className="p-3 text-gray-500">Pune, Ahmedabad, Jaipur, Lucknow, Chandigarh</td></tr>
                      <tr><td className="p-3">Tier 2 Cities</td><td className="p-3">4-7 business days</td><td className="p-3 text-gray-500">Most state capitals and major cities</td></tr>
                      <tr className="bg-gray-50"><td className="p-3">Rural Areas</td><td className="p-3">7-10 business days</td><td className="p-3 text-gray-500">Remote locations and villages</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">* Delivery times are estimates and may vary during festivals, sales events, or due to unforeseen circumstances.</p>
              </section>

              <Separator />

              <section id="charges">
                <h2 className="text-xl font-bold mb-4">Shipping Charges</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <PartyPopper className="h-6 w-6 text-orange-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-orange-400">Free Shipping on Orders Above ₹499</p>
                      <p className="text-sm text-orange-400">No shipping fee on any order above ₹499</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Package className="h-6 w-6 text-gray-600 shrink-0" />
                    <div>
                      <p className="font-semibold">Flat ₹49 for Orders Below ₹499</p>
                      <p className="text-sm text-gray-500">Nominal fee for smaller orders</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Banknote className="h-6 w-6 text-gray-600 shrink-0" />
                    <div>
                      <p className="font-semibold">COD Fee: FREE</p>
                      <p className="text-sm text-gray-500">No additional charges for Cash on Delivery</p>
                    </div>
                  </div>
                </div>
              </section>

              <Separator />

              <section id="tracking">
                <h2 className="text-xl font-bold mb-4">Order Tracking</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Once your order is shipped, you will receive:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-1 shrink-0" /> Shipping confirmation email with tracking number</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-1 shrink-0" /> WhatsApp notification with tracking link</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-1 shrink-0" /> SMS update with delivery status</li>
                  <li className="flex items-start gap-2"><Check className="h-4 w-4 text-orange-400 mt-1 shrink-0" /> Real-time tracking on our Track Order page</li>
                </ul>
              </section>

              <Separator />

              <section id="restrictions">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                  <h2 className="text-xl font-bold">Shipping Restrictions</h2>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li>• We do not currently ship internationally</li>
                  <li>• Some remote pin codes may not be serviceable</li>
                  <li>• Delivery to PO Box addresses is not available</li>
                  <li>• Orders containing items with different availability may be shipped separately</li>
                </ul>
              </section>

              <Separator />

              <section id="damaged">
                <h2 className="text-xl font-bold mb-4">Damaged in Transit</h2>
                <p className="text-gray-600 leading-relaxed">
                  If your order arrives damaged, please contact us within 24 hours of delivery with photos of the damaged packaging and products. We will arrange a replacement or full refund. Email us at <span className="text-orange-400 font-medium">support@mealicious.in</span>.
                </p>
              </section>

              <Separator />

              <section id="contact">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-orange-400" />
                  <h2 className="text-xl font-bold">Shipping Queries</h2>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-gray-600 flex items-center gap-2"><Mail className="h-4 w-4" /> Email: <span className="text-orange-400">support@mealicious.in</span></p>
                  <p className="text-gray-600 flex items-center gap-2"><Clock className="h-4 w-4" /> Support Hours: 10 AM - 8 PM IST, Monday to Saturday</p>
                </div>
                <div className="mt-4">
                  <Button onClick={() => navigate('contact')} className="bg-orange-400 hover:bg-orange-400">
                    Contact Us
                  </Button>
                </div>
              </section>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
