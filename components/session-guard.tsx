'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { apiService } from '@/lib/api'

const publicPaths = ['/login', '/forgot-password', '/reset-password', '/workspace-login']

export default function SessionGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [apiAvailable, setApiAvailable] = useState(true)

  useEffect(() => {
    const verify = async () => {
      try {
        await apiService.checkHealth()
        setApiAvailable(true)
      } catch {
        setApiAvailable(false)
        try {
          await logout()
        } catch {
          // ignore logout errors
        }
      }
    }
    verify()
  }, [logout, pathname])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !publicPaths.includes(pathname)) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, pathname, router])

  if (!apiAvailable) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Przerwa techniczna
      </div>
    )
  }

  if (!isLoading && !isAuthenticated && !publicPaths.includes(pathname)) {
    return null
  }

  return <>{children}</>
}

