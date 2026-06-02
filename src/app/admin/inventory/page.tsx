export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { InventoryClient } from './InventoryClient'

export default async function InventoryPage() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { stock: 'asc' },
  })
  const data = products.map(p => ({
    id: p.id,
    name: p.name,
    sku: p.sku ?? '',
    category: p.category?.name ?? '',
    stock: p.stock,
    lowStock: p.lowStock,
    isActive: p.isActive,
  }))
  return (
    <div>
      <AdminHeader title="Inventory" />
      <InventoryClient products={data} />
    </div>
  )
}
