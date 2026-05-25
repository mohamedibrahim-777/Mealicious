'use client'

import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase'
import { useAppStore } from '@/lib/store'

function AuthBridge() {
  useEffect(() => {
    const auth = getFirebaseAuth()
    if (!auth) return
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser || !fbUser.email) {
        if (useAppStore.getState().isLoggedIn) {
          useAppStore.setState({ isLoggedIn: false, user: null })
        }
        return
      }
      const email = fbUser.email
      const isAdmin = email.toLowerCase() === 'admin@mealicious.com'
      useAppStore.setState({
        isLoggedIn: true,
        user: {
          name: fbUser.displayName ?? email.split('@')[0],
          email,
          phone: fbUser.phoneNumber ?? '',
          role: isAdmin ? 'admin' : 'user',
        },
        currentPage: isAdmin ? 'admin' : 'home',
      })
    })
    return () => unsub()
  }, [])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthBridge />
      {children}
    </>
  )
}
