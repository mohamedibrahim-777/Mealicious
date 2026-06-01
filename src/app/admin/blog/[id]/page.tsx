import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { BlogEditor } from './BlogEditor'

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = id === 'new' ? null : await db.blogPost.findUnique({ where: { id } })
  return (
    <div>
      <AdminHeader title={id === 'new' ? 'New Post' : 'Edit Post'} />
      <BlogEditor
        id={id === 'new' ? null : id}
        initial={post ? {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? '',
          content: post.content,
          image: post.image ?? '',
          author: post.author ?? '',
          category: post.category ?? '',
          tags: (() => { try { const a = JSON.parse(post.tags ?? '[]'); return Array.isArray(a) ? a.join(', ') : '' } catch { return '' } })(),
          published: post.published,
        } : undefined}
      />
    </div>
  )
}
