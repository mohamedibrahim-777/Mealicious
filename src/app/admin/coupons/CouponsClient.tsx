'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'

// Simplified coupon interface matching AdminCoupon spec
interface Coupon {
  id: string
  code: string
  discount: number
  status: 'active' | 'inactive'
}

const EMPTY = { code: '', discount: 0, status: 'active' as const }
type FormState = typeof EMPTY

export function CouponsClient({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)

  function openNew() { setForm(EMPTY); setEditing(null); setOpen(true) }
  function openEdit(c: Coupon) {
    setForm({ code: c.code, discount: c.discount, status: c.status })
    setEditing(c.id)
    setOpen(true)
  }
  function set(key: keyof FormState, value: unknown) { setForm(prev => ({ ...prev, [key]: value })) }

  async function handleSave() {
    setSaving(true)
    try {
      const url = editing ? `/api/admin/coupons/${editing}` : '/api/admin/coupons'
      const res = await fetch(url, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success(editing ? 'Updated' : 'Created')
      setOpen(false)
      startTransition(() => router.refresh())
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); startTransition(() => router.refresh()) }
    else toast.error('Failed')
  }

  return (
    <div className="p-6">
      <div className="flex justify-end mb-4">
        <Button onClick={openNew} className="bg-orange-500 hover:bg-orange-600"><Plus className="h-4 w-4 mr-1" />New Coupon</Button>
      </div>
      <div className="border rounded-md bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Code</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Discount (%)</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono font-bold text-orange-600">{c.code}</td>
                <td className="px-4 py-3">{c.discount}%</td>
                <td className="px-4 py-3 capitalize">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(c.id, c.code)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-neutral-400">No coupons yet</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={v => !v && setOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Coupon' : 'New Coupon'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5"><Label>Code</Label><Input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="SAVE10" required /></div>
            <div className="space-y-1.5"><Label>Discount (%)</Label><Input type="number" min="0" max="100" value={form.discount} onChange={e => set('discount', Number(e.target.value))} /></div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v as 'active' | 'inactive')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
              </Select>
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
