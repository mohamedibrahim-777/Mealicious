export const dynamic = 'force-dynamic'

import { AdminHeader } from '@/components/admin/AdminHeader'
import { WhatsAppClient } from './WhatsAppClient'
import { isConfigured } from '@/lib/whatsapp'

export default function WhatsAppPage() {
  return (
    <div>
      <AdminHeader title="WhatsApp" />
      <WhatsAppClient configured={isConfigured()} />
    </div>
  )
}
