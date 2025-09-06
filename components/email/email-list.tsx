"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Search,
  Filter,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  Paperclip,
  Flag,
  ChevronDown,
  RefreshCw,
} from "lucide-react"
import type { Email } from "@/types/email"

interface EmailListProps {
  emails: Email[]
  selectedEmails: string[]
  onEmailSelect: (emailId: string) => void
  onEmailClick: (email: Email) => void
  onSelectAll: (checked: boolean) => void
  onStarEmail: (emailId: string) => void
  onImportantEmail: (emailId: string) => void
  onArchiveEmails: (emailIds: string[]) => void
  onDeleteEmails: (emailIds: string[]) => void
  onMarkAsRead: (emailIds: string[], isRead: boolean) => void
}

export const EmailList = ({
  emails,
  selectedEmails,
  onEmailSelect,
  onEmailClick,
  onSelectAll,
  onStarEmail,
  onImportantEmail,
  onArchiveEmails,
  onDeleteEmails,
  onMarkAsRead,
}: EmailListProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("date")

  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays <= 7) {
      return date.toLocaleDateString("pl-PL", { weekday: "short" })
    } else {
      return date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const allSelected = selectedEmails.length === emails.length && emails.length > 0
  const someSelected = selectedEmails.length > 0 && selectedEmails.length < emails.length

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected
              }}
              onCheckedChange={(checked) => onSelectAll(!!checked)}
            />
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            {selectedEmails.length > 0 && (
              <>
                <Button variant="ghost" size="sm" onClick={() => onArchiveEmails(selectedEmails)}>
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDeleteEmails(selectedEmails)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onMarkAsRead(selectedEmails, true)}>
                  <MailOpen className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onMarkAsRead(selectedEmails, false)}>
                  <Mail className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {filteredEmails.length} z {emails.length}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Szukaj w e-mailach..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtry
          </Button>
          <Button variant="outline" size="sm">
            <ChevronDown className="h-4 w-4 mr-2" />
            Sortuj: Data
          </Button>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Brak e-maili</p>
              <p className="text-sm">Nie znaleziono e-maili w tej kategorii</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                className={cn(
                  "flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                  !email.isRead && "bg-blue-50/30",
                  selectedEmails.includes(email.id) && "bg-blue-100",
                )}
                onClick={() => onEmailClick(email)}
              >
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <Checkbox
                    checked={selectedEmails.includes(email.id)}
                    onCheckedChange={() => onEmailSelect(email.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      onStarEmail(email.id)
                    }}
                  >
                    <Star
                      className={cn("h-4 w-4", email.isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400")}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      onImportantEmail(email.id)
                    }}
                  >
                    <Flag
                      className={cn(
                        "h-4 w-4",
                        email.isImportant ? "text-red-500" : "text-gray-400",
                      )}
                    />
                  </Button>
                </div>

                <div className="flex-1 min-w-0 ml-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className={cn("font-medium truncate", !email.isRead ? "text-gray-900" : "text-gray-600")}>
                        {email.fromName}
                      </span>
                      {email.claimIds && email.claimIds.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {email.claimIds.join(", ")}
                        </Badge>
                      )}
                      {email.labels.map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {email.attachments.length > 0 && <Paperclip className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm text-gray-500">{formatDate(email.date)}</span>
                    </div>
                  </div>

                  <div className="mb-1">
                    <span
                      className={cn(
                        "text-sm truncate block",
                        !email.isRead ? "font-medium text-gray-900" : "text-gray-600",
                      )}
                    >
                      {email.subject}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 truncate">{email.body.substring(0, 100)}...</span>
                    {email.attachments.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-gray-400 ml-2">
                        <Paperclip className="h-3 w-3" />
                        <span>{email.attachments.length}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
