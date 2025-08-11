"use client"

import { LoginPanel } from '@/components/login-panel'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { isAuthenticated, login } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleLogin = async (credentials: { username: string; password: string }) => {
    setIsLoading(true)
    setError('')

    try {
      await login(credentials.username, credentials.password)
      router.push('/')
    } catch (error) {
      setError('Nieprawidłowa nazwa użytkownika lub hasło.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <LoginPanel
        onLogin={handleLogin}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
