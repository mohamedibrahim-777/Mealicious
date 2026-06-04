'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Check, ArrowLeft, ShoppingBag, Truck, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/lib/store'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

export default function NotificationsPage() {
  const { user, navigate } = useAppStore()
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID_PUBLIC) return
    setSupported(true)
    navigator.serviceWorker.register('/sw.js').then(reg =>
      reg.pushManager.getSubscription().then(sub => setSubscribed(!!sub))
    ).catch(() => {})
  }, [])

  async function toggle(next: boolean) {
    setBusy(true)
    try {
      if (next) {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') { toast.error('Notifications blocked in browser settings'); return }
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
        })
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub, email: user?.email }),
        })
        setSubscribed(true)
        toast.success('Notifications enabled! 🔔')
      } else {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await fetch('/api/push/subscribe', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) })
          await sub.unsubscribe()
        }
        setSubscribed(false)
        toast.success('Notifications disabled')
      }
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <button onClick={() => navigate('home')} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Home
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
            <Bell className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">Stay updated on orders, offers & more</p>
          </div>
        </div>

        {/* Main toggle */}
        <Card className="mb-4">
          <CardContent className="p-5">
            {!supported ? (
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <BellOff className="h-5 w-5" />
                Push notifications aren&apos;t supported in this browser.
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${subscribed ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    {subscribed ? <Bell className="h-5 w-5 text-orange-500" /> : <BellOff className="h-5 w-5 text-gray-400" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Push Notifications</p>
                    <p className="text-sm text-gray-500">{subscribed ? 'You are subscribed' : 'Turn on to receive alerts'}</p>
                  </div>
                </div>
                <Switch checked={subscribed} disabled={busy} onCheckedChange={toggle} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* What you'll get */}
        <Card>
          <CardContent className="p-5">
            <p className="font-semibold text-gray-900 mb-4">What you&apos;ll be notified about</p>
            <div className="space-y-3">
              {[
                { icon: ShoppingBag, color: 'text-blue-500 bg-blue-50', title: 'Order Updates', desc: 'Confirmation, packing & dispatch alerts' },
                { icon: Truck, color: 'text-green-500 bg-green-50', title: 'Delivery Alerts', desc: 'Know when your order is out for delivery' },
                { icon: Tag, color: 'text-orange-500 bg-orange-50', title: 'Offers & Deals', desc: 'Exclusive discounts and flash sales' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  {subscribed && <Check className="h-4 w-4 text-green-500 ml-auto mt-2" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
