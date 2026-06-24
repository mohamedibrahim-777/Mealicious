'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { toast } from 'sonner'
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

export function PushOptIn({ variant = 'floating' }: { variant?: 'floating' | 'header' }) {
  const user = useAppStore(s => s.user)
  const [supported, setSupported] = useState(() => {
    if (typeof window === 'undefined') return false
    return 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC
  })
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!supported) return
    navigator.serviceWorker.register('/sw.js').then(reg =>
      reg.pushManager.getSubscription().then(sub => setSubscribed(!!sub))
    ).catch(() => {})
  }, [supported])

  async function subscribe() {
    setBusy(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { toast.error('Notifications blocked'); return }
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
    } catch {
      toast.error('Could not enable notifications')
    } finally { setBusy(false) }
  }

  async function unsubscribe() {
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) })
        await sub.unsubscribe()
      }
      setSubscribed(false)
      toast.success('Notifications disabled')
    } catch {
      toast.error('Failed')
    } finally { setBusy(false) }
  }

  if (!supported) return null

  if (variant === 'header') {
    return (
      <button
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={busy}
        className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-md text-gray-600 hover:text-orange-400 hover:bg-blue-50 transition-colors"
        title={subscribed ? 'Disable notifications' : 'Enable notifications'}
        aria-label="Notifications"
      >
        {subscribed
          ? <Bell className="h-[18px] w-[18px] sm:h-5 sm:w-5 text-orange-500 fill-orange-500" />
          : <Bell className="h-[18px] w-[18px] sm:h-5 sm:w-5" />}
      </button>
    )
  }

  return (
    <button
      onClick={subscribed ? unsubscribe : subscribe}
      disabled={busy}
      className="fixed bottom-6 right-24 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-neutral-200 shadow-lg hover:bg-neutral-50 transition-colors"
      title={subscribed ? 'Disable notifications' : 'Enable notifications'}
    >
      {subscribed
        ? <Bell className="h-5 w-5 text-orange-500 fill-orange-500" />
        : <BellOff className="h-5 w-5 text-neutral-400" />}
    </button>
  )
}
