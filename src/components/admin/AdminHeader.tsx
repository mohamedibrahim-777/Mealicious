import { getAdminSession } from '@/lib/admin-session'

export async function AdminHeader({ title }: { title: string }) {
  const session = await getAdminSession()
  return (
    <header className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-neutral-800">{title}</h1>
      <span className="text-sm text-neutral-500">{session?.email}</span>
    </header>
  )
}
