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

    const updates: Record<string, unknown> = {}
    if (body.stock !== undefined) updates.stock = body.stock
    if (body.lowStockAlert !== undefined) updates.lowStock = body.lowStockAlert
    if (body.productName !== undefined) updates.name = body.productName

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
