import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { serializeProduct } from '@/lib/admin-helpers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categorySlug = searchParams.get('category')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')
  const bestSeller = searchParams.get('bestSeller')
  const isNew = searchParams.get('new')

  const where: Record<string, unknown> = { isActive: true }
  if (categorySlug) where.category = { slug: categorySlug }
  if (featured === 'true') where.featured = true
  if (bestSeller === 'true') where.bestSeller = true
  if (isNew === 'true') where.isNew = true
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [rows, cats] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.category.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  const products = rows.map((p) => ({
    ...serializeProduct(p as unknown as Record<string, unknown>),
    category: p.category?.name,
    categorySlug: p.category?.slug,
  }))

  return NextResponse.json({
    success: true,
    products,
    categories: cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      icon: c.icon,
    })),
    total: products.length,
  })
}
