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
type FormState = typeof EMPTY

export function BannersClient({ banners }: { banners: Banner[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)

  function set(key: keyof FormState, value: unknown) { setForm(prev => ({ ...prev, [key]: value })) }
  function openNew() { setForm(EMPTY); setEditing(null); setOpen(true) }
  function openEdit(b: Banner) { setForm({ title: b.title, subtitle: b.subtitle, image: b.image, link: b.link, sortOrder: b.sortOrder, isActive: b.isActive }); setEditing(b.id); setOpen(true) }

  async function handleSave() {
    setSaving(true)
    try {
      const url = editing ? `/api/admin/banners/${editing}` : '/api/admin/banners'
      const res = await fetch(url, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) }) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success(editing ? 'Updated' : 'Created')
      setOpen(false); startTransition(() => router.refresh())
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
            {b.image && (
              <img src={b.image} alt={b.title} className="h-16 w-24 object-cover rounded shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{b.title}</p>
              {b.subtitle && <p className="text-sm text-neutral-500 truncate">{b.subtitle}</p>}
              {b.link && <p className="text-xs text-blue-500 truncate">{b.link}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-center">
                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => changeOrder(b, -1)}><ChevronUp className="h-3 w-3" /></Button>
                <span className="text-xs text-neutral-400">{b.sortOrder}</span>
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
