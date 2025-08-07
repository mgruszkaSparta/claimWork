"use client"

import { useState, useEffect } from "react"

interface User {
  username: string
  email?: string
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
    // Check for existing session on mount
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("sparta_user")
        const sessionUser = sessionStorage.getItem("sparta_user")

        if (storedUser || sessionUser) {
          const userData = JSON.parse(storedUser || sessionUser || "{}")
          setAuthState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string, rememberMe: boolean) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Demo credentials
    if (username === "admin" && password === "admin123") {
      const userData: User = {
        username,
        email: "admin@spartabrokers.pl",
      }

      // Store in appropriate storage based on remember me
      if (rememberMe) {
        localStorage.setItem("sparta_user", JSON.stringify(userData))
      } else {
        sessionStorage.setItem("sparta_user", JSON.stringify(userData))
      }

      setAuthState({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      throw new Error("Invalid credentials")
    }
  }

  const logout = () => {
    localStorage.removeItem("sparta_user")
    sessionStorage.removeItem("sparta_user")
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
  }
}
