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
