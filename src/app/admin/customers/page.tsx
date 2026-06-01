import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { CustomersClient } from './CustomersClient'
import { format } from 'date-fns'

async function getCustomers() {
  const users = await db.user.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? '',
    role: u.role,
    orderCount: u._count.orders,
    joined: format(new Date(u.createdAt), 'dd MMM yyyy'),
  }))
}

export default async function CustomersPage() {
  const customers = await getCustomers()
  return (
    <div>
      <AdminHeader title="Customers" />
      <CustomersClient customers={customers} />
    </div>
  )
}
