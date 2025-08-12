'use client'

import React, { useState } from 'react'
import { LoginPanel } from './login-panel'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'

interface AuthWrapperProps {
  children: React.ReactNode
}

interface User {
  username: string
  email?: string
  roles?: string[]
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, login, logout, user, isLoading } = useAuth()
  const [loginError, setLoginError] = useState<string>('')
  const { toast } = useToast()

  const handleLogin = async (credentials: { username: string; password: string }) => {
    setLoginError('')
    try {
      await login(credentials.username, credentials.password)
      toast({
        title: 'Zalogowano pomyślnie',
        description: `Witaj, ${credentials.username}!`
      })
    } catch {
      setLoginError('Nieprawidłowa nazwa użytkownika lub hasło.')
    }
  }

  if (!isAuthenticated) {
    return <LoginPanel onLogin={handleLogin} isLoading={isLoading} error={loginError} />
  }

  // Provide user context to children
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        user,
        onLogout: logout
      } as any)
    }
    return child
  })

  return <>{childrenWithProps}</>
}

export default AuthWrapper
