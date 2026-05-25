import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const [productCount, orderCount, userCount, subCount, msgCount, unreadMsgs, lowStock, revenueAgg] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.user.count(),
    db.subscriber.count(),
    db.contactMessage.count(),
    db.contactMessage.count({ where: { isRead: false } }),
    db.product.count({ where: { stock: { lte: 10 } } }),
    db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
  ])

  const recentOrders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { user: true },
  })

  return NextResponse.json({
    counts: {
      products: productCount,
      orders: orderCount,
      users: userCount,
      subscribers: subCount,
      messages: msgCount,
      unreadMessages: unreadMsgs,
      lowStockProducts: lowStock,
    },
    revenue: revenueAgg._sum.total ?? 0,
    recentOrders: recentOrders.map((o) => ({
      id: o.orderNumber,
      customer: o.user?.name ?? 'Guest',
      total: o.total,
      status: o.status,
      date: o.createdAt.toISOString().slice(0, 10),
    })),
  })
}
