'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

export function ProtectedRoute({
  children,
  roles,
  permissions,
}: {
  children: React.ReactNode
  roles?: string[]
  permissions?: string[]
}) {
  const { isAuthenticated, isLoading, user, hasPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else {
        if (
          roles &&
          (!user || !roles.some(r => user.roles?.includes(r)))
        ) {
          router.push('/')
        } else if (
          permissions &&
          !permissions.some(p => hasPermission(p))
        ) {
          router.push('/')
        }
      }
    }
  }, [isLoading, isAuthenticated, user, roles, permissions, router, hasPermission])

  if (!isAuthenticated) return null
  if (roles && (!user || !roles.some(r => user.roles?.includes(r)))) return null
  if (permissions && !permissions.some(p => hasPermission(p))) return null

  return <>{children}</>
}
