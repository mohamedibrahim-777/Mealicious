import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'
import type { AdminInventory } from '@/lib/catalog-store'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
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
  const { error } = await requireAdmin(req)
  if (error) return error
  try {
    const body = (await req.json()) as Partial<AdminInventory>

    if (!body.productName) {
      return NextResponse.json({ error: 'productName is required' }, { status: 400 })
    }

    const trimmedName = body.productName.trim()
    if (!trimmedName) {
      return NextResponse.json({ error: 'productName cannot be empty' }, { status: 400 })
    }

    // Check for duplicate product names
    const existing = await db.product.findUnique({
      where: { name: trimmedName },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Product with this name already exists' },
        { status: 400 }
      )
    }

    // Validate stock fields
    const stock = body.stock ?? 0
    const lowStockAlert = body.lowStockAlert ?? 10

    if (stock < 0) {
      return NextResponse.json(
        { error: 'Stock must be non-negative' },
        { status: 400 }
      )
    }
    if (lowStockAlert < 0) {
      return NextResponse.json(
        { error: 'Low stock alert must be non-negative' },
        { status: 400 }
      )
    }
    if (lowStockAlert > stock) {
      return NextResponse.json(
        { error: 'Low stock alert cannot exceed stock' },
        { status: 400 }
      )
    }

    // Get a default category (use first existing or create a fallback)
    const categories = await db.category.findMany({ take: 1 })
    const defaultCategoryId = categories[0]?.id || 'cat-1'

    const newProduct = await db.product.create({
      data: {
        name: trimmedName,
        slug: trimmedName.toLowerCase().replace(/\s+/g, '-'),
        description: 'Inventory item',
        price: 0,
        categoryId: defaultCategoryId,
        stock,
        lowStock: lowStockAlert,
        images: JSON.stringify([]),
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

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  try {
    const body = await req.json()
    const { updates } = body as { updates: { id: string; stock: number }[] }
    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'updates array is required' }, { status: 400 })
    }

    // Run updates in a transaction
    await db.$transaction(
      updates.map(u =>
        db.product.update({
          where: { id: u.id },
          data: { stock: Number(u.stock) || 0 }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('PATCH /api/admin/inventory error:', e)
    return NextResponse.json({ error: e.message || 'Failed to update inventory' }, { status: 500 })
  }
}
