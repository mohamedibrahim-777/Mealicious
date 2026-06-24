'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldCheck, Mail, Clock, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function MaintenancePage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Calculate dynamic countdown (target date: 12 hours from now)
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 30, seconds: 45 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          clearInterval(timer)
          return { hours: 0, minutes: 0, seconds: 0 }
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Successfully subscribed! We will notify you.')
        setEmail('')
      } else {
        toast.error(data.error || 'Failed to subscribe')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center relative overflow-hidden px-4 font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Premium glowing background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-orange-600/10 blur-[100px] pointer-events-none" />

      {/* Main Content Card */}
      <div className="max-w-md w-full z-10 text-center space-y-8 py-12 px-6 rounded-2xl border border-stone-800/80 bg-stone-900/40 backdrop-blur-xl shadow-2xl shadow-black/80">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl font-black tracking-widest bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            MEALICIOUS
          </span>
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-stone-400 tracking-widest border border-stone-800 bg-stone-950/60 px-3 py-1 rounded-full">
            <ShieldCheck className="h-3 w-3 text-amber-500" /> Secure Operations
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-100 leading-tight">
            Crafting a Better <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Snacking</span> Experience
          </h1>
          <p className="text-sm text-stone-400 leading-relaxed font-medium">
            We are currently updating our systems to bring you an upgraded, faster, and more delicious shopping journey.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="space-y-2">
          <p className="text-xs uppercase font-extrabold text-stone-500 tracking-wider flex items-center justify-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-500" /> Estimated Time Remaining
          </p>
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {/* Hours */}
            <div className="bg-stone-950/80 border border-stone-800/60 p-3 rounded-xl flex flex-col items-center">
              <span className="text-2xl font-black text-stone-100 tabular-nums">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider mt-0.5">Hours</span>
            </div>
            {/* Minutes */}
            <div className="bg-stone-950/80 border border-stone-800/60 p-3 rounded-xl flex flex-col items-center">
              <span className="text-2xl font-black text-amber-400 tabular-nums">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider mt-0.5">Mins</span>
            </div>
            {/* Seconds */}
            <div className="bg-stone-950/80 border border-stone-800/60 p-3 rounded-xl flex flex-col items-center">
              <span className="text-2xl font-black text-orange-500 tabular-nums">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase font-bold text-stone-500 tracking-wider mt-0.5">Secs</span>
            </div>
          </div>
        </div>

        {/* Subscription Signup Form */}
        <div className="border-t border-stone-800/60 pt-6 space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-stone-300">Get Notified When We Go Live</Label>
            <p className="text-[10px] text-stone-500">Sign up and we will drop you a line the exact minute we are back online.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <Input
                type="email"
                placeholder="Enter your email address"
                className="pl-9 h-10 bg-stone-950 border-stone-800 text-stone-200 focus:border-amber-500 text-sm rounded-xl focus:ring-0"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 rounded-xl cursor-pointer shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 transition-colors"
            >
              {loading ? '...' : (
                <>
                  <span className="hidden sm:inline">Notify Me</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

      </div>

      {/* Footer Support Info */}
      <div className="z-10 mt-8 text-center text-xs text-stone-600 font-semibold space-y-1">
        <p>Need urgent assistance with an existing order?</p>
        <p>Contact us at <a href="mailto:support@mealicious.store" className="text-stone-500 hover:text-stone-400 underline transition-colors">support@mealicious.store</a></p>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-left text-xs ${className}`}>{children}</label>
}
