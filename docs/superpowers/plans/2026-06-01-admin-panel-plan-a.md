# Admin Panel Plan A — Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the /admin route with session-cookie auth, sidebar layout, dashboard, products, orders, and customers pages.

**Architecture:** Separate Next.js App Router section at `src/app/admin/`. Middleware protects all `/admin/*` except `/admin/login`. Session stored as HttpOnly signed JWT cookie. Server components fetch data directly; client components handle forms/dialogs. Existing `/api/admin/*` routes reused unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma+PostgreSQL, Tailwind 4, shadcn/ui, recharts (already installed), jose (already installed), Bun

---

## File Map

**New files:**
- `src/middleware.ts` — protect /admin/* routes
- `src/lib/admin-session.ts` — sign/verify session JWT
- `src/app/api/admin/auth/login/route.ts` — POST login
- `src/app/api/admin/auth/logout/route.ts` — POST logout
- `src/app/admin/layout.tsx` — sidebar + header shell
- `src/app/admin/page.tsx` — redirect to /admin/dashboard
- `src/app/admin/login/page.tsx` — login form
- `src/app/admin/dashboard/page.tsx` — stats + charts
- `src/app/admin/products/page.tsx` — product list
- `src/app/admin/products/[id]/page.tsx` — create/edit product
- `src/app/admin/orders/page.tsx` — order list
- `src/app/admin/orders/[id]/page.tsx` — order detail
- `src/app/admin/customers/page.tsx` — customer list
- `src/components/admin/Sidebar.tsx` — sidebar nav
- `src/components/admin/AdminHeader.tsx` — top bar
- `src/components/admin/StatsCard.tsx` — KPI card
- `src/components/admin/RevenueChart.tsx` — recharts line chart
- `src/components/admin/OrdersDonut.tsx` — recharts pie chart
- `src/components/admin/ProductForm.tsx` — add/edit product dialog
- `src/components/admin/OrderStatusSelect.tsx` — inline status change

**Modified files:**
- `src/lib/auth-server.ts` — add `requireAdminSession` that reads cookie

---

## Task 1: Install @react-pdf/renderer + set env vars

**Files:**
- Modify: `package.json` (via bun add)
- Modify: `.env.local` (or `.env`)

- [ ] **Step 1: Add @react-pdf/renderer**

```bash
cd /var/www/Mealicious && bun add @react-pdf/renderer
```

Expected: package added, no errors.

- [ ] **Step 2: Add required env vars**

Add to `.env` (create if missing, do not overwrite existing vars):

```env
ADMIN_PASSWORD=Mealicious@Admin2026
ADMIN_SESSION_SECRET=mealicious_admin_secret_key_32chars_ok
GSTIN=YOUR_GSTIN_HERE
SELLER_STATE=Maharashtra
HSN_CODE=21069099
```

Replace `ADMIN_PASSWORD` and `GSTIN` with real values before production.

- [ ] **Step 3: Commit**

```bash
git add package.json bun.lockb
git commit -m "chore: add @react-pdf/renderer for GST invoice generation"
```

---

## Task 2: Session JWT utilities

**Files:**
- Create: `src/lib/admin-session.ts`
- Modify: `src/lib/auth-server.ts`

- [ ] **Step 1: Create admin-session.ts**

```typescript
// src/lib/admin-session.ts
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'admin-session'
const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET || 'fallback-secret-change-me-in-production'
)
const EXPIRY = '7d'

export interface AdminSession {
  email: string
}

export async function signSession(payload: AdminSession): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET)
}

export async function verifySession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    if (!payload.email) return null
    return { email: String(payload.email) }
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySession(token)
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export function getSessionFromRequest(req: NextRequest): Promise<AdminSession | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return Promise.resolve(null)
  return verifySession(token)
}
```

- [ ] **Step 2: Add requireAdminSession to auth-server.ts**

Append to end of `src/lib/auth-server.ts`:

```typescript
import { getSessionFromRequest } from './admin-session'

export async function requireAdminSession(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }
  return { session, error: null }
}
```

Also add the import at the top of auth-server.ts:
```typescript
import { NextRequest } from 'next/server'
```
(if not already present — check first)

- [ ] **Step 3: Commit**

```bash
git add src/lib/admin-session.ts src/lib/auth-server.ts
git commit -m "feat(admin): session JWT utilities for cookie-based auth"
```

---

## Task 3: Auth API routes (login + logout)

**Files:**
- Create: `src/app/api/admin/auth/login/route.ts`
- Create: `src/app/api/admin/auth/logout/route.ts`

- [ ] **Step 1: Create login route**

```typescript
// src/app/api/admin/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { signSession, setSessionCookie } from '@/lib/admin-session'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@mealicious.com')
  .toLowerCase().split(',').map(e => e.trim()).filter(Boolean)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (
    !email || !password ||
    !ADMIN_EMAILS.includes(email.toLowerCase()) ||
    password !== ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  const token = await signSession({ email: email.toLowerCase() })
  const res = NextResponse.json({ ok: true })
  setSessionCookie(res, token)
  return res
}
```

- [ ] **Step 2: Create logout route**

```typescript
// src/app/api/admin/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/admin-session'

export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  clearSessionCookie(res)
  return res
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/auth/
git commit -m "feat(admin): login/logout API routes with session cookie"
```

---

## Task 4: Next.js middleware

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create middleware**

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/admin-session'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/admin')) return NextResponse.next()
  if (pathname === '/admin/login') return NextResponse.next()

  const session = await getSessionFromRequest(req)
  if (!session) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 2: Verify middleware file is at src/middleware.ts (not src/app/)**

Next.js 16 expects middleware at project root `src/middleware.ts` or `middleware.ts`. Confirm path is correct.

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(admin): middleware protects /admin/* routes"
```

---

## Task 5: Admin layout + sidebar

**Files:**
- Create: `src/components/admin/Sidebar.tsx`
- Create: `src/components/admin/AdminHeader.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Create Sidebar component**

```tsx
// src/components/admin/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Boxes,
  Tag, ImageIcon, FileText, Star, MessageSquare, Mail, LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/subscribers', label: 'Subscribers', icon: Mail },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      <div className="px-6 py-5 border-b border-neutral-800">
        <span className="text-xl font-bold text-orange-400">Mealicious</span>
        <p className="text-xs text-neutral-500 mt-0.5">Admin Panel</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
              pathname.startsWith(href)
                ? 'bg-orange-500 text-white'
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-neutral-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Create AdminHeader**

```tsx
// src/components/admin/AdminHeader.tsx
import { getAdminSession } from '@/lib/admin-session'

export async function AdminHeader({ title }: { title: string }) {
  const session = await getAdminSession()
  return (
    <header className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-neutral-800">{title}</h1>
      <span className="text-sm text-neutral-500">{session?.email}</span>
    </header>
  )
}
```

- [ ] **Step 3: Create admin layout**

```tsx
// src/app/admin/layout.tsx
import { Sidebar } from '@/components/admin/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Create redirect page**

```tsx
// src/app/admin/page.tsx
import { redirect } from 'next/navigation'

export default function AdminRoot() {
  redirect('/admin/dashboard')
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/ src/app/admin/layout.tsx src/app/admin/page.tsx
git commit -m "feat(admin): sidebar layout shell"
```

---

## Task 6: Login page

**Files:**
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Create login page**

```tsx
// src/app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Login failed')
        return
      }
      router.push('/admin/dashboard')
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <span className="text-2xl font-bold text-orange-500">Mealicious</span>
          <CardTitle className="text-lg mt-2">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@mealicious.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Test login flow manually**

```bash
# Start dev server
bun run dev
```

Navigate to `http://localhost:3000/admin` — should redirect to `/admin/login`.
Enter credentials from `.env` → should redirect to `/admin/dashboard` (404 for now, that's fine).

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/login/
git commit -m "feat(admin): login page with session cookie auth"
```

---

## Task 7: Dashboard page

**Files:**
- Create: `src/app/admin/dashboard/page.tsx`
- Create: `src/components/admin/RevenueChart.tsx`
- Create: `src/components/admin/OrdersDonut.tsx`
- Create: `src/components/admin/StatsCard.tsx`

- [ ] **Step 1: Create StatsCard**

```tsx
// src/components/admin/StatsCard.tsx
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  sub?: string
  icon: LucideIcon
  iconColor?: string
}

export function StatsCard({ title, value, sub, icon: Icon, iconColor = 'text-orange-500' }: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-neutral-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
          </div>
          <Icon className={`h-8 w-8 ${iconColor} opacity-80`} />
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create RevenueChart**

```tsx
// src/components/admin/RevenueChart.tsx
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint { date: string; revenue: number }

export function RevenueChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: number) => [`₹${v.toFixed(2)}`, 'Revenue']} />
        <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 3: Create OrdersDonut**

```tsx
// src/components/admin/OrdersDonut.tsx
'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#06b6d4',
  delivered: '#22c55e',
  cancelled: '#ef4444',
}

interface Props { data: { status: string; count: number }[] }

export function OrdersDonut({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={60} outerRadius={90}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={COLORS[entry.status.toLowerCase()] || '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 4: Create dashboard page**

```tsx
// src/app/admin/dashboard/page.tsx
import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { StatsCard } from '@/components/admin/StatsCard'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { OrdersDonut } from '@/components/admin/OrdersDonut'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IndianRupee, Package, ShoppingCart, Users, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { subDays, format } from 'date-fns'

async function getDashboardData() {
  const [orders, products, users, messages] = await Promise.all([
    db.order.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } }),
    db.product.findMany(),
    db.user.findMany(),
    db.contactMessage.findMany({ where: { isRead: false } }),
  ])

  const revenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((s, o) => s + o.total, 0)

  const today = new Date()
  const revenueByDay = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, 29 - i)
    const dateStr = format(date, 'MMM d')
    const dayRevenue = orders
      .filter(o => {
        const d = new Date(o.createdAt)
        return d.toDateString() === date.toDateString() && o.paymentStatus === 'paid'
      })
      .reduce((s, o) => s + o.total, 0)
    return { date: dateStr, revenue: dayRevenue }
  })

  const statusCounts = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => ({
    status,
    count: orders.filter(o => o.status === status).length,
  })).filter(d => d.count > 0)

  const lowStock = products.filter(p => p.stock < p.lowStock).length

  return {
    revenue,
    orderCount: orders.length,
    productCount: products.length,
    userCount: users.length,
    unreadMessages: messages.length,
    lowStock,
    revenueByDay,
    statusCounts,
    recentOrders: orders.slice(0, 10).map(o => ({
      orderNumber: o.orderNumber,
      customer: o.user?.name ?? 'Guest',
      total: o.total,
      status: o.status,
      date: format(new Date(o.createdAt), 'dd MMM'),
    })),
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  return (
    <div>
      <AdminHeader title="Dashboard" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Revenue" value={`₹${data.revenue.toLocaleString('en-IN')}`} icon={IndianRupee} />
          <StatsCard title="Total Orders" value={data.orderCount} icon={ShoppingCart} iconColor="text-blue-500" />
          <StatsCard title="Products" value={data.productCount} icon={Package} iconColor="text-purple-500" />
          <StatsCard title="Customers" value={data.userCount} icon={Users} iconColor="text-green-500" />
        </div>

        {data.lowStock > 0 && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            <AlertTriangle className="h-4 w-4" />
            {data.lowStock} product{data.lowStock > 1 ? 's' : ''} below low-stock threshold
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Revenue (30 days)</CardTitle></CardHeader>
            <CardContent><RevenueChart data={data.revenueByDay} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Orders by Status</CardTitle></CardHeader>
            <CardContent><OrdersDonut data={data.statusCounts} /></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Recent Orders</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-neutral-500">
                  <th className="text-left py-2 font-medium">Order</th>
                  <th className="text-left py-2 font-medium">Customer</th>
                  <th className="text-left py-2 font-medium">Total</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map(o => (
                  <tr key={o.orderNumber} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{o.orderNumber}</td>
                    <td className="py-2">{o.customer}</td>
                    <td className="py-2">₹{o.total.toLocaleString('en-IN')}</td>
                    <td className="py-2"><Badge variant="outline">{o.status}</Badge></td>
                    <td className="py-2 text-neutral-500">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/dashboard/ src/components/admin/
git commit -m "feat(admin): dashboard with revenue chart and stats"
```

---

## Task 8: Products page

**Files:**
- Create: `src/app/admin/products/page.tsx`
- Create: `src/app/admin/products/[id]/page.tsx`
- Create: `src/components/admin/ProductForm.tsx`

- [ ] **Step 1: Create ProductForm dialog**

```tsx
// src/components/admin/ProductForm.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Category { id: string; name: string; slug: string }

interface ProductData {
  id?: string
  name: string
  slug: string
  description: string
  shortDesc: string
  price: number
  salePrice: number | null
  images: string
  categorySlug: string
  stock: number
  lowStock: number
  sku: string
  featured: boolean
  bestSeller: boolean
  isNew: boolean
  isActive: boolean
  tags: string
  variants: string
  nutrition: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  categories: Category[]
  initial?: Partial<ProductData>
}

const EMPTY: ProductData = {
  name: '', slug: '', description: '', shortDesc: '', price: 0, salePrice: null,
  images: '', categorySlug: '', stock: 100, lowStock: 10, sku: '',
  featured: false, bestSeller: false, isNew: false, isActive: true,
  tags: '', variants: '', nutrition: '',
}

export function ProductForm({ open, onClose, onSaved, categories, initial }: Props) {
  const [form, setForm] = useState<ProductData>({ ...EMPTY, ...initial })
  const [saving, setSaving] = useState(false)
  const isEdit = !!form.id

  function set(key: keyof ProductData, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'name' && !isEdit) {
      setForm(prev => ({
        ...prev,
        slug: String(value).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }))
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        stock: Number(form.stock),
        lowStock: Number(form.lowStock),
        images: JSON.stringify(form.images.split(',').map(s => s.trim()).filter(Boolean)),
        tags: JSON.stringify(form.tags.split(',').map(s => s.trim()).filter(Boolean)),
      }
      const url = isEdit ? `/api/admin/products/${form.id}` : '/api/admin/products'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      toast.success(isEdit ? 'Product updated' : 'Product created')
      onSaved()
      onClose()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'New Product'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={e => set('slug', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Short Description</Label>
            <Input value={form.shortDesc} onChange={e => set('shortDesc', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Price (₹)</Label>
              <Input type="number" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sale Price (₹)</Label>
              <Input type="number" value={form.salePrice ?? ''} onChange={e => set('salePrice', e.target.value || null)} />
            </div>
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={e => set('sku', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Stock</Label>
              <Input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Low Stock Threshold</Label>
              <Input type="number" value={form.lowStock} onChange={e => set('lowStock', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.categorySlug} onValueChange={v => set('categorySlug', v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Image URLs (comma-separated)</Label>
            <Input value={form.images} onChange={e => set('images', e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label>Tags (comma-separated)</Label>
            <Input value={form.tags} onChange={e => set('tags', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(['featured', 'bestSeller', 'isNew', 'isActive'] as const).map(key => (
              <div key={key} className="flex items-center justify-between border rounded-md px-3 py-2">
                <Label className="capitalize">{key === 'isActive' ? 'Active' : key === 'bestSeller' ? 'Best Seller' : key === 'isNew' ? 'New' : 'Featured'}</Label>
                <Switch checked={!!form[key]} onCheckedChange={v => set(key, v)} />
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Create products list page**

```tsx
// src/app/admin/products/page.tsx
import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ProductsClient } from './ProductsClient'

async function getData() {
  const [products, categories] = await Promise.all([
    db.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])
  return {
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDesc: p.shortDesc ?? '',
      price: p.price,
      salePrice: p.salePrice,
      images: (() => { try { const a = JSON.parse(p.images); return Array.isArray(a) ? a.join(', ') : p.images } catch { return p.images } })(),
      categorySlug: p.category?.slug ?? '',
      stock: p.stock,
      lowStock: p.lowStock,
      sku: p.sku ?? '',
      featured: p.featured,
      bestSeller: p.bestSeller,
      isNew: p.isNew,
      isActive: p.isActive,
      tags: (() => { try { const a = JSON.parse(p.tags ?? '[]'); return Array.isArray(a) ? a.join(', ') : '' } catch { return '' } })(),
      variants: p.variants ?? '',
      nutrition: p.nutrition ?? '',
      category: p.category?.name ?? '',
    })),
    categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
  }
}

export default async function ProductsPage() {
  const { products, categories } = await getData()
  return (
    <div>
      <AdminHeader title="Products" />
      <ProductsClient products={products} categories={categories} />
    </div>
  )
}
```

- [ ] **Step 3: Create ProductsClient**

Create `src/app/admin/products/ProductsClient.tsx`:

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProductForm } from '@/components/admin/ProductForm'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

interface Product {
  id: string; name: string; slug: string; description: string; shortDesc: string
  price: number; salePrice: number | null; images: string; categorySlug: string
  stock: number; lowStock: number; sku: string; featured: boolean; bestSeller: boolean
  isNew: boolean; isActive: boolean; tags: string; variants: string; nutrition: string; category: string
}
interface Category { id: string; name: string; slug: string }

export function ProductsClient({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Partial<Product> | undefined>()

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); startTransition(() => router.refresh()) }
    else toast.error('Failed to delete')
  }

  function openNew() { setEditing(undefined); setFormOpen(true) }
  function openEdit(p: Product) { setEditing(p); setFormOpen(true) }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input className="pl-9" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={openNew} className="bg-orange-500 hover:bg-orange-600"><Plus className="h-4 w-4 mr-1" />Add Product</Button>
      </div>

      <div className="border rounded-md bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Product</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Price</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.name}</div>
                  {p.sku && <div className="text-xs text-neutral-400">SKU: {p.sku}</div>}
                </td>
                <td className="px-4 py-3 text-neutral-600">{p.category}</td>
                <td className="px-4 py-3">
                  {p.salePrice ? (
                    <div>
                      <span className="font-medium text-orange-600">₹{p.salePrice}</span>
                      <span className="text-xs text-neutral-400 line-through ml-1">₹{p.price}</span>
                    </div>
                  ) : <span>₹{p.price}</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={p.stock < p.lowStock ? 'text-red-600 font-medium' : ''}>{p.stock}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.isActive ? 'default' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                </td>
                <td className="px-4 py-3 text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(p.id, p.name)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-neutral-400">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ProductForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(undefined) }}
        onSaved={() => startTransition(() => router.refresh())}
        categories={categories}
        initial={editing}
      />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/products/ src/components/admin/ProductForm.tsx
git commit -m "feat(admin): products management page with CRUD"
```

---

## Task 9: Orders page

**Files:**
- Create: `src/app/admin/orders/page.tsx`
- Create: `src/app/admin/orders/OrdersClient.tsx`
- Create: `src/app/admin/orders/[id]/page.tsx`

- [ ] **Step 1: Create orders page (server component)**

```tsx
// src/app/admin/orders/page.tsx
import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { OrdersClient } from './OrdersClient'
import { format } from 'date-fns'

async function getOrders() {
  const orders = await db.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return orders.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.user?.name ?? 'Guest',
    email: o.user?.email ?? '',
    items: o.items.length,
    total: o.total,
    subtotal: o.subtotal,
    shipping: o.shipping,
    tax: o.tax,
    discount: o.discount,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod ?? '',
    couponCode: o.couponCode ?? '',
    shippingAddr: (() => { try { return JSON.parse(o.shippingAddr) } catch { return {} } })(),
    itemDetails: o.items.map(i => ({
      name: i.name,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
      variant: i.variant ?? '',
      subtotal: i.subtotal,
    })),
    date: format(new Date(o.createdAt), 'dd MMM yyyy'),
  }))
}

export default async function OrdersPage() {
  const orders = await getOrders()
  return (
    <div>
      <AdminHeader title="Orders" />
      <OrdersClient orders={orders} />
    </div>
  )
}
```

- [ ] **Step 2: Create OrdersClient**

Create `src/app/admin/orders/OrdersClient.tsx`:

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Search, Eye, FileText } from 'lucide-react'
import Link from 'next/link'

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

interface OrderItem { name: string; image: string; price: number; quantity: number; variant: string; subtotal: number }
interface Order {
  id: string; orderNumber: string; customer: string; email: string; items: number
  total: number; subtotal: number; shipping: number; tax: number; discount: number
  status: string; paymentStatus: string; paymentMethod: string; couponCode: string
  shippingAddr: Record<string, string>; itemDetails: OrderItem[]; date: string
}

export function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewing, setViewing] = useState<Order | null>(null)

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) { toast.success('Status updated'); startTransition(() => router.refresh()) }
    else toast.error('Failed')
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input className="pl-9" placeholder="Search orders…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Order</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Items</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Total</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Payment</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{o.customer}</div>
                  <div className="text-xs text-neutral-400">{o.email}</div>
                </td>
                <td className="px-4 py-3">{o.items}</td>
                <td className="px-4 py-3 font-medium">₹{o.total.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">{o.paymentStatus}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                    <SelectTrigger className={`h-7 text-xs w-32 ${STATUS_COLORS[o.status] || ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.filter(s => s !== 'all').map(s => (
                        <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-neutral-500 text-xs">{o.date}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => setViewing(o)}><Eye className="h-4 w-4" /></Button>
                  <a href={`/api/admin/invoices/${o.id}`} target="_blank" rel="noreferrer">
                    <Button size="icon" variant="ghost"><FileText className="h-4 w-4" /></Button>
                  </a>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-neutral-400">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {viewing && (
        <Dialog open onOpenChange={() => setViewing(null)}>
          <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order {viewing.orderNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2 text-neutral-600">
                <div><span className="font-medium">Customer:</span> {viewing.customer}</div>
                <div><span className="font-medium">Email:</span> {viewing.email}</div>
                <div><span className="font-medium">Payment:</span> {viewing.paymentMethod || '-'}</div>
                <div><span className="font-medium">Coupon:</span> {viewing.couponCode || '-'}</div>
              </div>
              <div className="border rounded-md p-3 bg-neutral-50">
                <p className="font-medium mb-1">Shipping Address</p>
                <p className="text-neutral-600">{[viewing.shippingAddr.name, viewing.shippingAddr.address, viewing.shippingAddr.city, viewing.shippingAddr.state, viewing.shippingAddr.pincode].filter(Boolean).join(', ')}</p>
              </div>
              <div>
                <p className="font-medium mb-2">Items</p>
                {viewing.itemDetails.map((item, i) => (
                  <div key={i} className="flex justify-between py-1.5 border-b last:border-0">
                    <div>{item.name}{item.variant ? ` (${item.variant})` : ''} × {item.quantity}</div>
                    <div>₹{item.subtotal}</div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{viewing.subtotal}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>₹{viewing.shipping}</span></div>
                {viewing.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{viewing.discount}</span></div>}
                <div className="flex justify-between"><span>Tax</span><span>₹{viewing.tax}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{viewing.total}</span></div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/orders/
git commit -m "feat(admin): orders management page with status update and detail view"
```

---

## Task 10: Customers page

**Files:**
- Create: `src/app/admin/customers/page.tsx`
- Create: `src/app/admin/customers/CustomersClient.tsx`

- [ ] **Step 1: Create customers server page**

```tsx
// src/app/admin/customers/page.tsx
import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { CustomersClient } from './CustomersClient'
import { format } from 'date-fns'

async function getCustomers() {
  const users = await db.user.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? '',
    role: u.role,
    orderCount: u._count.orders,
    joined: format(new Date(u.createdAt), 'dd MMM yyyy'),
  }))
}

export default async function CustomersPage() {
  const customers = await getCustomers()
  return (
    <div>
      <AdminHeader title="Customers" />
      <CustomersClient customers={customers} />
    </div>
  )
}
```

- [ ] **Step 2: Create CustomersClient**

Create `src/app/admin/customers/CustomersClient.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

interface Customer {
  id: string; name: string; email: string; phone: string; role: string; orderCount: number; joined: string
}

export function CustomersClient({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState('')

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  return (
    <div className="p-6">
      <div className="relative w-72 mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input className="pl-9" placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="border rounded-md bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Orders</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-neutral-600">{c.email}</td>
                <td className="px-4 py-3 text-neutral-600">{c.phone || '-'}</td>
                <td className="px-4 py-3">{c.orderCount}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{c.role}</Badge>
                </td>
                <td className="px-4 py-3 text-neutral-500">{c.joined}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-neutral-400">No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/customers/
git commit -m "feat(admin): customers list page"
```

---

## Task 11: Verify Plan A works end-to-end

- [ ] **Step 1: Run dev server**

```bash
bun run dev 2>&1 | head -30
```

Expected: no compilation errors, server starts on port 3000.

- [ ] **Step 2: Test auth flow**

1. Open `http://localhost:3000/admin` → redirects to `/admin/login` ✓
2. Enter wrong creds → "Invalid credentials" toast ✓
3. Enter correct creds (from `.env`) → redirects to `/admin/dashboard` ✓
4. Dashboard loads with stats ✓
5. `/admin/products` shows product table ✓
6. Add product → saves → appears in list ✓
7. `/admin/orders` shows orders, status dropdown works ✓
8. `/admin/customers` shows customer list ✓
9. Logout → back to `/admin/login` ✓

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(admin): Plan A complete — auth, layout, dashboard, products, orders, customers"
```
