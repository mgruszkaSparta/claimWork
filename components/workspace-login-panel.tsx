'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Lock, User, LogIn, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface WorkspaceLoginPanelProps {
  onLogin: (credentials: { username: string; password: string }) => void
  isLoading?: boolean
  error?: string
}

export const WorkspaceLoginPanel: React.FC<WorkspaceLoginPanelProps> = ({ 
  onLogin, 
  isLoading = false, 
  error 
}) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!credentials.username.trim() || !credentials.password.trim()) {
      toast({
        title: "Błąd",
        description: "Proszę wypełnić wszystkie pola.",
        variant: "destructive",
      })
      return
    }

    onLogin(credentials)
  }

  const handleInputChange = (field: 'username' | 'password', value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-4 pb-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                  <Lock className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">SPARTA BROKERS</span>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Zaloguj się
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  Wprowadź swoje dane logowania
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Login
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Wprowadź swój login"
                      value={credentials.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Hasło
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Zapomniałeś hasła?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Wprowadź hasło"
                      value={credentials.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Logowanie...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogIn className="h-4 w-4" />
                      <span>Zaloguj się</span>
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
                  onClick={() => {
                    toast({
                      title: "Kontakt z administratorem",
                      description: "Skontaktuj się z administratorem systemu w celu uzyskania dostępu.",
                    })
                  }}
                >
                  Nie masz konta? Skontaktuj się z administratorem
                </button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-xs text-gray-500">
            <p>System zarządzania szkodami samochodowymi</p>
            <p className="mt-1">© 2025 Sparta Brokers. Wszystkie prawa zastrzeżone</p>
          </div>
        </div>
      </div>

      {/* Right side - Background Image */}
      <div 
        className="hidden lg:block lg:w-1/2 relative"
        style={{
          backgroundImage: 'url(/images/workspace-background-new.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-blue-600/30"></div>
        <div className="absolute bottom-8 left-8 right-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nowoczesne zarządzanie szkodami
            </h3>
            <p className="text-gray-700 text-sm">
              Kompleksowy system do obsługi szkód samochodowych. 
              Zarządzaj sprawami, dokumentami i komunikacją w jednym miejscu.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkspaceLoginPanel
