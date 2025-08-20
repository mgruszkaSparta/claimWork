'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { useAuth } from '@/hooks/use-auth'

export default function EmailsLayout({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('unassigned')
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="ml-16 flex flex-col min-h-screen">
        <Header onMenuClick={() => {}} user={user ?? undefined} onLogout={logout} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
