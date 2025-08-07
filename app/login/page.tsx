"use client"

import { LoginPanel } from '@/components/login-panel'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LoginPage() {
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock authentication - in real app, this would be an API call
      const mockUsers = [
        { id: '1', username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' },
        { id: '2', username: 'user', password: 'user123', name: 'Jan Kowalski', role: 'user' },
        { id: '3', username: 'expert', password: 'expert123', name: 'Anna Nowak', role: 'expert' },
        { id: '4', username: 'sparta', password: 'sparta2025', name: 'Sparta Brokers', role: 'admin' },
      ]

      const user = mockUsers.find(
        u => u.username === credentials.username && u.password === credentials.password
      )

      if (user) {
        const userData = {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }

        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('isAuthenticated', 'true')

        // Redirect to main page
        router.push('/')
      } else {
        setError('Nieprawidłowa nazwa użytkownika lub hasło.')
      }
    } catch (error) {
      setError('Wystąpił błąd podczas logowania. Spróbuj ponownie.')
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
