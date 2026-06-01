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

  const lowStockCount = products.filter(p => (edits[p.id] !== undefined ? edits[p.id] : p.stock) < p.lowStock).length

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
    const a = document.createElement('a'); a.href = url; a.download = 'inventory.csv'; a.click()
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
                      ? <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">Low Stock</Badge>
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
