'use client'

import type React from 'react'
import { SWRConfig } from 'swr'
import QueryProvider from '@/components/query-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import SessionGuard from '@/components/session-guard'
import { AuthProvider } from '@/hooks/use-auth'

function localStorageProvider(): Map<any, any> {
  if (typeof window === 'undefined') {
    return new Map()
  }
  const map = new Map(JSON.parse(localStorage.getItem('app-swr-cache') || '[]'))
  window.addEventListener('beforeunload', () => {
    const appCache = Array.from(map.entries())
    localStorage.setItem('app-swr-cache', JSON.stringify(appCache))
  })
  return map
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 10000,
        revalidateOnFocus: false,
        provider: localStorageProvider,
      }}
    >
      <QueryProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SessionGuard>
              <main className="flex-1">{children}</main>
            </SessionGuard>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </SWRConfig>
  )
}

