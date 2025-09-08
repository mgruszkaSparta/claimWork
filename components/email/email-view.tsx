"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Reply,
  ReplyAll,
  Forward,
  Star,
  Archive,
  Trash2,
  Flag,
  MoreVertical,
  Download,
  Eye,
  Paperclip,
  ChevronLeft,
  PrinterIcon as Print,
  Move,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import type { Email } from "@/types/email"
import type { RequiredDocument } from "@/types"
import { emailService } from "@/lib/email-service"
import type { EmailAttachment } from "@/types/email"
import { DocumentPreview, type FileType } from "@/components/document-preview"

interface EmailViewProps {
  email: Email
  onReply: (email: Email) => void
  onReplyAll: (email: Email) => void
  onForward: (email: Email) => void
  onBack: () => void
  onStar: (emailId: string) => void
  onImportant: (emailId: string) => void
  onArchive: (emailId: string) => void
  onDelete: (emailId: string) => void
  requiredDocuments?: RequiredDocument[]
  onTransferAttachment?: (
    attachment: EmailAttachment,
    move: boolean,
    category: string,
  ) => void
}

export const EmailView = ({
  email,
  onReply,
  onReplyAll,
  onForward,
  onBack,
  onStar,
  onImportant,
  onArchive,
  onDelete,
  requiredDocuments = [],
  onTransferAttachment,
}: EmailViewProps) => {
  const [showFullHeaders, setShowFullHeaders] = useState(false)
  const availableDocs = requiredDocuments
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [previewedAttachment, setPreviewedAttachment] = useState<{
    attachment: EmailAttachment
    url: string
    type: FileType
  } | null>(null)

  const [previewIndex, setPreviewIndex] = useState<number | null>(null)


  useEffect(() => {
    const urls: Record<string, string> = {}
    const loadImages = async () => {
      for (const att of email.attachments) {
        if (att.type?.startsWith("image/")) {
          try {
            const blob = await emailService.downloadAttachment(att.id)
            if (blob) {
              urls[att.id] = URL.createObjectURL(blob)
            }
          } catch (err) {
            console.error("Failed to load image attachment", err)
          }
        }
      }
      setImageUrls(urls)
    }
    loadImages()
    return () => {
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u))
    }
  }, [email])

  const downloadAttachment = useCallback(async (attachment: EmailAttachment) => {
    try {
      const blob = await emailService.downloadAttachment(attachment.id)
      if (blob) {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = attachment.name || "attachment"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error("Error downloading attachment", err)
    }
  }, [])

  const getFileType = (attachment: EmailAttachment): FileType => {
    const name = attachment.name?.toLowerCase() || ""
    const extension = name.split(".").pop()
    const mime = attachment.type
    if (mime?.includes("pdf") || extension === "pdf") return "pdf"
    if (mime?.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension || ""))
      return "image"
    if (
      mime === "application/vnd.google-earth.kmz" ||
      extension === "kmz"
    )
      return "kmz"
    if (
      mime === "application/vnd.ms-excel" ||
      mime ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      ["xls", "xlsx"].includes(extension || "")
    )
      return "excel"
    if (
      mime === "application/msword" ||
      mime ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ["doc", "docx"].includes(extension || "")
    )
      return "docx"
    return "other"
  }

  const previewAttachment = useCallback(
    async (attachment: EmailAttachment, index: number) => {
    try {
      const blob = await emailService.downloadAttachment(attachment.id)
      if (blob) {

        if (previewedAttachment?.url.startsWith("blob:")) {
          URL.revokeObjectURL(previewedAttachment.url)
        }
        const url = URL.createObjectURL(blob)
        const type = getFileType(attachment)
        setPreviewedAttachment({ attachment, url, type })
        setPreviewIndex(index)

      }
    } catch (err) {
      console.error("Error previewing attachment", err)
    }
  }, [previewedAttachment])

  const showNextAttachment = useCallback(() => {
    if (previewIndex === null) return
    const nextIndex = (previewIndex + 1) % email.attachments.length
    previewAttachment(email.attachments[nextIndex], nextIndex)
  }, [previewIndex, email.attachments, previewAttachment])

  const showPrevAttachment = useCallback(() => {
    if (previewIndex === null) return
    const prevIndex =
      (previewIndex - 1 + email.attachments.length) % email.attachments.length
    previewAttachment(email.attachments[prevIndex], prevIndex)
  }, [previewIndex, email.attachments, previewAttachment])

  const closePreview = useCallback(() => {
    if (previewedAttachment?.url.startsWith("blob:")) {
      URL.revokeObjectURL(previewedAttachment.url)
    }
    setPreviewedAttachment(null)
    setPreviewIndex(null)
  }, [previewedAttachment])

  const closePreview = useCallback(() => {
    if (previewedAttachment?.url.startsWith("blob:")) {
      URL.revokeObjectURL(previewedAttachment.url)
    }
    setPreviewedAttachment(null)
  }, [previewedAttachment])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Wstecz
            </Button>
            <div className="flex items-center space-x-2">
              {email.labels.map((label) => (
                <Badge key={label} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
              {email.claimIds && email.claimIds.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  Szkoda: {email.claimIds.join(", ")}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onStar(email.id)}>
              <Star className={email.isStarred ? "h-4 w-4 fill-yellow-400 text-yellow-400" : "h-4 w-4"} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onArchive(email.id)}>
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(email.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onImportant(email.id)}>
              <Flag className={email.isImportant ? "h-4 w-4 text-red-500" : "h-4 w-4"} />
            </Button>
            <Button variant="ghost" size="sm">
              <Print className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">{email.subject}</h1>
          <div className="flex items-center space-x-2">
            <Button onClick={() => onReply(email)} size="sm">
              <Reply className="h-4 w-4 mr-2" />
              Odpowiedz
            </Button>
            <Button variant="outline" onClick={() => onReplyAll(email)} size="sm">
              <ReplyAll className="h-4 w-4 mr-2" />
              Odp. wszystkim
            </Button>
            <Button variant="outline" onClick={() => onForward(email)} size="sm">
              <Forward className="h-4 w-4 mr-2" />
              Przekaż
            </Button>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700">{getInitials(email.fromName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900">{email.fromName}</span>
                    <span className="text-sm text-gray-500">&lt;{email.from}&gt;</span>
                    {email.isImportant && <Flag className="h-4 w-4 text-red-500" />}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span>do: {email.to.join(", ")}</span>
                    {email.cc && email.cc.length > 0 && <span className="ml-2">dw: {email.cc.join(", ")}</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{formatDate(email.date)}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullHeaders(!showFullHeaders)}
                className="text-xs"
              >
                {showFullHeaders ? "Ukryj szczegóły" : "Pokaż szczegóły"}
              </Button>
            </div>

            {showFullHeaders && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600 space-y-1">
                <div>
                  <strong>Od:</strong> {email.fromName} &lt;{email.from}&gt;
                </div>
                <div>
                  <strong>Do:</strong> {email.to.join(", ")}
                </div>
                {email.cc && email.cc.length > 0 && (
                  <div>
                    <strong>DW:</strong> {email.cc.join(", ")}
                  </div>
                )}
                <div>
                  <strong>Data:</strong> {formatDate(email.date)}
                </div>
                <div>
                  <strong>Temat:</strong> {email.subject}
                </div>
                {email.threadId && (
                  <div>
                    <strong>Wątek:</strong> {email.threadId}
                  </div>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Attachments */}
            {email.attachments.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Paperclip className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Załączniki ({email.attachments.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {email.attachments.map((attachment, index) => (
                    <Card key={attachment.id} className="p-3">
                      {attachment.type?.startsWith("image/") && imageUrls[attachment.id] && (
                        <img
                          src={imageUrls[attachment.id]}
                          alt={attachment.name}
                          className="mb-2 max-h-48 w-full object-contain rounded"
                        />
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0">
                          <Paperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => previewAttachment(attachment, index)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => downloadAttachment(attachment)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Dokumenty"
                              >
                                <Move className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  Kopiuj do dokumentów
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {availableDocs.length ? (
                                    availableDocs.map((doc) => (
                                      <DropdownMenuItem
                                        key={`copy-${doc.id}`}
                                        onClick={() =>
                                          onTransferAttachment?.(
                                            attachment,
                                            false,
                                            doc.category,
                                          )
                                        }
                                      >
                                        {doc.name}
                                      </DropdownMenuItem>
                                    ))
                                  ) : (
                                    <DropdownMenuItem disabled>
                                      Brak kategorii
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  Przenieś do dokumentów
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {availableDocs.length ? (
                                    availableDocs.map((doc) => (
                                      <DropdownMenuItem
                                        key={`move-${doc.id}`}
                                        onClick={() =>
                                          onTransferAttachment?.(
                                            attachment,
                                            true,
                                            doc.category,
                                          )
                                        }
                                      >
                                        {doc.name}
                                      </DropdownMenuItem>
                                    ))
                                  ) : (
                                    <DropdownMenuItem disabled>
                                      Brak kategorii
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                <Separator className="mt-4" />
              </div>
            )}

            {/* Email Body */}
            <div className="prose max-w-none">
              {email.htmlBody ? (
                <div dangerouslySetInnerHTML={{ __html: email.htmlBody }} />
              ) : (
                <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">{email.body}</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex items-center justify-center space-x-4 mt-6 pt-6 border-t">
          <Button onClick={() => onReply(email)} className="bg-blue-600 hover:bg-blue-700">
            <Reply className="h-4 w-4 mr-2" />
            Odpowiedz
          </Button>
          <Button variant="outline" onClick={() => onReplyAll(email)}>
            <ReplyAll className="h-4 w-4 mr-2" />
            Odpowiedz wszystkim
          </Button>
          <Button variant="outline" onClick={() => onForward(email)}>
            <Forward className="h-4 w-4 mr-2" />
            Przekaż dalej
          </Button>
        </div>
      </div>
    </div>
    <DocumentPreview
      isOpen={!!previewedAttachment}
      onClose={closePreview}
      url={previewedAttachment?.url || ""}
      fileName={previewedAttachment?.attachment.name || ""}
      fileType={previewedAttachment?.type || "other"}

      onDownload={() =>
        previewedAttachment && downloadAttachment(previewedAttachment.attachment)
      }
      canNavigate={email.attachments.length > 1}
      onNext={email.attachments.length > 1 ? showNextAttachment : undefined}
      onPrev={email.attachments.length > 1 ? showPrevAttachment : undefined}

    />
    </>
  )
}
