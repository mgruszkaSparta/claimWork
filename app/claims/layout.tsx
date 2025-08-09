'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'

export default function ClaimsLayout({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('claims')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => {}} />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
