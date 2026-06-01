# Admin Panel — Full Feature Design

**Date:** 2026-06-01  
**Status:** Approved  
**Scope:** Full admin dashboard at `/admin` route with 10 feature sections

---

## Overview

Replace the embedded SPA admin panel (`AdminPanel.tsx` in page switch) with a proper Next.js App Router admin section at `/src/app/admin/`. Protected by middleware session-cookie auth. Separate from storefront bundle.

---

## Architecture

### File Structure

```
src/app/admin/
├── layout.tsx                    # Sidebar + top header shell
├── page.tsx                      # Redirect → /admin/dashboard
├── login/page.tsx                # Email + password login form
├── dashboard/page.tsx            # Stats, charts, recent activity
├── products/
│   ├── page.tsx                  # Product list, search, filter
│   └── [id]/page.tsx             # Create / edit product
├── orders/
│   ├── page.tsx                  # Order list, filter by status/date
│   └── [id]/page.tsx             # Order detail, status update, invoice
├── customers/page.tsx            # Customer list, search, view orders
├── inventory/page.tsx            # Stock levels, low-stock alerts, bulk edit
├── coupons/page.tsx              # Coupon CRUD
├── banners/page.tsx              # Banner CRUD + sort order
├── blog/
│   ├── page.tsx                  # Blog post list
│   └── [id]/page.tsx             # Post editor (create/edit)
└── reviews/page.tsx              # Review moderation

src/middleware.ts                  # Protect /admin/* except /admin/login
```

### New API Routes

```
src/app/api/admin/
├── auth/
│   ├── login/route.ts            # POST: verify creds → set session cookie
│   └── logout/route.ts           # POST: clear session cookie
├── coupons/
│   ├── route.ts                  # GET list, POST create
│   └── [id]/route.ts             # PATCH update, DELETE
├── banners/
│   ├── route.ts                  # GET list, POST create
│   └── [id]/route.ts             # PATCH update, DELETE
├── blog/
│   ├── route.ts                  # GET list, POST create
│   └── [id]/route.ts             # PATCH update, DELETE
├── inventory/
│   └── route.ts                  # GET low-stock list, PATCH bulk stock update
├── reviews/
│   └── route.ts                  # GET pending, PATCH approve/reject
└── invoices/
    └── [orderId]/route.ts        # GET → PDF stream
```

Existing routes reused as-is:
- `/api/admin/products`, `/api/admin/orders`, `/api/admin/users`
- `/api/admin/messages`, `/api/admin/subscribers`, `/api/admin/dashboard`

---

## Authentication

**Mechanism:** Server-side session cookie (HttpOnly, Secure, SameSite=Lax), signed JWT, 7-day expiry.

**Credentials:** `ADMIN_EMAILS` + `ADMIN_PASSWORD` environment variables. Single shared password (no per-user passwords for now).

**Middleware (`src/middleware.ts`):**
- Matches `/admin/:path*`
- Skips `/admin/login`
- Reads `admin-session` cookie, verifies JWT signature
- Redirects to `/admin/login` if invalid/missing

**Login flow:**
1. POST `/api/admin/auth/login` with `{ email, password }`
2. API verifies against env vars
3. Sets `admin-session` cookie with signed JWT payload `{ email, iat, exp }`
4. Client redirects to `/admin/dashboard`

**No Firebase dependency** for admin auth.

---

## Features

### 1. Dashboard
- Revenue chart: 7 / 30 / 90-day range selector, line chart (recharts)
- Orders by status: donut chart
- KPI cards: total revenue, orders today, active products, low-stock count
- Recent orders table (last 10): order#, customer, total, status, date
- Unread messages badge
- Top 5 bestselling products

### 2. Product Management
- Searchable, filterable table (by category, status, featured)
- Columns: image, name, SKU, price, sale price, stock, status, actions
- Add/Edit dialog: name, slug (auto-generated), description, shortDesc, price, salePrice, images (comma-separated URLs), category, variants (JSON), tags, nutrition (JSON), stock, lowStock, SKU, featured/bestSeller/isNew/isActive toggles
- Delete with confirmation
- Bulk delete via checkbox selection

### 3. Order Management
- Filter by: status, payment status, date range
- Columns: order#, customer, items, total, payment, status, date, actions
- Inline status dropdown (Pending → Confirmed → Processing → Shipped → Delivered / Cancelled)
- Order detail page: line items with images, shipping address, payment method, coupon used, timeline
- Download GST invoice PDF button on detail page

### 4. Customer Database
- Search by name / email / phone
- Table: name, email, phone, joined date, order count, role
- Click → slide-over with order history
- Soft delete (sets user inactive, does not destroy orders)

### 5. Inventory Management
- Products sorted by stock ascending
- Columns: product, SKU, category, current stock, low-stock threshold, status
- Inline stock quantity edit (click cell → input → save)
- Low-stock badge (red) when `stock < lowStock`
- Bulk CSV export of current inventory

### 6. Coupon & Discount Management
- Table: code, type, value, min order, usage (used/limit), valid dates, active
- Create / Edit dialog: code, type (percentage/fixed), value, minOrder, maxDiscount, usageLimit, validFrom, validTo, isActive
- Delete with confirmation
- Toggle active without opening dialog

### 7. Banner & Homepage Control
- List of banners with preview thumbnail
- Fields: title, subtitle, image URL, link, sort order, active toggle
- Drag-to-reorder via sort order field increment/decrement buttons
- Create / Delete

### 8. Blog Management
- Post list: title, category, published status, date, actions
- Post editor page: title, slug (auto), excerpt, content (textarea — markdown), image URL, author, category, tags (comma-separated), published toggle
- Preview link opens `/blog/[slug]` in new tab

### 9. GST Invoice Generation
- Library: `@react-pdf/renderer`
- Per-order PDF includes:
  - Seller: business name, address, GSTIN (`GSTIN` env var)
  - Buyer: customer name, shipping address, state
  - Line items: product name, HSN code (`HSN_CODE` env var, default `21069099`), qty, unit price, taxable value
  - Tax: CGST 9% + SGST 9% (intra-state) OR IGST 18% (inter-state), determined by comparing buyer state to seller state (`SELLER_STATE` env var)
  - Totals: subtotal, shipping, discount (coupon), tax, grand total
  - Invoice number = order number, invoice date = order date
- API route streams PDF bytes, triggers browser download

### 10. Role-based Access
- Single role: `admin` (full access) vs not-admin (no access)
- Admin emails configured via `ADMIN_EMAILS` env var (comma-separated)
- Future: granular staff roles can extend this model by adding a `role` field to the session JWT

---

## UI Shell

**Layout (`admin/layout.tsx`):**
- Left sidebar (collapsible on mobile) with nav links to all sections
- Top header: page title, admin email, logout button
- Uses existing shadcn/ui components (Sidebar, Sheet for mobile)
- Dark-friendly: uses Tailwind neutral palette, accent orange (brand color)

**Sidebar nav items:**
Dashboard, Products, Orders, Customers, Inventory, Coupons, Banners, Blog, Reviews, Messages (existing), Subscribers (existing)

---

## Environment Variables Required

```env
ADMIN_EMAILS=info.sashainfinity@gmail.com
ADMIN_PASSWORD=<strong-password>
ADMIN_SESSION_SECRET=<random-32-char-string>
GSTIN=<your-gstin>
SELLER_STATE=<state-name>
HSN_CODE=21069099
```

---

## Data Flow

```
Browser → /admin/* 
  → middleware.ts (verify session cookie)
  → admin/layout.tsx (sidebar shell)
  → page component (server component, fetches via admin API)
  → /api/admin/* (requireAdmin checks cookie, queries Prisma)
  → PostgreSQL
```

Client components only where interactivity needed (forms, dialogs, charts). Server components for data tables.

---

## Dependencies to Add

- `@react-pdf/renderer` — GST invoice PDF generation
- `recharts` — analytics charts (already likely available via shadcn chart component)
- `jose` — already present (used in auth-server.ts), reuse for session JWT signing

---

## Out of Scope

- Multi-admin user management (add/remove admin accounts from UI)
- Email sending from admin panel
- Product image upload (URLs only for now)
- Real-time notifications
