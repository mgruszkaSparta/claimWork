"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"

interface User {
  username: string
  email?: string
  roles?: string[]
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

  useEffect(() => {
    const initialize = async () => {
      try {
        await apiService.fetchAntiforgery()
        const user = await apiService.getCurrentUser()
        setAuthState({
          user: user || null,
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
    setAuthState({
      user: user || null,
      isAuthenticated: !!user,
      isLoading: false,
    })
  }

  const logout = async () => {
    await apiService.logout()
    setAuthState({ user: null, isAuthenticated: false, isLoading: false })
  }

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
  }
}
