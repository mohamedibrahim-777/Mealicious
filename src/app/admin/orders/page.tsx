import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { OrdersClient } from './OrdersClient'
import { format } from 'date-fns'

async function getOrders() {
  const orders = await db.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return orders.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.user?.name ?? 'Guest',
    email: o.user?.email ?? '',
    items: o.items.length,
    total: o.total,
    subtotal: o.subtotal,
    shipping: o.shipping,
    tax: o.tax,
    discount: o.discount,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod ?? '',
    couponCode: o.couponCode ?? '',
    shippingAddr: (() => { try { return JSON.parse(o.shippingAddr) } catch { return {} } })(),
    itemDetails: o.items.map(i => ({
      name: i.name,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
      variant: i.variant ?? '',
      subtotal: i.subtotal,
    })),
    date: format(new Date(o.createdAt), 'dd MMM yyyy'),
  }))
}

export default async function OrdersPage() {
  const orders = await getOrders()
  return (
    <div>
      <AdminHeader title="Orders" />
      <OrdersClient orders={orders} />
    </div>
  )
}
