import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'
import type { AdminInventory } from '@/lib/catalog-store'

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  try {
    const products = await db.product.findMany({
      orderBy: { stock: 'asc' },
    })
    const inventory: AdminInventory[] = products.map(p => ({
      id: p.id,
      productName: p.name,
      stock: p.stock,
      lowStockAlert: p.lowStock,
    }))
    return NextResponse.json({ inventory })
  } catch (e) {
    console.error('GET /api/admin/inventory error:', e)
    return NextResponse.json({ error: 'Failed to load inventory' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  try {
    const body = (await req.json()) as Partial<AdminInventory>

    if (!body.productName) {
      return NextResponse.json({ error: 'productName is required' }, { status: 400 })
    }

    const newProduct = await db.product.create({
      data: {
        name: body.productName,
        slug: body.productName.toLowerCase().replace(/\s+/g, '-'),
        description: '',
        price: 0,
        categoryId: '', // Dummy; should be provided
        stock: body.stock ?? 0,
        lowStock: body.lowStockAlert ?? 10,
      },
    })

    const inventory: AdminInventory = {
      id: newProduct.id,
      productName: newProduct.name,
      stock: newProduct.stock,
      lowStockAlert: newProduct.lowStock,
    }
    return NextResponse.json(inventory, { status: 201 })
  } catch (e) {
    console.error('POST /api/admin/inventory error:', e)
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 })
  }
}
