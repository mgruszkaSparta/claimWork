'use client'

import { Button } from '@/components/ui/button'
import { Menu, User, LogOut, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface User {
  username: string
  email?: string
  roles?: string[]
}

interface HeaderProps {
  onMenuClick: () => void
  user?: User
  onLogout?: () => void
}

export function Header({ onMenuClick, user, onLogout }: HeaderProps) {
  const { refreshToken, logout } = useAuth()
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const [aboutToLogout, setAboutToLogout] = useState(false)
  const [sessionRefresh, setSessionRefresh] = useState(0)
  const [sessionExpired, setSessionExpired] = useState(false)
  const warningShown = useRef(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'Admin':
      case 'admin':
        return 'Administrator'
      case 'expert':
        return 'Ekspert'
      case 'User':
      case 'user':
        return 'Użytkownik'
      default:
        return role || ''
    }
  }

  const handleRefresh = async () => {
    try {
      await refreshToken()
      warningShown.current = false
      setAboutToLogout(false)
      setSessionRefresh((c) => c + 1)
    } catch {
      alert('Nie udało się odświeżyć tokena. Zaloguj się ponownie.')
      await logout()
      router.push('/login')
    }
  }

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return

    let payload: { exp?: number } | null = null
    try {
      payload = JSON.parse(atob(token.split('.')[1]))
    } catch {
      payload = null
    }
    if (!payload?.exp) return

    const exp = payload.exp * 1000

    let interval: ReturnType<typeof setInterval> | null = null

    const updateTimer = () => {
      const remaining = exp - Date.now()
      if (remaining <= 0) {
        setTimeLeft(null)
        if (interval) clearInterval(interval)
        void logout().finally(() => {
          setSessionExpired(true)
        })
        return
      }
      if (remaining <= 60000) {
        setAboutToLogout(true)
        if (!warningShown.current) {
          alert('System wkrótce Cię wyloguje. Odśwież token aby pozostać zalogowanym.')
          warningShown.current = true
        }
      } else {
        setAboutToLogout(false)
      }
      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    updateTimer()
    interval = setInterval(updateTimer, 1000)
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [logout, router, sessionRefresh])

  return (
    <>
      <AlertDialog open={sessionExpired} onOpenChange={setSessionExpired}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sesja wygasła</AlertDialogTitle>
            <AlertDialogDescription>Zostałeś wylogowany.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setSessionExpired(false)
                window.location.href = '/login'
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-gray-600">
              {user ? `Zalogowany jako ${user.username}` : 'Nie zalogowano'}
              {user && timeLeft ? ` | Czas sesji: ${timeLeft}` : ''}
              {aboutToLogout ? ' | System wkrótce Cię wyloguje' : ''}
              {user && timeLeft && (
                <button onClick={handleRefresh} className="ml-2 underline">
                  Odśwież token
                </button>
              )}
            </div>
            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user.username}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getRoleLabel(user.roles?.[0])}
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {getRoleLabel(user.roles?.[0])}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  {user?.roles?.some((r) => r.toLowerCase() === 'admin') && (
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Ustawienia</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      if (onLogout) {
                        onLogout()
                        window.location.href = '/login'
                      }
                    }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Wyloguj się</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
