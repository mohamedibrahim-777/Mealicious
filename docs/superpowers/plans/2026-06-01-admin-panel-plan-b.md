# Admin Panel Plan B — Extended Features

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add inventory, coupons, banners, blog, reviews, and GST invoice PDF to the admin panel built in Plan A.

**Architecture:** Continues from Plan A. New API routes for models that lack admin endpoints (Coupon, Banner, BlogPost, Review). New pages at /admin/* following same server+client component pattern. GST invoice streamed as PDF from API route using @react-pdf/renderer.

**Prerequisite:** Plan A must be complete and working.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma+PostgreSQL, @react-pdf/renderer, Tailwind 4, shadcn/ui, Bun

---

## File Map

**New API routes:**
- `src/app/api/admin/coupons/route.ts`
- `src/app/api/admin/coupons/[id]/route.ts`
- `src/app/api/admin/banners/route.ts`
- `src/app/api/admin/banners/[id]/route.ts`
- `src/app/api/admin/blog/route.ts`
- `src/app/api/admin/blog/[id]/route.ts`
- `src/app/api/admin/inventory/route.ts`
- `src/app/api/admin/reviews/route.ts`
- `src/app/api/admin/invoices/[orderId]/route.ts`

**New pages:**
- `src/app/admin/inventory/page.tsx` + `InventoryClient.tsx`
- `src/app/admin/coupons/page.tsx` + `CouponsClient.tsx`
- `src/app/admin/banners/page.tsx` + `BannersClient.tsx`
- `src/app/admin/blog/page.tsx` + `BlogClient.tsx`
- `src/app/admin/blog/[id]/page.tsx` (editor)
- `src/app/admin/reviews/page.tsx` + `ReviewsClient.tsx`
- `src/app/admin/messages/page.tsx` + `MessagesClient.tsx`
- `src/app/admin/subscribers/page.tsx`

**New components:**
- `src/components/admin/GstInvoice.tsx` (react-pdf document)

---

## Task 1: API — Coupons CRUD

**Files:**
- Create: `src/app/api/admin/coupons/route.ts`
- Create: `src/app/api/admin/coupons/[id]/route.ts`

- [ ] **Step 1: Create coupons list + create route**

```typescript
// src/app/api/admin/coupons/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ coupons })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const body = await req.json()
  const coupon = await db.coupon.create({
    data: {
      code: String(body.code).toUpperCase(),
      type: body.type,
      value: Number(body.value),
      minOrder: Number(body.minOrder) || 0,
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null,
      usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
      validFrom: new Date(body.validFrom),
      validTo: new Date(body.validTo),
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json({ coupon }, { status: 201 })
}
```

- [ ] **Step 2: Create coupon update + delete route**

```typescript
// src/app/api/admin/coupons/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id } = await params
  const body = await req.json()
  const coupon = await db.coupon.update({
    where: { id },
    data: {
      ...(body.code !== undefined && { code: String(body.code).toUpperCase() }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.value !== undefined && { value: Number(body.value) }),
      ...(body.minOrder !== undefined && { minOrder: Number(body.minOrder) }),
      ...(body.maxDiscount !== undefined && { maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null }),
      ...(body.usageLimit !== undefined && { usageLimit: body.usageLimit ? Number(body.usageLimit) : null }),
      ...(body.validFrom !== undefined && { validFrom: new Date(body.validFrom) }),
      ...(body.validTo !== undefined && { validTo: new Date(body.validTo) }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
    },
  })
  return NextResponse.json({ coupon })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id } = await params
  await db.coupon.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/coupons/
git commit -m "feat(admin): coupons CRUD API"
```

---

## Task 2: API — Banners CRUD

**Files:**
- Create: `src/app/api/admin/banners/route.ts`
- Create: `src/app/api/admin/banners/[id]/route.ts`

- [ ] **Step 1: Create banners list + create route**

```typescript
// src/app/api/admin/banners/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const banners = await db.banner.findMany({ orderBy: { sortOrder: 'asc' } })
  return NextResponse.json({ banners })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const body = await req.json()
  const banner = await db.banner.create({
    data: {
      title: body.title,
      subtitle: body.subtitle ?? null,
      image: body.image ?? null,
      link: body.link ?? null,
      isActive: body.isActive ?? true,
      sortOrder: Number(body.sortOrder) || 0,
    },
  })
  return NextResponse.json({ banner }, { status: 201 })
}
```

- [ ] **Step 2: Create banner update + delete route**

```typescript
// src/app/api/admin/banners/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id } = await params
  const body = await req.json()
  const banner = await db.banner.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.link !== undefined && { link: body.link }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
    },
  })
  return NextResponse.json({ banner })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id } = await params
  await db.banner.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/banners/
git commit -m "feat(admin): banners CRUD API"
```

---

## Task 3: API — Blog CRUD

**Files:**
- Create: `src/app/api/admin/blog/route.ts`
- Create: `src/app/api/admin/blog/[id]/route.ts`

- [ ] **Step 1: Create blog list + create route**

```typescript
// src/app/api/admin/blog/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const posts = await db.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ posts })
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const body = await req.json()
  const slug = (body.slug || String(body.title || 'post').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')).slice(0, 100)
  const post = await db.blogPost.create({
    data: {
      title: body.title,
      slug,
      excerpt: body.excerpt ?? null,
      content: body.content ?? '',
      image: body.image ?? null,
      author: body.author ?? null,
      category: body.category ?? null,
      tags: body.tags ? JSON.stringify(body.tags) : null,
      published: body.published ?? false,
    },
  })
  return NextResponse.json({ post }, { status: 201 })
}
```

- [ ] **Step 2: Create blog update + delete route**

```typescript
// src/app/api/admin/blog/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id } = await params
  const post = await db.blogPost.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ post })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id } = await params
  const body = await req.json()
  const post = await db.blogPost.update({
    where: { id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.author !== undefined && { author: body.author }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.tags !== undefined && { tags: JSON.stringify(body.tags) }),
      ...(body.published !== undefined && { published: Boolean(body.published) }),
    },
  })
  return NextResponse.json({ post })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id } = await params
  await db.blogPost.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/blog/
git commit -m "feat(admin): blog CRUD API"
```

---

## Task 4: API — Inventory + Reviews

**Files:**
- Create: `src/app/api/admin/inventory/route.ts`
- Create: `src/app/api/admin/reviews/route.ts`

- [ ] **Step 1: Create inventory route**

```typescript
// src/app/api/admin/inventory/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { stock: 'asc' },
  })
  return NextResponse.json({
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku ?? '',
      category: p.category?.name ?? '',
      stock: p.stock,
      lowStock: p.lowStock,
      isActive: p.isActive,
    })),
  })
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const body = await req.json()
  // body.updates: [{ id: string, stock: number }]
  const updates: { id: string; stock: number }[] = body.updates ?? []
  await Promise.all(
    updates.map(u => db.product.update({ where: { id: u.id }, data: { stock: Number(u.stock) } }))
  )
  return NextResponse.json({ ok: true, updated: updates.length })
}
```

- [ ] **Step 2: Create reviews route**

```typescript
// src/app/api/admin/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const url = new URL(req.url)
  const approved = url.searchParams.get('approved')
  const reviews = await db.review.findMany({
    where: approved !== null ? { approved: approved === 'true' } : undefined,
    include: { user: true, product: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({
    reviews: reviews.map(r => ({
      id: r.id,
      user: r.user?.name ?? 'Unknown',
      product: r.product?.name ?? 'Unknown',
      rating: r.rating,
      title: r.title ?? '',
      comment: r.comment,
      approved: r.approved,
      createdAt: r.createdAt.toISOString().slice(0, 10),
    })),
  })
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id, approved } = await req.json()
  const review = await db.review.update({ where: { id }, data: { approved: Boolean(approved) } })
  return NextResponse.json({ review })
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const { id } = await req.json()
  await db.review.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/inventory/ src/app/api/admin/reviews/
git commit -m "feat(admin): inventory bulk update + reviews moderation API"
```

---

## Task 5: GST Invoice PDF API

**Files:**
- Create: `src/components/admin/GstInvoice.tsx`
- Create: `src/app/api/admin/invoices/[orderId]/route.ts`

- [ ] **Step 1: Create GstInvoice react-pdf document**

```tsx
// src/components/admin/GstInvoice.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, padding: 30, color: '#1a1a1a' },
  header: { marginBottom: 20, borderBottom: '1px solid #e5e7eb', paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#f97316', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#6b7280' },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 6, color: '#374151' },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: 100, color: '#6b7280' },
  value: { flex: 1 },
  table: { marginTop: 8 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: '6 4', borderRadius: 2 },
  tableRow: { flexDirection: 'row', padding: '5 4', borderBottom: '0.5px solid #e5e7eb' },
  col1: { flex: 3 },
  col2: { width: 40, textAlign: 'center' },
  col3: { width: 55, textAlign: 'right' },
  col4: { width: 55, textAlign: 'right' },
  col5: { width: 65, textAlign: 'right' },
  totalsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, padding: '3 4' },
  totalsLabel: { width: 100, textAlign: 'right', color: '#6b7280' },
  totalsValue: { width: 65, textAlign: 'right' },
  grandTotal: { borderTop: '1.5px solid #1a1a1a', paddingTop: 4, fontWeight: 'bold', fontSize: 10 },
  footer: { marginTop: 20, borderTop: '0.5px solid #e5e7eb', paddingTop: 10, color: '#9ca3af', fontSize: 8 },
})

interface LineItem {
  name: string
  hsnCode: string
  quantity: number
  unitPrice: number
  taxableValue: number
}

interface InvoiceProps {
  invoiceNumber: string
  invoiceDate: string
  seller: { name: string; address: string; gstin: string; state: string }
  buyer: { name: string; address: string; state: string; phone?: string }
  items: LineItem[]
  subtotal: number
  shipping: number
  discount: number
  taxAmount: number
  isInterState: boolean
  total: number
  paymentMethod: string
}

export function GstInvoiceDoc({
  invoiceNumber, invoiceDate, seller, buyer, items,
  subtotal, shipping, discount, taxAmount, isInterState, total, paymentMethod,
}: InvoiceProps) {
  const taxLabel = isInterState ? 'IGST (18%)' : 'CGST (9%) + SGST (9%)'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>TAX INVOICE</Text>
          <Text style={styles.subtitle}>GSTIN: {seller.gstin}</Text>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Seller</Text>
            <Text style={{ fontWeight: 'bold' }}>{seller.name}</Text>
            <Text style={{ color: '#6b7280', marginTop: 2 }}>{seller.address}</Text>
            <Text style={{ color: '#6b7280' }}>State: {seller.state}</Text>
            <Text style={{ color: '#6b7280' }}>GSTIN: {seller.gstin}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={{ fontWeight: 'bold' }}>{buyer.name}</Text>
            <Text style={{ color: '#6b7280', marginTop: 2 }}>{buyer.address}</Text>
            <Text style={{ color: '#6b7280' }}>State: {buyer.state}</Text>
            {buyer.phone && <Text style={{ color: '#6b7280' }}>Phone: {buyer.phone}</Text>}
          </View>
          <View style={{ width: 130 }}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Invoice No:</Text>
              <Text style={styles.value}>{invoiceNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{invoiceDate}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Payment:</Text>
              <Text style={styles.value}>{paymentMethod}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Item Description</Text>
            <Text style={styles.col2}>HSN</Text>
            <Text style={styles.col2}>Qty</Text>
            <Text style={styles.col3}>Unit Price</Text>
            <Text style={styles.col4}>Taxable Value</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>{item.name}</Text>
              <Text style={styles.col2}>{item.hsnCode}</Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>₹{item.unitPrice.toFixed(2)}</Text>
              <Text style={styles.col4}>₹{item.taxableValue.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 10 }}>
          {[
            { label: 'Subtotal', value: subtotal },
            { label: 'Shipping', value: shipping },
            ...(discount > 0 ? [{ label: 'Discount', value: -discount }] : []),
            { label: taxLabel, value: taxAmount },
          ].map(({ label, value }, i) => (
            <View key={i} style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>{label}</Text>
              <Text style={styles.totalsValue}>₹{value.toFixed(2)}</Text>
            </View>
          ))}
          <View style={[styles.totalsRow, styles.grandTotal]}>
            <Text style={styles.totalsLabel}>Grand Total</Text>
            <Text style={styles.totalsValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>This is a computer-generated invoice and does not require a signature.</Text>
          <Text style={{ marginTop: 4 }}>Thank you for shopping with Mealicious!</Text>
        </View>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 2: Create invoice API route**

```typescript
// src/app/api/admin/invoices/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'
import { renderToBuffer } from '@react-pdf/renderer'
import { GstInvoiceDoc } from '@/components/admin/GstInvoice'
import { createElement } from 'react'
import { format } from 'date-fns'

const GSTIN = process.env.GSTIN || 'YOUR_GSTIN'
const SELLER_STATE = process.env.SELLER_STATE || 'Maharashtra'
const HSN_CODE = process.env.HSN_CODE || '21069099'
const SELLER_NAME = process.env.SELLER_NAME || 'Mealicious'
const SELLER_ADDRESS = process.env.SELLER_ADDRESS || 'India'

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  const { error } = await requireAdminSession(req)
  if (error) return error

  const { orderId } = await params
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { user: true, items: true },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let shippingAddr: Record<string, string> = {}
  try { shippingAddr = JSON.parse(order.shippingAddr) } catch {}

  const buyerState = String(shippingAddr.state || '').trim()
  const isInterState = buyerState.toLowerCase() !== SELLER_STATE.toLowerCase()
  const taxRate = 0.18

  const items = order.items.map(item => {
    const taxableValue = item.price * item.quantity
    return {
      name: item.name + (item.variant ? ` (${item.variant})` : ''),
      hsnCode: HSN_CODE,
      quantity: item.quantity,
      unitPrice: item.price,
      taxableValue,
    }
  })

  const taxableBase = order.subtotal - order.discount + order.shipping
  const taxAmount = Math.round(taxableBase * taxRate * 100) / 100

  const doc = createElement(GstInvoiceDoc, {
    invoiceNumber: order.orderNumber,
    invoiceDate: format(new Date(order.createdAt), 'dd MMM yyyy'),
    seller: { name: SELLER_NAME, address: SELLER_ADDRESS, gstin: GSTIN, state: SELLER_STATE },
    buyer: {
      name: order.user?.name ?? shippingAddr.name ?? 'Customer',
      address: [shippingAddr.address, shippingAddr.city, shippingAddr.pincode].filter(Boolean).join(', '),
      state: buyerState || 'Unknown',
      phone: order.user?.phone ?? shippingAddr.phone,
    },
    items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount,
    taxAmount,
    isInterState,
    total: order.total,
    paymentMethod: order.paymentMethod ?? 'N/A',
  })

  const buffer = await renderToBuffer(doc)

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${order.orderNumber}.pdf"`,
    },
  })
}
```

- [ ] **Step 3: Add SELLER_NAME and SELLER_ADDRESS to .env**

```env
SELLER_NAME=Mealicious Store
SELLER_ADDRESS=Your full business address, City, State, PIN
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/GstInvoice.tsx src/app/api/admin/invoices/
git commit -m "feat(admin): GST invoice PDF generation API"
```

---

## Task 6: Inventory page

**Files:**
- Create: `src/app/admin/inventory/page.tsx`
- Create: `src/app/admin/inventory/InventoryClient.tsx`

- [ ] **Step 1: Create inventory server page**

```tsx
// src/app/admin/inventory/page.tsx
import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { InventoryClient } from './InventoryClient'

async function getInventory() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { stock: 'asc' },
  })
  return products.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku ?? '',
    category: p.category?.name ?? '',
    stock: p.stock,
    lowStock: p.lowStock,
    isActive: p.isActive,
  }))
}

export default async function InventoryPage() {
  const products = await getInventory()
  return (
    <div>
      <AdminHeader title="Inventory" />
      <InventoryClient products={products} />
    </div>
  )
}
```

- [ ] **Step 2: Create InventoryClient**

Create `src/app/admin/inventory/InventoryClient.tsx`:

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Save, AlertTriangle } from 'lucide-react'

interface Product { id: string; name: string; sku: string; category: string; stock: number; lowStock: number; isActive: boolean }

export function InventoryClient({ products }: { products: Product[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [edits, setEdits] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  const lowStockCount = products.filter(p => p.stock < p.lowStock).length

  function setStock(id: string, val: string) {
    setEdits(prev => ({ ...prev, [id]: Number(val) }))
  }

  function getStock(p: Product): number {
    return edits[p.id] !== undefined ? edits[p.id] : p.stock
  }

  async function saveAll() {
    const updates = Object.entries(edits).map(([id, stock]) => ({ id, stock }))
    if (updates.length === 0) { toast.info('No changes'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success(`Updated ${updates.length} product${updates.length > 1 ? 's' : ''}`)
      setEdits({})
      startTransition(() => router.refresh())
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  function exportCsv() {
    const rows = [['Name', 'SKU', 'Category', 'Stock', 'Low Stock Threshold', 'Status']]
    products.forEach(p => rows.push([p.name, p.sku, p.category, String(getStock(p)), String(p.lowStock), p.isActive ? 'Active' : 'Inactive']))
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'inventory.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6">
      {lowStockCount > 0 && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          <AlertTriangle className="h-4 w-4" />
          {lowStockCount} product{lowStockCount > 1 ? 's' : ''} below low-stock threshold
        </div>
      )}
      <div className="flex justify-between mb-4">
        <p className="text-sm text-neutral-500">{Object.keys(edits).length} unsaved change{Object.keys(edits).length !== 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>
          <Button size="sm" onClick={saveAll} disabled={saving || Object.keys(edits).length === 0} className="bg-orange-500 hover:bg-orange-600">
            <Save className="h-3.5 w-3.5 mr-1" />{saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
      <div className="border rounded-md bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Product</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">SKU</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Stock</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Threshold</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const stock = getStock(p)
              const isLow = stock < p.lowStock
              const changed = edits[p.id] !== undefined
              return (
                <tr key={p.id} className={`border-b last:border-0 ${changed ? 'bg-orange-50' : 'hover:bg-neutral-50'}`}>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs font-mono">{p.sku || '-'}</td>
                  <td className="px-4 py-3 text-neutral-600">{p.category}</td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      className={`h-7 w-20 text-sm ${isLow ? 'border-red-400 text-red-600' : ''}`}
                      value={stock}
                      min={0}
                      onChange={e => setStock(p.id, e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{p.lowStock}</td>
                  <td className="px-4 py-3">
                    {isLow
                      ? <Badge className="bg-red-100 text-red-700 border-red-200">Low Stock</Badge>
                      : <Badge variant="outline" className="text-green-600">OK</Badge>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/inventory/
git commit -m "feat(admin): inventory management with inline edit and CSV export"
```

---

## Task 7: Coupons page

**Files:**
- Create: `src/app/admin/coupons/page.tsx`
- Create: `src/app/admin/coupons/CouponsClient.tsx`

- [ ] **Step 1: Create coupons server page**

```tsx
// src/app/admin/coupons/page.tsx
import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { CouponsClient } from './CouponsClient'
import { format } from 'date-fns'

async function getCoupons() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return coupons.map(c => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: c.value,
    minOrder: c.minOrder,
    maxDiscount: c.maxDiscount,
    usageLimit: c.usageLimit,
    usedCount: c.usedCount,
    validFrom: c.validFrom.toISOString().slice(0, 10),
    validTo: c.validTo.toISOString().slice(0, 10),
    isActive: c.isActive,
    validFromDisplay: format(new Date(c.validFrom), 'dd MMM yyyy'),
    validToDisplay: format(new Date(c.validTo), 'dd MMM yyyy'),
  }))
}

export default async function CouponsPage() {
  const coupons = await getCoupons()
  return (
    <div>
      <AdminHeader title="Coupons" />
      <CouponsClient coupons={coupons} />
    </div>
  )
}
```

- [ ] **Step 2: Create CouponsClient**

Create `src/app/admin/coupons/CouponsClient.tsx`:

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Coupon {
  id: string; code: string; type: string; value: number; minOrder: number
  maxDiscount: number | null; usageLimit: number | null; usedCount: number
  validFrom: string; validTo: string; isActive: boolean
  validFromDisplay: string; validToDisplay: string
}

const EMPTY = {
  code: '', type: 'percentage', value: 10, minOrder: 0,
  maxDiscount: '', usageLimit: '', validFrom: '', validTo: '', isActive: true,
}

export function CouponsClient({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function openNew() { setForm(EMPTY); setEditing(null); setOpen(true) }
  function openEdit(c: Coupon) {
    setForm({ code: c.code, type: c.type, value: c.value, minOrder: c.minOrder, maxDiscount: c.maxDiscount?.toString() ?? '', usageLimit: c.usageLimit?.toString() ?? '', validFrom: c.validFrom, validTo: c.validTo, isActive: c.isActive })
    setEditing(c.id)
    setOpen(true)
  }

  function set(key: string, value: unknown) { setForm(prev => ({ ...prev, [key]: value })) }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = { ...form, value: Number(form.value), minOrder: Number(form.minOrder), maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null, usageLimit: form.usageLimit ? Number(form.usageLimit) : null }
      const url = editing ? `/api/admin/coupons/${editing}` : '/api/admin/coupons'
      const res = await fetch(url, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success(editing ? 'Coupon updated' : 'Coupon created')
      setOpen(false)
      startTransition(() => router.refresh())
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); startTransition(() => router.refresh()) }
    else toast.error('Failed')
  }

  async function toggleActive(c: Coupon) {
    await fetch(`/api/admin/coupons/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !c.isActive }) })
    startTransition(() => router.refresh())
  }

  return (
    <div className="p-6">
      <div className="flex justify-end mb-4">
        <Button onClick={openNew} className="bg-orange-500 hover:bg-orange-600"><Plus className="h-4 w-4 mr-1" />New Coupon</Button>
      </div>
      <div className="border rounded-md bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Code</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Value</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Min Order</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Usage</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Valid Until</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Active</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                <td className="px-4 py-3 capitalize">{c.type}</td>
                <td className="px-4 py-3">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                <td className="px-4 py-3">₹{c.minOrder}</td>
                <td className="px-4 py-3">{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                <td className="px-4 py-3">{c.validToDisplay}</td>
                <td className="px-4 py-3"><Switch checked={c.isActive} onCheckedChange={() => toggleActive(c)} /></td>
                <td className="px-4 py-3 text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(c.id, c.code)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-neutral-400">No coupons yet</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={v => !v && setOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Coupon' : 'New Coupon'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5"><Label>Code</Label><Input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="SAVE10" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => set('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed ₹</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Value</Label><Input type="number" value={form.value} onChange={e => set('value', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Min Order (₹)</Label><Input type="number" value={form.minOrder} onChange={e => set('minOrder', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Max Discount (₹)</Label><Input type="number" value={form.maxDiscount} onChange={e => set('maxDiscount', e.target.value)} placeholder="Optional" /></div>
            </div>
            <div className="space-y-1.5"><Label>Usage Limit</Label><Input type="number" value={form.usageLimit} onChange={e => set('usageLimit', e.target.value)} placeholder="Unlimited" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Valid From</Label><Input type="date" value={form.validFrom} onChange={e => set('validFrom', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Valid To</Label><Input type="date" value={form.validTo} onChange={e => set('validTo', e.target.value)} /></div>
            </div>
            <div className="flex items-center justify-between border rounded-md px-3 py-2">
              <Label>Active</Label>
              <Switch checked={form.isActive} onCheckedChange={v => set('isActive', v)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/coupons/
git commit -m "feat(admin): coupons management page"
```

---

## Task 8: Banners page

**Files:**
- Create: `src/app/admin/banners/page.tsx`
- Create: `src/app/admin/banners/BannersClient.tsx`

- [ ] **Step 1: Create banners server page**

```tsx
// src/app/admin/banners/page.tsx
import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { BannersClient } from './BannersClient'

export default async function BannersPage() {
  const banners = await db.banner.findMany({ orderBy: { sortOrder: 'asc' } })
  return (
    <div>
      <AdminHeader title="Banners" />
      <BannersClient banners={banners.map(b => ({ id: b.id, title: b.title, subtitle: b.subtitle ?? '', image: b.image ?? '', link: b.link ?? '', sortOrder: b.sortOrder, isActive: b.isActive }))} />
    </div>
  )
}
```

- [ ] **Step 2: Create BannersClient**

Create `src/app/admin/banners/BannersClient.tsx`:

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

interface Banner { id: string; title: string; subtitle: string; image: string; link: string; sortOrder: number; isActive: boolean }

const EMPTY = { title: '', subtitle: '', image: '', link: '', sortOrder: 0, isActive: true }

export function BannersClient({ banners }: { banners: Banner[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function set(key: string, value: unknown) { setForm(prev => ({ ...prev, [key]: value })) }
  function openNew() { setForm(EMPTY); setEditing(null); setOpen(true) }
  function openEdit(b: Banner) { setForm({ title: b.title, subtitle: b.subtitle, image: b.image, link: b.link, sortOrder: b.sortOrder, isActive: b.isActive }); setEditing(b.id); setOpen(true) }

  async function handleSave() {
    setSaving(true)
    try {
      const url = editing ? `/api/admin/banners/${editing}` : '/api/admin/banners'
      const res = await fetch(url, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success(editing ? 'Banner updated' : 'Banner created')
      setOpen(false)
      startTransition(() => router.refresh())
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this banner?')) return
    const res = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); startTransition(() => router.refresh()) }
    else toast.error('Failed')
  }

  async function changeOrder(b: Banner, dir: -1 | 1) {
    await fetch(`/api/admin/banners/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: b.sortOrder + dir }) })
    startTransition(() => router.refresh())
  }

  async function toggleActive(b: Banner) {
    await fetch(`/api/admin/banners/${b.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !b.isActive }) })
    startTransition(() => router.refresh())
  }

  return (
    <div className="p-6">
      <div className="flex justify-end mb-4">
        <Button onClick={openNew} className="bg-orange-500 hover:bg-orange-600"><Plus className="h-4 w-4 mr-1" />New Banner</Button>
      </div>
      <div className="space-y-3">
        {banners.map(b => (
          <div key={b.id} className="border rounded-md bg-white p-4 flex items-center gap-4">
            {b.image && <img src={b.image} alt={b.title} className="h-16 w-24 object-cover rounded" />}
            <div className="flex-1">
              <p className="font-medium">{b.title}</p>
              {b.subtitle && <p className="text-sm text-neutral-500">{b.subtitle}</p>}
              {b.link && <p className="text-xs text-blue-500">{b.link}</p>}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => changeOrder(b, -1)}><ChevronUp className="h-3 w-3" /></Button>
                <span className="text-xs text-center text-neutral-400">{b.sortOrder}</span>
                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => changeOrder(b, 1)}><ChevronDown className="h-3 w-3" /></Button>
              </div>
              <Switch checked={b.isActive} onCheckedChange={() => toggleActive(b)} />
              <Button size="icon" variant="ghost" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {banners.length === 0 && <div className="text-center py-10 text-neutral-400 border rounded-md bg-white">No banners yet</div>}
      </div>

      <Dialog open={open} onOpenChange={v => !v && setOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Banner' : 'New Banner'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={e => set('title', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Subtitle</Label><Input value={form.subtitle} onChange={e => set('subtitle', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Image URL</Label><Input value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..." /></div>
            <div className="space-y-1.5"><Label>Link URL</Label><Input value={form.link} onChange={e => set('link', e.target.value)} placeholder="/shop or https://..." /></div>
            <div className="space-y-1.5"><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => set('sortOrder', e.target.value)} /></div>
            <div className="flex items-center justify-between border rounded-md px-3 py-2"><Label>Active</Label><Switch checked={form.isActive} onCheckedChange={v => set('isActive', v)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/banners/
git commit -m "feat(admin): banners management page"
```

---

## Task 9: Blog management pages

**Files:**
- Create: `src/app/admin/blog/page.tsx`
- Create: `src/app/admin/blog/BlogClient.tsx`
- Create: `src/app/admin/blog/[id]/page.tsx`

- [ ] **Step 1: Create blog list server page**

```tsx
// src/app/admin/blog/page.tsx
import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { BlogClient } from './BlogClient'
import { format } from 'date-fns'

export default async function BlogPage() {
  const posts = await db.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div>
      <AdminHeader title="Blog" />
      <BlogClient posts={posts.map(p => ({ id: p.id, title: p.title, slug: p.slug, category: p.category ?? '', published: p.published, date: format(new Date(p.createdAt), 'dd MMM yyyy') }))} />
    </div>
  )
}
```

- [ ] **Step 2: Create BlogClient**

Create `src/app/admin/blog/BlogClient.tsx`:

```tsx
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Post { id: string; title: string; slug: string; category: string; published: boolean; date: string }

export function BlogClient({ posts }: { posts: Post[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return
    const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Post deleted'); startTransition(() => router.refresh()) }
    else toast.error('Failed')
  }

  return (
    <div className="p-6">
      <div className="flex justify-end mb-4">
        <Link href="/admin/blog/new">
          <Button className="bg-orange-500 hover:bg-orange-600"><Plus className="h-4 w-4 mr-1" />New Post</Button>
        </Link>
      </div>
      <div className="border rounded-md bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-neutral-500">{p.category || '-'}</td>
                <td className="px-4 py-3"><Badge variant={p.published ? 'default' : 'secondary'}>{p.published ? 'Published' : 'Draft'}</Badge></td>
                <td className="px-4 py-3 text-neutral-500">{p.date}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  <Link href={`/admin/blog/${p.id}`}><Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button></Link>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(p.id, p.title)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-neutral-400">No posts yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create blog post editor page**

```tsx
// src/app/admin/blog/[id]/page.tsx
import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { BlogEditor } from './BlogEditor'

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = id === 'new' ? null : await db.blogPost.findUnique({ where: { id } })
  return (
    <div>
      <AdminHeader title={id === 'new' ? 'New Post' : 'Edit Post'} />
      <BlogEditor
        id={id === 'new' ? null : id}
        initial={post ? {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? '',
          content: post.content,
          image: post.image ?? '',
          author: post.author ?? '',
          category: post.category ?? '',
          tags: (() => { try { const a = JSON.parse(post.tags ?? '[]'); return Array.isArray(a) ? a.join(', ') : '' } catch { return '' } })(),
          published: post.published,
        } : undefined}
      />
    </div>
  )
}
```

- [ ] **Step 4: Create BlogEditor**

Create `src/app/admin/blog/[id]/BlogEditor.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PostForm {
  title: string; slug: string; excerpt: string; content: string
  image: string; author: string; category: string; tags: string; published: boolean
}

const EMPTY: PostForm = { title: '', slug: '', excerpt: '', content: '', image: '', author: '', category: '', tags: '', published: false }

export function BlogEditor({ id, initial }: { id: string | null; initial?: Partial<PostForm> }) {
  const router = useRouter()
  const [form, setForm] = useState<PostForm>({ ...EMPTY, ...initial })
  const [saving, setSaving] = useState(false)

  function set(key: keyof PostForm, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'title' && !id) {
      setForm(prev => ({ ...prev, slug: String(value).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }
      const url = id ? `/api/admin/blog/${id}` : '/api/admin/blog'
      const res = await fetch(url, { method: id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success(id ? 'Post updated' : 'Post created')
      router.push('/admin/blog')
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-3xl">
      <Link href="/admin/blog" className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-800 mb-6">
        <ArrowLeft className="h-3.5 w-3.5 mr-1" />Back to posts
      </Link>
      <div className="space-y-4">
        <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={e => set('title', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Slug</Label><Input value={form.slug} onChange={e => set('slug', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Author</Label><Input value={form.author} onChange={e => set('author', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Category</Label><Input value={form.category} onChange={e => set('category', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={e => set('tags', e.target.value)} /></div>
        </div>
        <div className="space-y-1.5"><Label>Cover Image URL</Label><Input value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..." /></div>
        <div className="space-y-1.5"><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={2} /></div>
        <div className="space-y-1.5">
          <Label>Content (Markdown)</Label>
          <Textarea value={form.content} onChange={e => set('content', e.target.value)} rows={20} className="font-mono text-sm" placeholder="Write your post in Markdown..." />
        </div>
        <div className="flex items-center justify-between border rounded-md px-3 py-2">
          <Label>Published</Label>
          <Switch checked={form.published} onCheckedChange={v => set('published', v)} />
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
          <Save className="h-4 w-4 mr-1" />{saving ? 'Saving…' : 'Save Post'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/blog/
git commit -m "feat(admin): blog management with list and editor"
```

---

## Task 10: Reviews page

**Files:**
- Create: `src/app/admin/reviews/page.tsx`
- Create: `src/app/admin/reviews/ReviewsClient.tsx`

- [ ] **Step 1: Create reviews server page**

```tsx
// src/app/admin/reviews/page.tsx
import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ReviewsClient } from './ReviewsClient'
import { format } from 'date-fns'

export default async function ReviewsPage() {
  const reviews = await db.review.findMany({
    include: { user: true, product: true },
    orderBy: { createdAt: 'desc' },
  })
  return (
    <div>
      <AdminHeader title="Reviews" />
      <ReviewsClient reviews={reviews.map(r => ({
        id: r.id,
        user: r.user?.name ?? 'Unknown',
        product: r.product?.name ?? 'Unknown',
        rating: r.rating,
        title: r.title ?? '',
        comment: r.comment,
        approved: r.approved,
        date: format(new Date(r.createdAt), 'dd MMM yyyy'),
      }))} />
    </div>
  )
}
```

- [ ] **Step 2: Create ReviewsClient**

Create `src/app/admin/reviews/ReviewsClient.tsx`:

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Check, X, Star } from 'lucide-react'

interface Review { id: string; user: string; product: string; rating: number; title: string; comment: string; approved: boolean; date: string }

export function ReviewsClient({ reviews }: { reviews: Review[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')

  const filtered = reviews.filter(r => {
    if (filter === 'pending') return !r.approved
    if (filter === 'approved') return r.approved
    return true
  })

  async function setApproved(id: string, approved: boolean) {
    const res = await fetch('/api/admin/reviews', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, approved }) })
    if (res.ok) { toast.success(approved ? 'Approved' : 'Rejected'); startTransition(() => router.refresh()) }
    else toast.error('Failed')
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this review?')) return
    const res = await fetch('/api/admin/reviews', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { toast.success('Deleted'); startTransition(() => router.refresh()) }
    else toast.error('Failed')
  }

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'approved'] as const).map(f => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize">
            {f} {f === 'pending' ? `(${reviews.filter(r => !r.approved).length})` : ''}
          </Button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(r => (
          <div key={r.id} className="border rounded-md bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{r.user}</span>
                  <span className="text-neutral-400">on</span>
                  <span className="text-neutral-600">{r.product}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200'}`} />
                    ))}
                  </div>
                </div>
                {r.title && <p className="font-medium text-sm">{r.title}</p>}
                <p className="text-sm text-neutral-600 mt-0.5">{r.comment}</p>
                <p className="text-xs text-neutral-400 mt-1">{r.date}</p>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Badge variant={r.approved ? 'default' : 'secondary'}>{r.approved ? 'Approved' : 'Pending'}</Badge>
                {!r.approved && (
                  <Button size="icon" variant="ghost" className="text-green-600 h-7 w-7" onClick={() => setApproved(r.id, true)}><Check className="h-4 w-4" /></Button>
                )}
                {r.approved && (
                  <Button size="icon" variant="ghost" className="text-yellow-600 h-7 w-7" onClick={() => setApproved(r.id, false)}><X className="h-4 w-4" /></Button>
                )}
                <Button size="icon" variant="ghost" className="text-red-500 h-7 w-7" onClick={() => handleDelete(r.id)}><X className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-10 text-neutral-400 border rounded-md bg-white">No reviews</div>}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/reviews/
git commit -m "feat(admin): reviews moderation page"
```

---

## Task 11: Messages + Subscribers pages

**Files:**
- Create: `src/app/admin/messages/page.tsx`
- Create: `src/app/admin/messages/MessagesClient.tsx`
- Create: `src/app/admin/subscribers/page.tsx`

- [ ] **Step 1: Create messages page**

```tsx
// src/app/admin/messages/page.tsx
import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { MessagesClient } from './MessagesClient'
import { format } from 'date-fns'

export default async function MessagesPage() {
  const messages = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div>
      <AdminHeader title="Messages" />
      <MessagesClient messages={messages.map(m => ({ id: m.id, name: m.name, email: m.email, phone: m.phone ?? '', subject: m.subject, message: m.message, isRead: m.isRead, date: format(new Date(m.createdAt), 'dd MMM yyyy') }))} />
    </div>
  )
}
```

- [ ] **Step 2: Create MessagesClient**

Create `src/app/admin/messages/MessagesClient.tsx`:

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Eye } from 'lucide-react'

interface Message { id: string; name: string; email: string; phone: string; subject: string; message: string; isRead: boolean; date: string }

export function MessagesClient({ messages }: { messages: Message[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [viewing, setViewing] = useState<Message | null>(null)

  async function markRead(id: string) {
    await fetch(`/api/admin/messages/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isRead: true }) })
    startTransition(() => router.refresh())
  }

  function viewMessage(m: Message) {
    setViewing(m)
    if (!m.isRead) markRead(m.id)
  }

  return (
    <div className="p-6">
      <div className="border rounded-md bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">From</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Subject</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">View</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(m => (
              <tr key={m.id} className={`border-b last:border-0 hover:bg-neutral-50 ${!m.isRead ? 'font-medium' : ''}`}>
                <td className="px-4 py-3">
                  <div>{m.name} {!m.isRead && <Badge className="ml-1 h-4 text-xs bg-orange-500">New</Badge>}</div>
                  <div className="text-xs text-neutral-400">{m.email}</div>
                </td>
                <td className="px-4 py-3">{m.subject}</td>
                <td className="px-4 py-3 text-neutral-500">{m.date}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => viewMessage(m)}><Eye className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {messages.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-neutral-400">No messages</td></tr>}
          </tbody>
        </table>
      </div>
      {viewing && (
        <Dialog open onOpenChange={() => setViewing(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{viewing.subject}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-neutral-600">
                <div><span className="font-medium">From:</span> {viewing.name}</div>
                <div><span className="font-medium">Email:</span> {viewing.email}</div>
                {viewing.phone && <div><span className="font-medium">Phone:</span> {viewing.phone}</div>}
              </div>
              <div className="border rounded-md p-3 bg-neutral-50 whitespace-pre-wrap">{viewing.message}</div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create subscribers page**

```tsx
// src/app/admin/subscribers/page.tsx
import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { format } from 'date-fns'

export default async function SubscribersPage() {
  const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div>
      <AdminHeader title="Subscribers" />
      <div className="p-6">
        <p className="text-sm text-neutral-500 mb-4">{subscribers.length} total subscribers</p>
        <div className="border rounded-md bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(s => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3 text-neutral-500">{format(new Date(s.createdAt), 'dd MMM yyyy')}</td>
                </tr>
              ))}
              {subscribers.length === 0 && <tr><td colSpan={2} className="text-center py-10 text-neutral-400">No subscribers</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/messages/ src/app/admin/subscribers/
git commit -m "feat(admin): messages and subscribers pages"
```

---

## Task 12: End-to-end verification

- [ ] **Step 1: Full build check**

```bash
cd /var/www/Mealicious && bun run build 2>&1 | tail -30
```

Expected: build completes. TypeScript errors (if any) are warnings only (`ignoreBuildErrors: true`), but ESLint errors need fixing.

- [ ] **Step 2: Test each feature**

1. `/admin/dashboard` — stats and charts load ✓
2. `/admin/products` — add, edit, delete product ✓
3. `/admin/orders` — filter, change status, view detail, download PDF invoice ✓
4. `/admin/customers` — search customers ✓
5. `/admin/inventory` — edit stock inline, save, export CSV ✓
6. `/admin/coupons` — create, toggle active, delete ✓
7. `/admin/banners` — create, sort, toggle active ✓
8. `/admin/blog` — create post, editor saves, publish toggle ✓
9. `/admin/reviews` — approve/reject pending reviews ✓
10. `/admin/messages` — view message, marks read ✓
11. `/admin/subscribers` — list shows ✓
12. GST PDF: click invoice icon on any paid order → PDF downloads ✓

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(admin): Plan B complete — all 10 admin panel features implemented"
```
