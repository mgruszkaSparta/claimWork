'use client'

import { useAuth } from '@/hooks/use-auth'
import { useEffect, useRef, useState } from 'react'
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

export default function Footer() {
  const { user, logout, refreshToken } = useAuth()
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const [aboutToLogout, setAboutToLogout] = useState(false)
  const [sessionRefresh, setSessionRefresh] = useState(0)
  const [sessionExpired, setSessionExpired] = useState(false)
  const warningShown = useRef(false)

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
      <footer className="p-4 text-center text-sm text-gray-600">
        {user ? `Zalogowany jako ${user.username}` : 'Nie zalogowano'}
        {user && timeLeft ? ` | Czas sesji: ${timeLeft}` : ''}
        {aboutToLogout ? ' | System wkrótce Cię wyloguje' : ''}
        {user && timeLeft && (
          <button onClick={handleRefresh} className="ml-2 underline">
            Odśwież token
          </button>
        )}
      </footer>
    </>
  )
}

