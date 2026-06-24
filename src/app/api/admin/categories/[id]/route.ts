import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const { id } = await params
  const category = await db.category.findUnique({
    where: { id },
    include: { children: true, parent: true },
  })
  if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  return NextResponse.json({ category })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const { id } = await params
  const body = await req.json()
  const category = await db.category.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.icon !== undefined && { icon: body.icon }),
      ...(body.featured !== undefined && { featured: Boolean(body.featured) }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
      ...(body.parentId !== undefined && { parentId: body.parentId || null }),
    },
  })
  return NextResponse.json({ category })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const { id } = await params
  try {
    const cat = await db.category.findUnique({ where: { id } })
    if (!cat) return NextResponse.json({ error: 'Category not found' }, { status: 404 })

    // Find or create "Uncategorized" category
    let uncategorized = await db.category.findUnique({ where: { slug: 'uncategorized' } })
    if (!uncategorized) {
      uncategorized = await db.category.create({
        data: {
          name: 'Uncategorized',
          slug: 'uncategorized',
        }
      })
    }

    // Move all products of the deleted category to "Uncategorized"
    if (uncategorized.id !== id) {
      await db.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: uncategorized.id }
      })
    }

    // Nullify parentId of child categories if they exist (to avoid constraint errors)
    await db.category.updateMany({
      where: { parentId: id },
      data: { parentId: null }
    })

    await db.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Error deleting category:', e)
    return NextResponse.json({ error: e.message || 'Failed to delete category' }, { status: 500 })
  }
}
