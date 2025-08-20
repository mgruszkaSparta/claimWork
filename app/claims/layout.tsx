'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { useAuth } from '@/hooks/use-auth'

export default function ClaimsLayout({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('claims')
  const { user, logout } = useAuth()
  const isBasicUser =
    user?.roles?.length === 1 && user.roles[0].toLowerCase() === 'user'

  return (
    <div className="min-h-screen bg-gray-50">
      {!isBasicUser && (
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      <div
        className={`${isBasicUser ? '' : 'ml-16'} flex flex-col min-h-screen`}
      >
        <Header onMenuClick={() => {}} user={user ?? undefined} onLogout={logout} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
