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
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react'

import { adminFetch } from '@/lib/admin-fetch'

interface Category {
  id: string; name: string; slug: string; image: string; icon: string
  featured: boolean; sortOrder: number; parentId: string | null; parentName?: string
  childCount: number
}

const EMPTY = { name: '', slug: '', image: '', icon: '', featured: false, sortOrder: 0, parentId: '' }
type FormState = typeof EMPTY

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)

  const parents = categories.filter(c => !c.parentId)

  function set(key: keyof FormState, value: unknown) {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && !editing) {
        next.slug = String(value).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }
      return next
    })
  }

  function openNew() { setForm(EMPTY); setEditing(null); setOpen(true) }
  function openEdit(c: Category) {
    setForm({ name: c.name, slug: c.slug, image: c.image, icon: c.icon, featured: c.featured, sortOrder: c.sortOrder, parentId: c.parentId ?? '' })
    setEditing(c.id); setOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = { ...form, parentId: form.parentId || null, sortOrder: Number(form.sortOrder) }
      const url = editing ? `/api/admin/categories/${editing}` : '/api/admin/categories'
      await adminFetch(url, { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      toast.success(editing ? 'Updated' : 'Created')
      setOpen(false); startTransition(() => router.refresh())
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: string, name: string, childCount: number) {
    if (childCount > 0) { toast.error('Remove subcategories first'); return }
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await adminFetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      toast.success('Deleted')
      startTransition(() => router.refresh())
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed — category may have products')
    }
  }

  const parentCategories = categories.filter(c => !c.parentId)
  const subCategories = categories.filter(c => c.parentId)

  return (
    <div className="p-6">
      <div className="flex justify-end mb-4">
        <Button onClick={openNew} className="bg-orange-500 hover:bg-orange-600"><Plus className="h-4 w-4 mr-1" />New Category</Button>
      </div>

      <div className="border rounded-md bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Featured</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parentCategories.map(cat => (
              <>
                <tr key={cat.id} className="border-b hover:bg-neutral-50 bg-neutral-50/50">
                  <td className="px-4 py-3 font-semibold">{cat.name}</td>
                  <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3"><Badge variant="outline">Parent</Badge></td>
                  <td className="px-4 py-3">{cat.featured ? <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Featured</Badge> : '-'}</td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(cat.id, cat.name, cat.childCount)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
                {subCategories.filter(s => s.parentId === cat.id).map(sub => (
                  <tr key={sub.id} className="border-b hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 pl-4 text-neutral-700">
                        <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
                        {sub.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 font-mono text-xs">{sub.slug}</td>
                    <td className="px-4 py-3"><Badge variant="secondary">Sub</Badge></td>
                    <td className="px-4 py-3">-</td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(sub)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(sub.id, sub.name, 0)}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </>
            ))}
            {categories.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-neutral-400">No categories yet</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={v => !v && setOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Slug</Label><Input value={form.slug} onChange={e => set('slug', e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Parent Category (leave empty for top-level)</Label>
              <Select value={form.parentId} onValueChange={v => set('parentId', v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Top-level category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Top-level —</SelectItem>
                  {parents.filter(p => p.id !== editing).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Image URL</Label><Input value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..." /></div>
            <div className="space-y-1.5"><Label>Icon (emoji or name)</Label><Input value={form.icon} onChange={e => set('icon', e.target.value)} placeholder="🥜 or icon name" /></div>
            <div className="space-y-1.5"><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={e => set('sortOrder', e.target.value)} /></div>
            <div className="flex items-center justify-between border rounded-md px-3 py-2"><Label>Featured</Label><Switch checked={form.featured} onCheckedChange={v => set('featured', v)} /></div>
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
