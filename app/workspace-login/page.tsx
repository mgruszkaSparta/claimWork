"use client"

import { WorkspaceLoginPanel } from '@/components/workspace-login-panel'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function WorkspaceLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    if (isAuthenticated === 'true') {
      router.push('/')
    }
  }, [router])

  const handleLogin = async (credentials: { username: string; password: string }) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: credentials.username, password: credentials.password })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        setError(errorData?.message || 'Nieprawidłowy login lub hasło.')
        return
      }

      const data = await response.json().catch(() => null)
      if (data?.token) {
        localStorage.setItem('token', data.token)
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      localStorage.setItem('isAuthenticated', 'true')

      router.push('/')
    } catch (error) {
      setError('Wystąpił błąd podczas logowania. Spróbuj ponownie.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <WorkspaceLoginPanel
        onLogin={handleLogin}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
