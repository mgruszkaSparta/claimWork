"use client"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { LayoutDashboard, FileText, Car, Settings, Calendar, CalendarCheck, BarChart3 } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    id: "claims",
    label: "Szkody",
    icon: FileText,
    href: "/claims",
  },
  {
    id: "vacations",
    label: "Urlopy",
    icon: Calendar,
    href: "/vacations/leaves/my",
  },
  {
    id: "vacation-requests",
    label: "Wnioski urlopowe",
    icon: CalendarCheck,
    href: "/vacations/leaves",
    roles: ["Admin", "admin"],
  },
  {
    id: "reports",
    label: "Raporty",
    icon: BarChart3,
    href: "/reports",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/settings",
    roles: ["Admin", "admin"],
  },
]

export function Sidebar(props: SidebarProps) {
  const { user } = useAuth()
  return (
    <div className="fixed left-0 top-0 z-40 h-full w-16 bg-[#1a3a6c] border-r border-[#2a4a7c] flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-[#2a4a7c] flex items-center justify-center">
        <Car className="h-8 w-8 text-white" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-2">
        {menuItems
          .filter(
            (item) =>
              !item.roles ||
              item.roles.some((role) =>
                user?.roles?.some((r) => r.toLowerCase() === role.toLowerCase())
              )
          )
          .map((item) => {
            const Icon = item.icon
            const isActive = props.activeTab === item.id

          return (
            <Button
              key={item.id}
              asChild
              variant="ghost"
              className={cn(
                "w-full h-12 p-0 flex items-center justify-center transition-all duration-200 rounded-lg",
                isActive
                  ? "bg-white/20 text-white hover:bg-white/25"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
              title={item.label}
            >
              <Link
                href={item.href}
                onClick={() => props.onTabChange(item.id)}
                className="flex items-center"
              >
                <Icon className="h-5 w-5" />
              </Link>
            </Button>
          )
        })}
      </nav>
    </div>
  )
}
