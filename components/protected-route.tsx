'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

export function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode
  roles?: string[]
}) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (
        roles &&
        (!user || !roles.some(r => user.roles?.includes(r)))
      ) {
        router.push('/')
      }
    }
  }, [isLoading, isAuthenticated, user, roles, router])

  if (!isAuthenticated) return null
  if (roles && (!user || !roles.some(r => user.roles?.includes(r)))) return null

  return <>{children}</>
}
