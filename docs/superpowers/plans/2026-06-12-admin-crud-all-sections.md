# Admin CRUD All Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full add/edit/delete functionality for Categories, Coupons, Banners, Blog, Reviews, and Inventory sections in the admin panel, following existing Products/Orders/Users patterns.

**Architecture:** Extend AdminPanel.tsx with individual CRUD sections per entity. Each section gets a table view with edit/delete buttons, an add button, and dedicated dialog components (CategoryDialog, CouponDialog, etc.). Reuse the existing ProductDialog/OrderDialog patterns. Add store methods to catalog-store.ts for each section's CRUD operations. All sections use core fields only to keep forms clean and consistent.

**Tech Stack:** React (hooks), Zustand (state), shadcn/ui (dialogs/forms), TypeScript, API routes at `/api/admin/{section}`

---

## File Structure

**Modified Files:**
- `src/components/mealicious/AdminPanel.tsx` - Add 6 new tab sections, 6 dialog components, state management, handlers
- `src/lib/catalog-store.ts` - Add CRUD store methods for each new section (loadCategories, addCategory, updateCategory, deleteCategory, etc.)

**No new files created** - Keep all UI in AdminPanel.tsx following current pattern.

---

## Implementation Tasks

### Task 1: Add Categories CRUD to catalog-store

**Files:**
- Modify: `src/lib/catalog-store.ts` - Add CategoryDialog interface and store methods

**Steps:**

- [ ] **Step 1: Define CategoryDialog interface**

Add after AdminMessage interface (around line 38):

```typescript
export interface AdminCategory {
  id: string
  name: string
  slug: string
}
```

- [ ] **Step 2: Add category CRUD methods to store interface**

Add to CatalogStore interface (after deleteMessage method, around line 82):

```typescript
loadCategories: () => Promise<void>
addCategory: (category: Partial<AdminCategory>) => Promise<void>
updateCategory: (id: string, patch: Partial<AdminCategory>) => Promise<void>
deleteCategory: (id: string) => Promise<void>
```

- [ ] **Step 3: Add category state to store**

Update store creation (around line 88) to include:

```typescript
categories: AdminCategory[]
```

- [ ] **Step 4: Implement loadCategories**

Add to store implementation (after loadMessages):

```typescript
loadCategories: async () => {
  const data = await adminFetch<{ categories: AdminCategory[] }>('/api/admin/categories')
  set({ categories: data.categories })
},
```

- [ ] **Step 5: Implement addCategory**

```typescript
addCategory: async (category) => {
  await adminFetch('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  })
  await get().loadCategories()
},
```

- [ ] **Step 6: Implement updateCategory**

```typescript
updateCategory: async (id, patch) => {
  await adminFetch(`/api/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  await get().loadCategories()
},
```

- [ ] **Step 7: Implement deleteCategory**

```typescript
deleteCategory: async (id) => {
  await adminFetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
  await get().loadCategories()
},
```

- [ ] **Step 8: Test store methods load**

Run: `bun run lint`
Expected: No errors, no missing imports

- [ ] **Step 9: Commit**

```bash
git add src/lib/catalog-store.ts
git commit -m "feat: add category CRUD methods to store"
```

---

### Task 2: Add Categories UI section to AdminPanel

**Files:**
- Modify: `src/components/mealicious/AdminPanel.tsx` - Add categories tab, table, and dialog

**Steps:**

- [ ] **Step 1: Add category state variables**

Add after `const [editingUser, ...]` (around line 89):

```typescript
const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null)
const [creatingCategory, setCreatingCategory] = useState(false)
const categories: AdminCategory[] = useCatalogStore((s) => s.categories) // Add to destructure
```

Wait, categories already exists. Just note we're using it from store.

- [ ] **Step 2: Extract category CRUD from store**

Update destructure from useCatalogStore (around line 59) to add:

```typescript
loadCategories,
addCategory,
updateCategory,
deleteCategory,
```

- [ ] **Step 3: Load categories on mount**

Add to useEffect (around line 81):

```typescript
await Promise.all([
  // existing loads...
  get().loadCategories(),
])
```

- [ ] **Step 4: Add categories tab section UI**

Add after products tab (around line 307), before orders tab:

```typescript
{tab === 'categories' && (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Categories ({categories.length})</h3>
        <Button onClick={() => setCreatingCategory(true)} className="bg-orange-400 hover:bg-orange-500">
          <Plus className="h-4 w-4 mr-1" /> Add Category
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Slug</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-b last:border-0 hover:bg-orange-50/40">
                <td className="py-2 px-2 font-medium">{cat.name}</td>
                <td className="py-2 px-2 text-gray-600">{cat.slug}</td>
                <td className="py-2 px-2 text-right space-x-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingCategory(cat)}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Delete "${cat.name}"?`)) {
                        deleteCategory(cat.id)
                          .then(() => toast.success('Category deleted'))
                          .catch((e) => toast.error(e.message))
                      }
                    }}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
)}
```

- [ ] **Step 5: Add CategoryDialog component**

Add before `emptyProduct()` function (around line 955):

```typescript
function CategoryDialog({
  open,
  category,
  onClose,
  onSubmit,
}: {
  open: boolean
  category: AdminCategory | null
  onClose: () => void
  onSubmit: (data: Partial<AdminCategory>) => void
}) {
  const [form, setForm] = useState<Partial<AdminCategory>>(category ?? { name: '', slug: '' })

  useEffect(() => {
    setForm(category ?? { name: '', slug: '' })
  }, [category?.id, open])

  const handle = (key: keyof AdminCategory, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit category' : 'New category'}</DialogTitle>
          <DialogDescription>
            {category ? 'Update category details.' : 'Add a new category.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(form)
          }}
          className="space-y-3"
        >
          <div>
            <Label className="mb-1.5 block">Name</Label>
            <Input
              value={form.name ?? ''}
              onChange={(e) => {
                handle('name', e.target.value)
                handle('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))
              }}
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Slug</Label>
            <Input
              value={form.slug ?? ''}
              onChange={(e) => handle('slug', e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-400 hover:bg-orange-500">
              {category ? 'Save changes' : 'Create category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 6: Add CategoryDialog to JSX**

Add before closing div (around line 525):

```typescript
<CategoryDialog
  open={creatingCategory || editingCategory !== null}
  category={editingCategory}
  onClose={() => {
    setCreatingCategory(false)
    setEditingCategory(null)
  }}
  onSubmit={(data) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, data)
        .then(() => toast.success('Category updated'))
        .catch((e) => toast.error(e.message))
    } else {
      addCategory(data)
        .then(() => toast.success('Category created'))
        .catch((e) => toast.error(e.message))
    }
    setCreatingCategory(false)
    setEditingCategory(null)
  }}
/>
```

- [ ] **Step 7: Build and test**

Run: `bun run build 2>&1 | tail -5`
Expected: No errors, compilation successful

- [ ] **Step 8: Commit**

```bash
git add src/components/mealicious/AdminPanel.tsx
git commit -m "feat: add categories CRUD UI and dialog"
```

---

### Task 3: Add Coupons CRUD (store + UI)

**Files:**
- Modify: `src/lib/catalog-store.ts`, `src/components/mealicious/AdminPanel.tsx`

**Steps:**

- [ ] **Step 1: Add AdminCoupon interface to store**

After AdminCategory (around line 45):

```typescript
export interface AdminCoupon {
  id: string
  code: string
  discount: number
  status: 'active' | 'inactive'
}
```

- [ ] **Step 2: Add coupon state and methods to CatalogStore interface**

Add:
```typescript
coupons: AdminCoupon[]
loadCoupons: () => Promise<void>
addCoupon: (coupon: Partial<AdminCoupon>) => Promise<void>
updateCoupon: (id: string, patch: Partial<AdminCoupon>) => Promise<void>
deleteCoupon: (id: string) => Promise<void>
```

- [ ] **Step 3: Implement coupon store methods**

Following same pattern as categories (use categoryFetch pattern as template):

```typescript
loadCoupons: async () => {
  const data = await adminFetch<{ coupons: AdminCoupon[] }>('/api/admin/coupons')
  set({ coupons: data.coupons })
},
addCoupon: async (coupon) => {
  await adminFetch('/api/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(coupon),
  })
  await get().loadCoupons()
},
updateCoupon: async (id, patch) => {
  await adminFetch(`/api/admin/coupons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  await get().loadCoupons()
},
deleteCoupon: async (id) => {
  await adminFetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
  await get().loadCoupons()
},
```

- [ ] **Step 4: Add coupon state to AdminPanel**

```typescript
const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null)
const [creatingCoupon, setCreatingCoupon] = useState(false)
const { coupons, loadCoupons, addCoupon, updateCoupon, deleteCoupon } = useCatalogStore()
```

- [ ] **Step 5: Load coupons in useEffect**

Add `await get().loadCoupons()` to Promise.all

- [ ] **Step 6: Add coupons tab UI**

After categories tab (similar pattern):

```typescript
{tab === 'coupons' && (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Coupons & Discounts ({coupons.length})</h3>
        <Button onClick={() => setCreatingCoupon(true)} className="bg-orange-400 hover:bg-orange-500">
          <Plus className="h-4 w-4 mr-1" /> Add Coupon
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2 px-2">Code</th>
              <th className="py-2 px-2">Discount</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b last:border-0 hover:bg-orange-50/40">
                <td className="py-2 px-2 font-medium">{coupon.code}</td>
                <td className="py-2 px-2">{coupon.discount}%</td>
                <td className="py-2 px-2">
                  <Badge variant="outline" className={coupon.status === 'active' ? 'text-green-600 border-green-300' : 'text-gray-600 border-gray-300'}>
                    {coupon.status}
                  </Badge>
                </td>
                <td className="py-2 px-2 text-right space-x-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingCoupon(coupon)}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Delete coupon ${coupon.code}?`)) {
                        deleteCoupon(coupon.id)
                          .then(() => toast.success('Coupon deleted'))
                          .catch((e) => toast.error(e.message))
                      }
                    }}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
)}
```

- [ ] **Step 7: Add CouponDialog component**

```typescript
function CouponDialog({
  open,
  coupon,
  onClose,
  onSubmit,
}: {
  open: boolean
  coupon: AdminCoupon | null
  onClose: () => void
  onSubmit: (data: Partial<AdminCoupon>) => void
}) {
  const [form, setForm] = useState<Partial<AdminCoupon>>(coupon ?? { code: '', discount: 0, status: 'active' })

  useEffect(() => {
    setForm(coupon ?? { code: '', discount: 0, status: 'active' })
  }, [coupon?.id, open])

  const handle = (key: keyof AdminCoupon, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{coupon ? 'Edit coupon' : 'New coupon'}</DialogTitle>
          <DialogDescription>
            {coupon ? 'Update coupon details.' : 'Add a new coupon.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit(form)
          }}
          className="space-y-3"
        >
          <div>
            <Label className="mb-1.5 block">Code</Label>
            <Input
              value={form.code ?? ''}
              onChange={(e) => handle('code', e.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Discount (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={form.discount ?? 0}
              onChange={(e) => handle('discount', Number(e.target.value))}
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Status</Label>
            <Select
              value={form.status ?? 'active'}
              onValueChange={(v) => handle('status', v as 'active' | 'inactive')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-400 hover:bg-orange-500">
              {coupon ? 'Save changes' : 'Create coupon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 8: Add CouponDialog to JSX**

Before closing div

- [ ] **Step 9: Build and test**

Run: `bun run build 2>&1 | tail -5`
Expected: No errors

- [ ] **Step 10: Commit**

```bash
git add src/lib/catalog-store.ts src/components/mealicious/AdminPanel.tsx
git commit -m "feat: add coupons CRUD UI and dialog"
```

---

### Task 4: Add Banners CRUD (store + UI)

**Repeat Task 3 pattern for Banners:**
- AdminBanner interface: `id, title, image, link`
- Table columns: Title, Image, Link
- Form fields: title (required), image (url), link (url)
- Follow exact same code pattern as coupons

- [ ] **Step 1: Add AdminBanner interface**

```typescript
export interface AdminBanner {
  id: string
  title: string
  image: string
  link: string
}
```

- [ ] **Step 2-10: Implement store methods and UI**

Follow coupons task pattern exactly. Store methods: loadBanners, addBanner, updateBanner, deleteBanner. UI table and dialog.

- [ ] **Step 11: Build and commit**

```bash
git add src/lib/catalog-store.ts src/components/mealicious/AdminPanel.tsx
git commit -m "feat: add banners CRUD UI and dialog"
```

---

### Task 5: Add Blog CRUD (store + UI)

**Pattern:**
- AdminBlog interface: `id, title, excerpt, published`
- Table: Title, Status (Published/Draft)
- Form: title, excerpt (textarea), published (checkbox)

- [ ] **Step 1: Add AdminBlog interface**

```typescript
export interface AdminBlog {
  id: string
  title: string
  excerpt: string
  published: boolean
}
```

- [ ] **Step 2-10: Implement store and UI**

Store methods: loadBlogs, addBlog, updateBlog, deleteBlog. UI following coupons pattern.

- [ ] **Step 11: Build and commit**

```bash
git add src/lib/catalog-store.ts src/components/mealicious/AdminPanel.tsx
git commit -m "feat: add blog CRUD UI and dialog"
```

---

### Task 6: Add Reviews CRUD (store + UI)

**Pattern:**
- AdminReview interface: `id, productName, rating, status`
- Table: Product, Rating (stars), Status
- Form: productName, rating (1-5), status (select)

- [ ] **Step 1: Add AdminReview interface**

```typescript
export interface AdminReview {
  id: string
  productName: string
  rating: number
  status: 'approved' | 'pending' | 'rejected'
}
```

- [ ] **Step 2-10: Implement store and UI**

Store methods: loadReviews, addReview, updateReview, deleteReview.

- [ ] **Step 11: Build and commit**

```bash
git add src/lib/catalog-store.ts src/components/mealicious/AdminPanel.tsx
git commit -m "feat: add reviews CRUD UI and dialog"
```

---

### Task 7: Add Inventory CRUD (store + UI)

**Pattern:**
- AdminInventory interface: `id, productName, stock, lowStockAlert`
- Table: Product, Stock, Low Stock Alert
- Form: productName, stock (number), lowStockAlert (number)

- [ ] **Step 1: Add AdminInventory interface**

```typescript
export interface AdminInventory {
  id: string
  productName: string
  stock: number
  lowStockAlert: number
}
```

- [ ] **Step 2-10: Implement store and UI**

Store methods: loadInventory, addInventory, updateInventory, deleteInventory.

- [ ] **Step 11: Build and commit**

```bash
git add src/lib/catalog-store.ts src/components/mealicious/AdminPanel.tsx
git commit -m "feat: add inventory CRUD UI and dialog"
```

---

### Task 8: Final Integration and Deployment

- [ ] **Step 1: Full build test**

Run: `bun run build 2>&1 | grep -E "error|compiled|✓" | tail -10`
Expected: "✓ Compiled successfully"

- [ ] **Step 2: Restart app**

```bash
pm2 restart mealicious && sleep 5 && curl -s http://localhost:3000 | grep -o "Mealicious"
```
Expected: "Mealicious" output (app responding)

- [ ] **Step 3: Test one section end-to-end**

Open browser, go to admin panel (mealicious.store), login, click Categories tab, add a category, edit it, delete it. Verify table updates.

- [ ] **Step 4: Verify all tabs show**

Check that all tabs appear: overview, products, categories, orders, users, messages, subscribers, banners, coupons, blog, reviews, inventory

- [ ] **Step 5: Final commit**

```bash
git status
git log --oneline -10
```

Verify all changes committed.

---

## Acceptance Criteria

- ✅ All 6 sections (Categories, Coupons, Banners, Blog, Reviews, Inventory) have working add/edit/delete
- ✅ UI is consistent across all sections (orange buttons, same layout)
- ✅ Forms show only core fields
- ✅ Toast notifications on success/error
- ✅ Delete requires confirmation
- ✅ App builds without errors
- ✅ Admin can use all CRUD operations from UI
- ✅ Data persists after refresh
