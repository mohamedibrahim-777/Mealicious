'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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

const EMPTY = { code: '', type: 'percentage', value: 10, minOrder: 0, maxDiscount: '', usageLimit: '', validFrom: '', validTo: '', isActive: true }
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
    setForm({ code: c.code, type: c.type, value: c.value, minOrder: c.minOrder, maxDiscount: c.maxDiscount?.toString() ?? '', usageLimit: c.usageLimit?.toString() ?? '', validFrom: c.validFrom, validTo: c.validTo, isActive: c.isActive })
    setEditing(c.id); setOpen(true)
  }
  function set(key: keyof FormState, value: unknown) { setForm(prev => ({ ...prev, [key]: value })) }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = { ...form, value: Number(form.value), minOrder: Number(form.minOrder), maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null, usageLimit: form.usageLimit ? Number(form.usageLimit) : null }
      const url = editing ? `/api/admin/coupons/${editing}` : '/api/admin/coupons'
      const res = await fetch(url, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed')
      toast.success(editing ? 'Updated' : 'Created')
      setOpen(false); startTransition(() => router.refresh())
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
      <div className="border rounded-md bg-white overflow-x-auto">
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
                <td className="px-4 py-3 font-mono font-bold text-orange-600">{c.code}</td>
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
                  <SelectContent><SelectItem value="percentage">Percentage %</SelectItem><SelectItem value="fixed">Fixed ₹</SelectItem></SelectContent>
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
