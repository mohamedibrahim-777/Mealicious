'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Search, Eye, FileText } from 'lucide-react'

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

interface OrderItem { name: string; image: string; price: number; quantity: number; variant: string; subtotal: number }
interface Order {
  id: string; orderNumber: string; customer: string; email: string; items: number
  total: number; subtotal: number; shipping: number; tax: number; discount: number
  status: string; paymentStatus: string; paymentMethod: string; couponCode: string
  shippingAddr: Record<string, string>; itemDetails: OrderItem[]; date: string
}

export function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewing, setViewing] = useState<Order | null>(null)

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) { toast.success('Status updated'); startTransition(() => router.refresh()) }
    else toast.error('Failed')
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input className="pl-9" placeholder="Search orders…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Order</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Items</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Total</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Payment</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{o.customer}</div>
                  <div className="text-xs text-neutral-400">{o.email}</div>
                </td>
                <td className="px-4 py-3">{o.items}</td>
                <td className="px-4 py-3 font-medium">₹{o.total.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">{o.paymentStatus}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                    <SelectTrigger className={`h-7 text-xs w-32 ${STATUS_COLORS[o.status] || ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.filter(s => s !== 'all').map(s => (
                        <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-neutral-500 text-xs">{o.date}</td>
                <td className="px-4 py-3 text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => setViewing(o)}><Eye className="h-4 w-4" /></Button>
                  <a href={`/api/admin/invoices/${o.id}`} target="_blank" rel="noreferrer">
                    <Button size="icon" variant="ghost" title="Download GST Invoice"><FileText className="h-4 w-4" /></Button>
                  </a>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-neutral-400">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {viewing && (
        <Dialog open onOpenChange={() => setViewing(null)}>
          <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order {viewing.orderNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2 text-neutral-600">
                <div><span className="font-medium">Customer:</span> {viewing.customer}</div>
                <div><span className="font-medium">Email:</span> {viewing.email}</div>
                <div><span className="font-medium">Payment:</span> {viewing.paymentMethod || '-'}</div>
                <div><span className="font-medium">Coupon:</span> {viewing.couponCode || '-'}</div>
              </div>
              <div className="border rounded-md p-3 bg-neutral-50">
                <p className="font-medium mb-1">Shipping Address</p>
                <p className="text-neutral-600">{[viewing.shippingAddr.name, viewing.shippingAddr.address, viewing.shippingAddr.city, viewing.shippingAddr.state, viewing.shippingAddr.pincode].filter(Boolean).join(', ')}</p>
              </div>
              <div>
                <p className="font-medium mb-2">Items</p>
                {viewing.itemDetails.map((item, i) => (
                  <div key={i} className="flex justify-between py-1.5 border-b last:border-0">
                    <div>{item.name}{item.variant ? ` (${item.variant})` : ''} × {item.quantity}</div>
                    <div>₹{item.subtotal}</div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{viewing.subtotal}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>₹{viewing.shipping}</span></div>
                {viewing.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{viewing.discount}</span></div>}
                <div className="flex justify-between"><span>Tax</span><span>₹{viewing.tax}</span></div>
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>₹{viewing.total}</span></div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
