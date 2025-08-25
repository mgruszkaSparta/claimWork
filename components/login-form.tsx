"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { getBranding } from '@/lib/branding'

interface LoginFormProps {
  onLogin: (username: string, password: string, rememberMe: boolean) => Promise<void>
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const { logo, name } = getBranding()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await onLogin(username, password, rememberMe)
    } catch (err) {
      setError("Nieprawidłowy login lub hasło")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login form */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-12 bg-white" style={{ flex: "0 0 35%" }}>
        <div className="mx-auto w-full max-w-xs">
          <div className="mb-6">
            <div className="flex items-center mb-4 space-x-2">
              <img src={logo} alt={name} className="h-8 w-8 object-contain" />
              <h1 className="text-lg font-bold text-[#1a3a6c]">{name.toUpperCase()}</h1>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Zaloguj się</h2>

            {/* Demo credentials info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
              <p className="text-xs text-blue-800 font-medium mb-1">Demo dane:</p>
              <p className="text-xs text-blue-600">
                Login: <span className="font-mono">admin</span>
              </p>
              <p className="text-xs text-blue-600">
                Hasło: <span className="font-mono">admin123</span>
              </p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-xs font-medium text-gray-700 mb-1">
                Login
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Wprowadź swój login"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                  Hasło
                </label>
                <button type="button" className="text-xs text-[#1a3a6c] hover:text-[#1a3a6c]/80">
                  Zapomniałeś hasła?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Wprowadź swoje hasło"
                  className="h-8 text-xs pr-8"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-2 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  ) : (
                    <Eye className="h-3 w-3 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3 w-3 text-[#1a3a6c] focus:ring-[#1a3a6c] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-900">
                Zapisz hasło
              </label>
            </div>

            {error && <div className="text-red-600 text-xs text-center">{error}</div>}

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-8 text-xs font-medium rounded-md text-white bg-[#1a3a6c] hover:bg-[#1a3a6c]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a3a6c] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-600">
                Nie masz konta?{" "}
                <button type="button" className="font-medium text-[#1a3a6c] hover:text-[#1a3a6c]/80">
                  Skontaktuj się z nami
                </button>
              </p>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">© 2025 {name}. Wszelkie prawa zastrzeżone.</p>
          </div>
        </div>
      </div>

      {/* Right side - Background image */}
      <div className="relative flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/images/workspace-background.jpg"
          alt="Workspace"
        />
        <div className="absolute inset-0 bg-[#1a3a6c]/10"></div>
      </div>
    </div>
  )
}
