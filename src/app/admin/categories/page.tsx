export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { CategoriesClient } from './CategoriesClient'

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    include: { children: true, parent: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })
  return (
    <div>
      <AdminHeader title="Categories" />
      <CategoriesClient categories={categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image ?? '',
        icon: c.icon ?? '',
        featured: c.featured,
        sortOrder: c.sortOrder,
        parentId: c.parentId,
        parentName: c.parent?.name,
        childCount: c.children.length,
      }))} />
    </div>
  )
}
