import { NextRequest, NextResponse } from 'next/server'
import { products, categories } from '@/lib/data'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')
  const bestSeller = searchParams.get('bestSeller')
  const isNew = searchParams.get('new')

  let filtered = [...products]

  if (category) {
    filtered = filtered.filter(p => p.categorySlug === category)
  }
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    )
  }
  if (featured === 'true') {
    filtered = filtered.filter(p => p.featured)
  }
  if (bestSeller === 'true') {
    filtered = filtered.filter(p => p.bestSeller)
  }
  if (isNew === 'true') {
    filtered = filtered.filter(p => p.isNew)
  }

  return NextResponse.json({
    success: true,
    products: filtered,
    categories,
    total: filtered.length,
  })
}
