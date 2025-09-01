'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Header } from '@/components/header'
import { Sidebar } from '@/components/sidebar'
import { ProtectedRoute } from '@/components/protected-route'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Użytkownicy' },
  { href: '/admin/roles', label: 'Role' },
  { href: '/admin/permissions', label: 'Uprawnienia' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState('settings')
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <ProtectedRoute roles={["Admin", "admin"]}>
      <div className="min-h-screen bg-gray-50">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="ml-16 flex flex-col min-h-screen">
          <Header onMenuClick={() => {}} user={user ?? undefined} onLogout={logout} />
          <div className="flex flex-1">
            <nav className="w-48 border-r bg-white p-4 space-y-2">
              {ADMIN_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100',
                    pathname === item.href ? 'bg-gray-100 text-[#1a3a6c]' : 'text-gray-700',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
