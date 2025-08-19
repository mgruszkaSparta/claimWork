"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  AlertTriangle,
  Users,
  File,
  MessageSquare,
  FileCheck,
  Mail,
  Calendar,
  Wrench,
  Gavel,
  Shield,
  DollarSign,
  HandHeart,
  FileSignature,
  UserCheck,
} from 'lucide-react'

interface ClaimFormSidebarProps {
  activeClaimSection: string
  setActiveClaimSection: (section: string) => void
  claimObjectType?: string
}

const sidebarSections = [
  {
    id: "podstawowe",
    title: "PODSTAWOWE",
    items: [
      {
        id: "teczka-szkodowa",
        label: "Teczka szkodowa",
        icon: FileText,
      },
      {
        id: "dane-zdarzenia",
        label: "Dane zdarzenia i szkody",
        icon: AlertTriangle,
      },
      {
        id: "uczestnicy",
        label: "Uczestnicy zdarzenia",
        icon: Users,
      },
      {
        id: "podwykonawca",
        label: "Podwykonawca",
        icon: UserCheck,
      },
      {
        id: "dokumenty",
        label: "Dokumenty",
        icon: File,
      },
    ],
  },
  {
    id: "dodatkowe",
    title: "DODATKOWE",
    items: [
      {
        id: "notatki",
        label: "Notatki",
        icon: MessageSquare,
      },
      {
        id: "pisma",
        label: "Pisma",
        icon: FileCheck,
      },
      {
        id: "email",
        label: "E-mail",
        icon: Mail,
      },
      {
        id: "harmonogram",
        label: "Harmonogram",
        icon: Calendar,
      },
      {
        id: "naprawa",
        label: "Naprawa",
        icon: Wrench,
      },
    ],
  },
  {
    id: "roszczenia",
    title: "ROSZCZENIA",
    items: [
      {
        id: "decyzje",
        label: "Decyzje",
        icon: Gavel,
      },
      {
        id: "odwolanie",
        label: "Odwołanie",
        icon: Shield,
      },
      {
        id: "regres",
        label: "Regres",
        icon: DollarSign,
      },
      {
        id: "ugody",
        label: "Ugody",
        icon: HandHeart,
      },
      {
        id: "roszczenia",
        label: "Roszczenia",
        icon: FileSignature,
      },
    ],
  },
]

function ClaimFormSidebar({ activeClaimSection, setActiveClaimSection, claimObjectType }: ClaimFormSidebarProps) {
  const sections = sidebarSections.map((section) => {
    let items = section.items
    if (claimObjectType === "3") {
      items = items.filter((item) => item.id !== "uczestnicy")
    } else {
      items = items.filter((item) => item.id !== "podwykonawca")
    }
    return { ...section, items }
  })
  return (
    <div className="sticky top-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
      <div className="p-3">
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="space-y-3">
              {/* Section Header */}
              <div className="flex items-center space-x-2 px-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{section.title}</h3>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeClaimSection === item.id

                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`w-full justify-start h-auto p-3 text-left transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      onClick={() => setActiveClaimSection(item.id)}
                    >
                      <div className="flex items-start space-x-3 w-full">
                        <div className={`mt-0.5 ${isActive ? "text-blue-600" : "text-gray-400"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${isActive ? "text-blue-700" : "text-gray-900"}`}>
                            {item.label}
                          </div>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>

              {/* Separator between sections (except last) */}
              {sectionIndex < sections.length - 1 && (
                <div className="pt-2">
                  <Separator className="bg-gray-100" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Export with the old name for backward compatibility
export { ClaimFormSidebar }
