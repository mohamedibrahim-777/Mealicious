'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Bell, Send } from 'lucide-react'

export function PushClient() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('https://mealicious.store')
  const [sending, setSending] = useState(false)
  const [stats, setStats] = useState<{ subscriberCount: number; configured: boolean } | null>(null)

  useEffect(() => {
    fetch('/api/admin/push/broadcast').then(r => r.ok ? r.json() : null).then(d => d && setStats(d)).catch(() => {})
  }, [])

  async function send() {
    if (!title.trim() || !body.trim()) { toast.error('Title and message required'); return }
    if (!confirm(`Send push to ${stats?.subscriberCount ?? 0} subscribers?`)) return
    setSending(true)
    try {
      const res = await fetch('/api/admin/push/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, url }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed'); return }
      toast.success(`Sent: ${data.sent}, Failed: ${data.failed}, Cleaned: ${data.cleaned}`)
      setTitle(''); setBody('')
    } catch { toast.error('Network error') }
    finally { setSending(false) }
  }

  return (
    <div className="p-6">
      {stats && !stats.configured && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
          ⚠️ Push not configured. Set <code>VAPID_PUBLIC_KEY</code> / <code>VAPID_PRIVATE_KEY</code> in .env.
        </div>
      )}
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            Send Push Notification
          </CardTitle>
          <p className="text-sm text-neutral-500">{stats?.subscriberCount ?? 0} active subscribers</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="🎉 Weekend Sale!" maxLength={60} />
          </div>
          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea rows={3} value={body} onChange={e => setBody(e.target.value)} placeholder="Flat 20% off all dry fruits. Shop now!" maxLength={150} />
          </div>
          <div className="space-y-1.5">
            <Label>Click URL</Label>
            <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://mealicious.store" />
          </div>
          <Button onClick={send} disabled={sending || !stats?.configured} className="bg-orange-500 hover:bg-orange-600">
            <Send className="h-4 w-4 mr-1" />{sending ? 'Sending…' : 'Send to All'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
