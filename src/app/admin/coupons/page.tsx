import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { CouponsClient } from './CouponsClient'
import { format } from 'date-fns'

export default async function CouponsPage() {
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div>
      <AdminHeader title="Coupons" />
      <CouponsClient coupons={coupons.map(c => ({
        id: c.id, code: c.code, type: c.type, value: c.value, minOrder: c.minOrder,
        maxDiscount: c.maxDiscount, usageLimit: c.usageLimit, usedCount: c.usedCount,
        validFrom: c.validFrom.toISOString().slice(0, 10),
        validTo: c.validTo.toISOString().slice(0, 10),
        isActive: c.isActive,
        validFromDisplay: format(new Date(c.validFrom), 'dd MMM yyyy'),
        validToDisplay: format(new Date(c.validTo), 'dd MMM yyyy'),
      }))} />
    </div>
  )
}
