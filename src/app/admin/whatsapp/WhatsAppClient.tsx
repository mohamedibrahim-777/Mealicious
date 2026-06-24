'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Send, ShoppingCart, MessageCircle, RefreshCw } from 'lucide-react'

interface AbandonedCart {
  id: string; phone: string; name: string | null; email: string | null
  items: { name: string; quantity: number }[]; cartValue: number; reminderSent: boolean; createdAt: string
}

export function WhatsAppClient({ configured }: { configured: boolean }) {
  // Broadcast
  const [message, setMessage] = useState('')
  const [coupon, setCoupon] = useState('')
  const [segment, setSegment] = useState('all')
  const [sending, setSending] = useState(false)

  // Cart recovery
  const [carts, setCarts] = useState<AbandonedCart[]>([])
  const [recoveryCoupon, setRecoveryCoupon] = useState('')
  const [loadingCarts, setLoadingCarts] = useState(false)
  const [recovering, setRecovering] = useState(false)

  const loadCarts = useCallback(async () => {
    setLoadingCarts(true)
    try {
      const res = await fetch('/api/admin/whatsapp/cart-recovery')
      if (res.ok) { const d = await res.json(); setCarts(d.carts) }
    } catch {}
    setLoadingCarts(false)
  }, [])

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      loadCarts()
    })
    return () => cancelAnimationFrame(handle)
  }, [loadCarts])

  async function sendBroadcast() {
    if (!message.trim()) { toast.error('Enter a message'); return }
    if (!confirm(`Send this promo to "${segment}" segment? This cannot be undone.`)) return
    setSending(true)
    try {
      const res = await fetch('/api/admin/whatsapp/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, couponCode: coupon || undefined, segment }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed'); return }
      toast.success(`Sent to ${data.sent}/${data.totalRecipients} (${data.failed} failed)`)
      setMessage(''); setCoupon('')
    } catch { toast.error('Network error') }
    finally { setSending(false) }
  }

  async function sendRecovery(cartId?: string) {
    setRecovering(true)
    try {
      const res = await fetch('/api/admin/whatsapp/cart-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, couponCode: recoveryCoupon || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed'); return }
      toast.success(`Recovery sent: ${data.sent} (${data.failed} failed)`)
      loadCarts()
    } catch { toast.error('Network error') }
    finally { setRecovering(false) }
  }

  return (
    <div className="p-6">
      {!configured && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
          ⚠️ WhatsApp API not configured. Set <code>WHATSAPP_PHONE_NUMBER_ID</code> and <code>WHATSAPP_ACCESS_TOKEN</code> in .env to enable sending.
        </div>
      )}

      <Tabs defaultValue="broadcast">
        <TabsList>
          <TabsTrigger value="broadcast"><MessageCircle className="h-4 w-4 mr-1" />Promo Campaign</TabsTrigger>
          <TabsTrigger value="recovery"><ShoppingCart className="h-4 w-4 mr-1" />Cart Recovery</TabsTrigger>
        </TabsList>

        {/* Broadcast */}
        <TabsContent value="broadcast" className="mt-4">
          <Card className="max-w-2xl">
            <CardHeader><CardTitle className="text-base">Send Promotional Campaign</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Audience Segment</Label>
                <Select value={segment} onValueChange={setSegment}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users (with phone)</SelectItem>
                    <SelectItem value="customers">Customers (ordered ≥1)</SelectItem>
                    <SelectItem value="recent">Recent (last 30 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Message</Label>
                <Textarea rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="🎉 Flat 20% off all dry fruits this weekend! Stock up on healthy snacks..." />
                <p className="text-xs text-neutral-400">{message.length} chars. Customer name + shop link added automatically.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Coupon Code (optional)</Label>
                <Input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="SAVE20" />
              </div>
              <Button onClick={sendBroadcast} disabled={sending || !configured} className="bg-[#25D366] hover:bg-[#20ba5a]">
                <Send className="h-4 w-4 mr-1" />{sending ? 'Sending…' : 'Send Campaign'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cart recovery */}
        <TabsContent value="recovery" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Abandoned Carts ({carts.length})</CardTitle>
              <div className="flex items-center gap-2">
                <Input className="h-8 w-32" value={recoveryCoupon} onChange={e => setRecoveryCoupon(e.target.value.toUpperCase())} placeholder="Coupon (opt)" />
                <Button size="sm" variant="outline" onClick={loadCarts} disabled={loadingCarts}><RefreshCw className={`h-3.5 w-3.5 ${loadingCarts ? 'animate-spin' : ''}`} /></Button>
                <Button size="sm" onClick={() => sendRecovery()} disabled={recovering || !configured || carts.length === 0} className="bg-[#25D366] hover:bg-[#20ba5a]">
                  <Send className="h-3.5 w-3.5 mr-1" />Send All Reminders
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-neutral-600">Customer</th>
                      <th className="text-left px-4 py-2 font-medium text-neutral-600">Phone</th>
                      <th className="text-left px-4 py-2 font-medium text-neutral-600">Items</th>
                      <th className="text-left px-4 py-2 font-medium text-neutral-600">Value</th>
                      <th className="text-left px-4 py-2 font-medium text-neutral-600">Date</th>
                      <th className="text-right px-4 py-2 font-medium text-neutral-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carts.map(c => (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-neutral-50">
                        <td className="px-4 py-2">{c.name || '—'}</td>
                        <td className="px-4 py-2 font-mono text-xs">{c.phone}</td>
                        <td className="px-4 py-2 text-neutral-600 text-xs">{c.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}</td>
                        <td className="px-4 py-2">₹{c.cartValue}</td>
                        <td className="px-4 py-2 text-neutral-500 text-xs">{c.createdAt}</td>
                        <td className="px-4 py-2 text-right">
                          {c.reminderSent
                            ? <Badge variant="secondary" className="text-xs">Sent</Badge>
                            : <Button size="sm" variant="ghost" className="h-7 text-[#25D366]" onClick={() => sendRecovery(c.id)} disabled={recovering || !configured}>Remind</Button>}
                        </td>
                      </tr>
                    ))}
                    {carts.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-neutral-400">No abandoned carts</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
