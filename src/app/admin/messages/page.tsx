export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { MessagesClient } from './MessagesClient'
import { format } from 'date-fns'

export default async function MessagesPage() {
  const messages = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div>
      <AdminHeader title="Messages" />
      <MessagesClient messages={messages.map(m => ({
        id: m.id, name: m.name, email: m.email, phone: m.phone ?? '',
        subject: m.subject, message: m.message, isRead: m.isRead,
        date: format(new Date(m.createdAt), 'dd MMM yyyy'),
      }))} />
    </div>
  )
}
