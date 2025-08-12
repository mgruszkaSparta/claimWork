'use client'

import { useAuth } from '@/hooks/use-auth'

export default function Footer() {
  const { user } = useAuth()
  return (
    <footer className="p-4 text-center text-sm text-gray-600">
      {user ? `Zalogowany jako ${user.username}` : 'Nie zalogowano'}
    </footer>
  )
}

