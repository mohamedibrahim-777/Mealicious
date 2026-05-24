'use client'

import { useEffect } from 'react'
import { SessionProvider, useSession } from 'next-auth/react'
import { useAppStore } from '@/lib/store'

function AuthBridge() {
  const { data: session, status } = useSession()
  const isLoggedIn = useAppStore((s) => s.isLoggedIn)

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return
    if (isLoggedIn) return
    const email = session.user.email
    const isAdmin = email.toLowerCase() === 'admin@mealicious.com'
    useAppStore.setState({
      isLoggedIn: true,
      user: {
        name: session.user.name ?? email.split('@')[0],
        email,
        phone: '',
        role: isAdmin ? 'admin' : 'user',
      },
      currentPage: isAdmin ? 'admin' : 'home',
    })
  }, [status, session, isLoggedIn])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthBridge />
      {children}
    </SessionProvider>
  )
}
