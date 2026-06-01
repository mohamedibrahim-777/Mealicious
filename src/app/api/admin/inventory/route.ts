import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { stock: 'asc' },
  })
  return NextResponse.json({
    products: products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku ?? '',
      category: p.category?.name ?? '',
      stock: p.stock,
      lowStock: p.lowStock,
      isActive: p.isActive,
    })),
  })
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  const body = await req.json()
  const updates: { id: string; stock: number }[] = body.updates ?? []
  await Promise.all(
    updates.map(u => db.product.update({ where: { id: u.id }, data: { stock: Number(u.stock) } }))
  )
  return NextResponse.json({ ok: true, updated: updates.length })
}
