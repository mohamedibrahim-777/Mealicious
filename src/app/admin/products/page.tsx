export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ProductsClient } from './ProductsClient'

async function getData() {
  const [products, categories] = await Promise.all([
    db.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])
  return {
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDesc: p.shortDesc ?? '',
      price: p.price,
      salePrice: p.salePrice,
      images: (() => { try { const a = JSON.parse(p.images); return Array.isArray(a) ? a.join(', ') : p.images } catch { return p.images } })(),
      categorySlug: p.category?.slug ?? '',
      stock: p.stock,
      lowStock: p.lowStock,
      sku: p.sku ?? '',
      featured: p.featured,
      bestSeller: p.bestSeller,
      isNew: p.isNew,
      isActive: p.isActive,
      tags: (() => { try { const a = JSON.parse(p.tags ?? '[]'); return Array.isArray(a) ? a.join(', ') : '' } catch { return '' } })(),
      variants: p.variants ?? '',
      nutrition: p.nutrition ?? '',
      category: p.category?.name ?? '',
    })),
    categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
  }
}

export default async function ProductsPage() {
  const { products, categories } = await getData()
  return (
    <div>
      <AdminHeader title="Products" />
      <ProductsClient products={products} categories={categories} />
    </div>
  )
}
