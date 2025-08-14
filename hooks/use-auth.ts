"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"

interface User {
  username: string
  email?: string
  roles?: string[]
  permissions?: string[]
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const ROLE_PERMISSIONS: Record<string, string[]> = {
    Owner: [
      "users.read",
      "users.create",
      "users.update",
      "users.delete",
      "users.invite",
      "users.assignRoles",
    ],
    Admin: [
      "users.read",
      "users.create",
      "users.update",
      "users.delete",
      "users.invite",
      "users.assignRoles",
    ],
    Manager: ["users.read", "users.create", "users.update", "users.invite"],
    Viewer: ["users.read"],
  }

  const computePermissions = (user?: { roles?: string[]; permissions?: string[] }) => {
    if (!user) return []
    if (user.permissions) return user.permissions
    const perms = new Set<string>()
    user.roles?.forEach(r => {
      ROLE_PERMISSIONS[r]?.forEach(p => perms.add(p))
    })
    return Array.from(perms)
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await apiService.getCurrentUser()
        const permissions = computePermissions(user)
        setAuthState({
          user: user ? { ...user, permissions } : null,
          isAuthenticated: !!user,
          isLoading: false,
        })
      } catch {
        setAuthState({ user: null, isAuthenticated: false, isLoading: false })
      }
    }
    initialize()
  }, [])

  const login = async (username: string, password: string) => {
    await apiService.login(username, password)
    const user = await apiService.getCurrentUser()
    const permissions = computePermissions(user)
    setAuthState({
      user: user ? { ...user, permissions } : null,
      isAuthenticated: !!user,
      isLoading: false,
    })
  }

  const logout = async () => {
    await apiService.logout()
    setAuthState({ user: null, isAuthenticated: false, isLoading: false })
  }

  const hasPermission = (perm: string) => authState.user?.permissions?.includes(perm) ?? false

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
    hasPermission,
  }
}
