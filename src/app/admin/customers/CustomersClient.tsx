'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

interface Customer {
  id: string; name: string; email: string; phone: string; role: string; orderCount: number; joined: string
}

export function CustomersClient({ customers }: { customers: Customer[] }) {
  const [search, setSearch] = useState('')

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  return (
    <div className="p-6">
      <div className="relative w-72 mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input className="pl-9" placeholder="Search customers…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="border rounded-md bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Orders</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-neutral-600">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-neutral-600">{c.email}</td>
                <td className="px-4 py-3 text-neutral-600">{c.phone || '-'}</td>
                <td className="px-4 py-3">{c.orderCount}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{c.role}</Badge>
                </td>
                <td className="px-4 py-3 text-neutral-500">{c.joined}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-neutral-400">No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
