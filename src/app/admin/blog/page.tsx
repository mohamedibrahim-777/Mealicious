export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { BlogClient } from './BlogClient'
import { format } from 'date-fns'

export default async function BlogPage() {
  const posts = await db.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div>
      <AdminHeader title="Blog" />
      <BlogClient posts={posts.map(p => ({ id: p.id, title: p.title, slug: p.slug, category: p.category ?? '', published: p.published, date: format(new Date(p.createdAt), 'dd MMM yyyy') }))} />
    </div>
  )
}
