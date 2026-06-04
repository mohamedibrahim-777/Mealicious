export const dynamic = 'force-dynamic'

import { AdminHeader } from '@/components/admin/AdminHeader'
import { PushClient } from './PushClient'

export default function PushPage() {
  return (
    <div>
      <AdminHeader title="Push Notifications" />
      <PushClient />
    </div>
  )
}
