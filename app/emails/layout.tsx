'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'

export default function EmailsLayout({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('unassigned')
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="ml-16 flex flex-col min-h-screen">
        <Header onMenuClick={() => {}} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
