'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Eye } from 'lucide-react'

interface Message { id: string; name: string; email: string; phone: string; subject: string; message: string; isRead: boolean; date: string }

export function MessagesClient({ messages }: { messages: Message[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [viewing, setViewing] = useState<Message | null>(null)

  async function markRead(id: string) {
    await fetch(`/api/admin/messages/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isRead: true }) })
    startTransition(() => router.refresh())
  }

  function viewMessage(m: Message) {
    setViewing(m)
    if (!m.isRead) markRead(m.id)
  }

  return (
    <div className="p-6">
      <div className="border rounded-md bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">From</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Subject</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-neutral-600">View</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(m => (
              <tr key={m.id} className={`border-b last:border-0 hover:bg-neutral-50 ${!m.isRead ? 'font-semibold' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {m.name}
                    {!m.isRead && <Badge className="h-4 text-xs bg-orange-500 hover:bg-orange-500">New</Badge>}
                  </div>
                  <div className="text-xs text-neutral-400 font-normal">{m.email}</div>
                </td>
                <td className="px-4 py-3">{m.subject}</td>
                <td className="px-4 py-3 text-neutral-500 font-normal">{m.date}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => viewMessage(m)}><Eye className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {messages.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-neutral-400">No messages</td></tr>}
          </tbody>
        </table>
      </div>

      {viewing && (
        <Dialog open onOpenChange={() => setViewing(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{viewing.subject}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 text-neutral-600">
                <div><span className="font-medium">From:</span> {viewing.name}</div>
                <div><span className="font-medium">Email:</span> {viewing.email}</div>
                {viewing.phone && <div><span className="font-medium">Phone:</span> {viewing.phone}</div>}
              </div>
              <div className="border rounded-md p-3 bg-neutral-50 whitespace-pre-wrap text-neutral-700">{viewing.message}</div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
