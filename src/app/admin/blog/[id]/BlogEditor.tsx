'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Save, ArrowLeft } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'

interface PostForm {
  title: string; slug: string; excerpt: string; content: string
  image: string; author: string; category: string; tags: string; published: boolean
}
const EMPTY: PostForm = { title: '', slug: '', excerpt: '', content: '', image: '', author: '', category: '', tags: '', published: false }

export function BlogEditor({ id, initial }: { id: string | null; initial?: Partial<PostForm> }) {
  const router = useRouter()
  const [form, setForm] = useState<PostForm>({ ...EMPTY, ...initial })
  const [saving, setSaving] = useState(false)

  function set(key: keyof PostForm, value: unknown) {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'title' && !id) {
        next.slug = String(value).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }
      const url = id ? `/api/admin/blogs/${id}` : '/api/admin/blogs'
      await adminFetch(url, { method: id ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      toast.success(id ? 'Post updated' : 'Post created')
      router.push('/admin/blog')
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Error') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-3xl">
      <Link href="/admin/blog" className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-800 mb-6">
        <ArrowLeft className="h-3.5 w-3.5 mr-1" />Back to posts
      </Link>
      <div className="space-y-4">
        <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={e => set('title', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Slug</Label><Input value={form.slug} onChange={e => set('slug', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Author</Label><Input value={form.author} onChange={e => set('author', e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>Category</Label><Input value={form.category} onChange={e => set('category', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Tags (comma-separated)</Label><Input value={form.tags} onChange={e => set('tags', e.target.value)} /></div>
        </div>
        <div className="space-y-1.5"><Label>Cover Image URL</Label><Input value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..." /></div>
        <div className="space-y-1.5"><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={2} /></div>
        <div className="space-y-1.5">
          <Label>Content (Markdown)</Label>
          <Textarea value={form.content} onChange={e => set('content', e.target.value)} rows={20} className="font-mono text-sm" placeholder="Write your post in Markdown..." />
        </div>
        <div className="flex items-center justify-between border rounded-md px-3 py-2">
          <Label>Published</Label>
          <Switch checked={form.published} onCheckedChange={v => set('published', v)} />
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
          <Save className="h-4 w-4 mr-1" />{saving ? 'Saving…' : 'Save Post'}
        </Button>
      </div>
    </div>
  )
}
