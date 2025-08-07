'use client'

import React, { useState, useEffect } from 'react'
import { LoginPanel } from './login-panel'
import { useToast } from '@/hooks/use-toast'

interface AuthWrapperProps {
  children: React.ReactNode
}

interface User {
  id: string
  username: string
  name: string
  role: string
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string>('')
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()

  // Check if user is already logged in on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedAuth = localStorage.getItem('isAuthenticated')
    
    if (savedUser && savedAuth === 'true') {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')
      }
    }
  }, [])

  const handleLogin = async (credentials: { username: string; password: string }) => {
    setIsLoading(true)
    setLoginError('')

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock authentication - in real app, this would be an API call
      const mockUsers = [
        { id: '1', username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' },
        { id: '2', username: 'user', password: 'user123', name: 'Jan Kowalski', role: 'user' },
        { id: '3', username: 'expert', password: 'expert123', name: 'Anna Nowak', role: 'expert' },
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

        setUser(userData)
        setIsAuthenticated(true)
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('isAuthenticated', 'true')

        toast({
          title: "Zalogowano pomyślnie",
          description: `Witaj, ${user.name}!`,
        })
      } else {
        setLoginError('Nieprawidłowa nazwa użytkownika lub hasło.')
      }
    } catch (error) {
      setLoginError('Wystąpił błąd podczas logowania. Spróbuj ponownie.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    
    toast({
      title: "Wylogowano",
      description: "Zostałeś pomyślnie wylogowany.",
    })
  }

  // Provide user context to children
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { 
        user, 
        onLogout: handleLogout 
      } as any)
    }
    return child
  })

  if (!isAuthenticated) {
    return (
      <LoginPanel
        onLogin={handleLogin}
        isLoading={isLoading}
        error={loginError}
      />
    )
  }

  return <>{childrenWithProps}</>
}

export default AuthWrapper
