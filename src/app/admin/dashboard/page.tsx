export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { OrdersDonut } from '@/components/admin/OrdersDonut'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { subDays, format } from 'date-fns'

async function getDashboardData() {
  const [orders, products, users, messages] = await Promise.all([
    db.order.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } }),
    db.product.findMany(),
    db.user.findMany(),
    db.contactMessage.findMany({ where: { isRead: false } }),
  ])

  const revenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((s, o) => s + o.total, 0)

  const today = new Date()
  const revenueByDay = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, 29 - i)
    const dateStr = format(date, 'MMM d')
    const dayRevenue = orders
      .filter(o => {
        const d = new Date(o.createdAt)
        return d.toDateString() === date.toDateString() && o.paymentStatus === 'paid'
      })
      .reduce((s, o) => s + o.total, 0)
    return { date: dateStr, revenue: dayRevenue }
  })

  const statusCounts = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => ({
    status,
    count: orders.filter(o => o.status === status).length,
  })).filter(d => d.count > 0)

  const lowStock = products.filter(p => p.stock < p.lowStock).length

  return {
    revenue,
    orderCount: orders.length,
    productCount: products.length,
    userCount: users.length,
    unreadMessages: messages.length,
    lowStock,
    revenueByDay,
    statusCounts,
    recentOrders: orders.slice(0, 10).map(o => ({
      orderNumber: o.orderNumber,
      customer: o.user?.name ?? 'Guest',
      total: o.total,
      status: o.status,
      date: format(new Date(o.createdAt), 'dd MMM'),
    })),
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  return (
    <div>
      <AdminHeader title="Dashboard" />
      <div className="p-6 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Revenue (30 days)</CardTitle></CardHeader>
            <CardContent><RevenueChart data={data.revenueByDay} /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium">Orders by Status</CardTitle></CardHeader>
            <CardContent>
              {data.statusCounts.length > 0
                ? <OrdersDonut data={data.statusCounts} />
                : <p className="text-sm text-neutral-400 py-10 text-center">No orders yet</p>
              }
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Recent Orders</CardTitle></CardHeader>
          <CardContent>
            {data.recentOrders.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-neutral-500">
                    <th className="text-left py-2 font-medium">Order</th>
                    <th className="text-left py-2 font-medium">Customer</th>
                    <th className="text-left py-2 font-medium">Total</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-left py-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map(o => (
                    <tr key={o.orderNumber} className="border-b last:border-0">
                      <td className="py-2 font-mono text-xs">{o.orderNumber}</td>
                      <td className="py-2">{o.customer}</td>
                      <td className="py-2">₹{o.total.toLocaleString('en-IN')}</td>
                      <td className="py-2"><Badge variant="outline">{o.status}</Badge></td>
                      <td className="py-2 text-neutral-500">{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-neutral-400 py-6 text-center">No orders yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
