import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdminSession } from '@/lib/auth-server'
import type { AdminInventory } from '@/lib/catalog-store'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  try {
    const id = params.id
    const body = (await req.json()) as Partial<AdminInventory>

    // Validate bounds on stock fields
    if (body.stock !== undefined && body.stock < 0) {
      return NextResponse.json(
        { error: 'Stock must be non-negative' },
        { status: 400 }
      )
    }
    if (body.lowStockAlert !== undefined && body.lowStockAlert < 0) {
      return NextResponse.json(
        { error: 'Low stock alert must be non-negative' },
        { status: 400 }
      )
    }

    // Get current product to check logical constraints
    const current = await db.product.findUnique({ where: { id } })
    if (!current) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Determine final values for validation
    const finalStock = body.stock !== undefined ? body.stock : current.stock
    const finalLowStockAlert =
      body.lowStockAlert !== undefined ? body.lowStockAlert : current.lowStock

    // Validate constraint: lowStockAlert <= stock
    if (finalLowStockAlert > finalStock) {
      return NextResponse.json(
        { error: 'Low stock alert cannot exceed stock' },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = {}
    if (body.stock !== undefined) updates.stock = body.stock
    if (body.lowStockAlert !== undefined) updates.lowStock = body.lowStockAlert
    if (body.productName !== undefined) {
      const trimmedName = body.productName.trim()
      if (!trimmedName) {
        return NextResponse.json(
          { error: 'productName cannot be empty' },
          { status: 400 }
        )
      }
      // Check for duplicate names (excluding self)
      const existing = await db.product.findUnique({
        where: { name: trimmedName },
      })
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: 'Product with this name already exists' },
          { status: 400 }
        )
      }
      updates.name = trimmedName
    }

    const updated = await db.product.update({
      where: { id },
      data: updates,
    })

    const inventory: AdminInventory = {
      id: updated.id,
      productName: updated.name,
      stock: updated.stock,
      lowStockAlert: updated.lowStock,
    }
    return NextResponse.json(inventory)
  } catch (e) {
    console.error('PATCH /api/admin/inventory/[id] error:', e)
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireAdminSession(req)
  if (error) return error
  try {
    const id = params.id

    await db.product.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/admin/inventory/[id] error:', e)
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 })
  }
}
