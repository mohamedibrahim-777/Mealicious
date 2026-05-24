'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Leaf, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'
import { useAppStore } from '@/lib/store'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

/* ─────────── shared helpers ─────────── */

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
}

function getPasswordStrength(pw: string) {
  let score = 0
  if (pw.length >= 6) score += 1
  if (pw.length >= 10) score += 1
  if (/[A-Z]/.test(pw)) score += 1
  if (/[0-9]/.test(pw)) score += 1
  if (/[^A-Za-z0-9]/.test(pw)) score += 1
  return score // 0‑5
}

const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
const strengthColors = [
  'bg-gray-200',
  'bg-red-400',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-blue-400',
  'bg-orange-400',
]

function Logo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400 text-white">
        <Leaf className="h-6 w-6" />
      </div>
      <span className="text-2xl font-bold tracking-tight text-orange-400">
        MEALICIOUS
      </span>
    </div>
  )
}

async function handleGoogleSignIn() {
  try {
    const res = await signIn('google', { callbackUrl: '/', redirect: false })
    if (res?.error === 'OAuthSignin' || res?.error?.includes('client_id')) {
      toast.error('Google sign-in is not configured. Add GOOGLE_CLIENT_ID/SECRET to .env')
      return
    }
    if (res?.error) {
      toast.error(`Google sign-in failed: ${res.error}`)
      return
    }
    if (res?.url) {
      window.location.href = res.url
    }
  } catch {
    toast.error('Google sign-in is not available. Check server configuration.')
  }
}

function SocialButtons() {
  return (
    <div className="flex gap-3">
      <Button
        type="button"
        variant="outline"
        className="flex-1 gap-2"
        onClick={handleGoogleSignIn}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>
    </div>
  )
}

/* ═══════════════ LOGIN PAGE ═══════════════ */

export function LoginPage() {
  const { login, navigate } = useAppStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    // simulate network delay
    await new Promise((r) => setTimeout(r, 600))
    const ok = login(email, password)
    setLoading(false)
    if (ok) {
      toast.success('Welcome back!')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-12">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="border-blue-100 shadow-xl shadow-blue-100/40">
          <CardHeader className="items-center text-center">
            <Logo />
            <div className="mt-2 space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-500">
                Sign in to your account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="login-pw">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="login-pw"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember / Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(v) => setRemember(v === true)}
                  />
                  <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-gray-600">
                    Remember Me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-orange-400 hover:text-orange-400 hover:underline"
                  onClick={() => toast.info('Password reset is not available in demo')}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-orange-400 text-white hover:bg-orange-400"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing In…
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">
                Or continue with
              </span>
            </div>

            {/* Social */}
            <SocialButtons />

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                className="font-semibold text-orange-400 hover:text-orange-400 hover:underline"
                onClick={() => navigate('register')}
              >
                Register
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

/* ═══════════════ REGISTER PAGE ═══════════════ */

export function RegisterPage() {
  const { register, navigate } = useAppStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)

  const pwStrength = getPasswordStrength(password)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !phone || !password || !confirmPw) {
      toast.error('Please fill in all fields')
      return
    }
    if (password !== confirmPw) {
      toast.error('Passwords do not match')
      return
    }
    if (pwStrength < 2) {
      toast.error('Please choose a stronger password')
      return
    }
    if (!agreeTerms) {
      toast.error('Please agree to the Terms & Conditions')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    const ok = register(name, email, phone, password)
    setLoading(false)
    if (ok) {
      toast.success('Account created successfully!')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-12">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className="border-blue-100 shadow-xl shadow-blue-100/40">
          <CardHeader className="items-center text-center">
            <Logo />
            <div className="mt-2 space-y-1 text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Create Account
              </CardTitle>
              <CardDescription className="text-gray-500">
                Join the Mealicious family
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="reg-name"
                    placeholder="John Doe"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="reg-phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    +91
                  </span>
                  <Input
                    id="reg-phone"
                    type="tel"
                    placeholder="9876543210"
                    className="pl-[4.5rem]"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="reg-pw">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="reg-pw"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Strength indicator */}
                {password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i < pwStrength ? strengthColors[pwStrength] : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Password strength:{' '}
                      <span
                        className={
                          pwStrength >= 4
                            ? 'font-semibold text-orange-400'
                            : pwStrength >= 3
                              ? 'font-semibold text-yellow-600'
                              : pwStrength >= 2
                                ? 'font-semibold text-orange-400'
                                : 'font-semibold text-red-500'
                        }
                      >
                        {strengthLabels[pwStrength]}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="reg-confirm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="reg-confirm"
                    type={showConfirmPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPw.length > 0 && password !== confirmPw && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(v) => setAgreeTerms(v === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="cursor-pointer text-sm font-normal leading-snug text-gray-600">
                  I agree to the{' '}
                  <button
                    type="button"
                    className="text-orange-400 hover:text-orange-400 hover:underline"
                    onClick={() => navigate('terms')}
                  >
                    Terms & Conditions
                  </button>
                </Label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-orange-400 text-white hover:bg-orange-400"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account…
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">
                Or continue with
              </span>
            </div>

            {/* Social */}
            <SocialButtons />

            {/* Login link */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button
                type="button"
                className="font-semibold text-orange-400 hover:text-orange-400 hover:underline"
                onClick={() => navigate('login')}
              >
                Sign In
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
