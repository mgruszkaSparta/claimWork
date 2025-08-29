"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { apiService } from "@/lib/api"

interface User {
  id: string
  username: string
  email?: string
  caseHandlerId?: number
  roles?: string[]
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<any>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    const initialize = async () => {
      try {
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
    const result = await apiService.login(username, password)
    const user = await apiService.getCurrentUser()
    setAuthState({
      user: user || null,
      isAuthenticated: !!user,
      isLoading: false,
    })
    return result
  }

  const logout = async () => {
    try {
      await apiService.logout()
    } catch {
      // ignore errors during logout
    } finally {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false })
    }
  }

  const refreshToken = async () => {
    await apiService.refreshToken()
    const user = await apiService.getCurrentUser()
    setAuthState({
      user: user || null,
      isAuthenticated: !!user,
      isLoading: false,
    })
  }

  const value: AuthContextValue = {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

