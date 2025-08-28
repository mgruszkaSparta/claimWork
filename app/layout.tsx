import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import Providers from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Automotive Claims API",
  description: "System zarządzania szkodami komunikacyjnymi",
  generator: "v0.dev",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const res = await fetch("http://34.118.17.116/admin", { cache: "no-store" })
  const remoteHtml = await res.text()
  const headMatch = remoteHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
  const bodyMatch = remoteHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const headContent = headMatch ? headMatch[1] : ""
  const bodyContent = bodyMatch ? bodyMatch[1] : remoteHtml
  const fontStyles = `
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}`
  return (
    <html lang="pl" suppressHydrationWarning>
      <head
        dangerouslySetInnerHTML={{
          __html: `<style>${fontStyles}</style>${headContent}`,
        }}
      />
      <body className="min-h-screen bg-background">
        <Providers>
          <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
          {children}
        </Providers>
      </body>
    </html>
  )
}
