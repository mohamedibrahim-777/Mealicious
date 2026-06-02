export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { format } from 'date-fns'

export default async function SubscribersPage() {
  const subscribers = await db.subscriber.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div>
      <AdminHeader title="Subscribers" />
      <div className="p-6">
        <p className="text-sm text-neutral-500 mb-4">{subscribers.length} total subscribers</p>
        <div className="border rounded-md bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map(s => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3 text-neutral-500">{format(new Date(s.createdAt), 'dd MMM yyyy')}</td>
                </tr>
              ))}
              {subscribers.length === 0 && <tr><td colSpan={2} className="text-center py-10 text-neutral-400">No subscribers yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
