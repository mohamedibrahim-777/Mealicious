'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Check, X, Star, Trash2 } from 'lucide-react'

interface Review { id: string; user: string; product: string; rating: number; title: string; comment: string; approved: boolean; date: string }

export function ReviewsClient({ reviews }: { reviews: Review[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending')

  const filtered = reviews.filter(r => {
    if (filter === 'pending') return !r.approved
    if (filter === 'approved') return r.approved
    return true
  })

  async function setApproved(id: string, approved: boolean) {
    const res = await fetch('/api/admin/reviews', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, approved }) })
    if (res.ok) { toast.success(approved ? 'Approved' : 'Rejected'); startTransition(() => router.refresh()) }
    else toast.error('Failed')
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this review?')) return
    const res = await fetch('/api/admin/reviews', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (res.ok) { toast.success('Deleted'); startTransition(() => router.refresh()) }
    else toast.error('Failed')
  }

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'approved'] as const).map(f => (
          <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="capitalize">
            {f}{f === 'pending' ? ` (${reviews.filter(r => !r.approved).length})` : ''}
          </Button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(r => (
          <div key={r.id} className="border rounded-md bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium">{r.user}</span>
                  <span className="text-neutral-400 text-sm">on</span>
                  <span className="text-neutral-600 text-sm">{r.product}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200'}`} />
                    ))}
                  </div>
                </div>
                {r.title && <p className="font-medium text-sm">{r.title}</p>}
                <p className="text-sm text-neutral-600 mt-0.5">{r.comment}</p>
                <p className="text-xs text-neutral-400 mt-1">{r.date}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Badge variant={r.approved ? 'default' : 'secondary'}>{r.approved ? 'Approved' : 'Pending'}</Badge>
                {!r.approved && (
                  <Button size="icon" variant="ghost" className="text-green-600 h-7 w-7" onClick={() => setApproved(r.id, true)} title="Approve"><Check className="h-4 w-4" /></Button>
                )}
                {r.approved && (
                  <Button size="icon" variant="ghost" className="text-yellow-600 h-7 w-7" onClick={() => setApproved(r.id, false)} title="Unapprove"><X className="h-4 w-4" /></Button>
                )}
                <Button size="icon" variant="ghost" className="text-red-500 h-7 w-7" onClick={() => handleDelete(r.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-10 text-neutral-400 border rounded-md bg-white">No {filter === 'all' ? '' : filter} reviews</div>}
      </div>
    </div>
  )
}
