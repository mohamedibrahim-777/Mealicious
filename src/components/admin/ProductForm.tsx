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
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && !isEdit) {
        next.slug = String(value).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }
      return next
    })
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
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
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
                <Label>{key === 'isActive' ? 'Active' : key === 'bestSeller' ? 'Best Seller' : key === 'isNew' ? 'New' : 'Featured'}</Label>
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
