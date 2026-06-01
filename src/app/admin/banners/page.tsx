import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { BannersClient } from './BannersClient'

export default async function BannersPage() {
  const banners = await db.banner.findMany({ orderBy: { sortOrder: 'asc' } })
  return (
    <div>
      <AdminHeader title="Banners" />
      <BannersClient banners={banners.map(b => ({ id: b.id, title: b.title, subtitle: b.subtitle ?? '', image: b.image ?? '', link: b.link ?? '', sortOrder: b.sortOrder, isActive: b.isActive }))} />
    </div>
  )
}
