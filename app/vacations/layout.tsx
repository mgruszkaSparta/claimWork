'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { useAuth } from '@/hooks/use-auth'

export default function VacationsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const initialTab = pathname.startsWith('/vacations/leaves') && !pathname.startsWith('/vacations/leaves/my')
    ? 'vacation-requests'
    : 'vacations'
  const [activeTab, setActiveTab] = useState(initialTab)
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="ml-16 flex flex-col min-h-screen">
        <Header onMenuClick={() => {}} user={user ?? undefined} onLogout={logout} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
