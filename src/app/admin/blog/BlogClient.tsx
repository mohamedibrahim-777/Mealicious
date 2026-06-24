'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'

import { adminFetch } from '@/lib/admin-fetch'

interface Post { id: string; title: string; slug: string; category: string; published: boolean; date: string }

export function BlogClient({ posts }: { posts: Post[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      await adminFetch(`/api/admin/blogs/${id}`, { method: 'DELETE' })
      toast.success('Post deleted')
      startTransition(() => router.refresh())
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-end mb-4">
        <Link href="/admin/blog/new">
          <Button className="bg-orange-500 hover:bg-orange-600"><Plus className="h-4 w-4 mr-1" />New Post</Button>
        </Link>
      </div>
      <div className="border rounded-md bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-neutral-500">{p.category || '-'}</td>
                <td className="px-4 py-3"><Badge variant={p.published ? 'default' : 'secondary'}>{p.published ? 'Published' : 'Draft'}</Badge></td>
                <td className="px-4 py-3 text-neutral-500">{p.date}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  <Link href={`/admin/blog/${p.id}`}><Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button></Link>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(p.id, p.title)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-neutral-400">No posts yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
