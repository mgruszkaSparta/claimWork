"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Inbox, Send, FileEdit, Star, AlertCircle, Trash2, Shield, Plus, Settings, Archive } from "lucide-react"
import type { EmailFolderDefinition } from "@/types/email"

interface EmailSidebarProps {
  folders: EmailFolderDefinition[]
  activeFolder: string
  onFolderChange: (folderId: string) => void
  onCompose: () => void
}

const folderIcons = {
  Inbox,
  Send,
  FileEdit,
  Star,
  AlertCircle,
  Trash2,
  Shield,
  Archive,
}

export const EmailSidebar = ({ folders, activeFolder, onFolderChange, onCompose }: EmailSidebarProps) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
      <div className="p-4 space-y-4">
        <Button onClick={onCompose} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Napisz
        </Button>

        <div className="space-y-1">
          {folders.map((folder) => {
            const IconComponent = folderIcons[folder.icon as keyof typeof folderIcons] || Inbox
            const isActive = activeFolder === folder.id

            return (
              <Button
                key={folder.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-3",
                  isActive && "bg-blue-50 text-blue-700 hover:bg-blue-50",
                )}
                onClick={() => onFolderChange(folder.id)}
              >
                <IconComponent className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">{folder.name}</span>
                {folder.unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800">
                    {folder.unreadCount}
                  </Badge>
                )}
                {folder.unreadCount === 0 && folder.count > 0 && (
                  <span className="ml-auto text-xs text-gray-500">{folder.count}</span>
                )}
              </Button>
            )
          })}
        </div>

        <div className="border-t pt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Etykiety</h3>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start h-8 px-3 text-sm">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
              Pilne
            </Button>
            <Button variant="ghost" className="w-full justify-start h-8 px-3 text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
              Szkody
            </Button>
            <Button variant="ghost" className="w-full justify-start h-8 px-3 text-sm">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
              Klienci
            </Button>
            <Button variant="ghost" className="w-full justify-start h-8 px-3 text-sm">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
              Warsztaty
            </Button>
          </div>
        </div>

        <div className="border-t pt-4">
          <Button variant="ghost" className="w-full justify-start h-8 px-3 text-sm">
            <Settings className="h-4 w-4 mr-3" />
            Ustawienia
          </Button>
        </div>
      </div>
    </div>
  )
}
