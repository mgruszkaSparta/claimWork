"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import {
  Search,
  Mail,
  Send,
  FileEdit,
  AlertCircle,
  Plus,
  RefreshCw,
  Reply,
  Forward,
  Paperclip,
  Eye,
  Download,
  Trash2,
  X,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { emailService, type EmailDto, type AttachmentDto, type SendEmailRequestDto } from "@/lib/email-service"
import { EmailFolder } from "@/types/email"
import { useDebounce } from "@/hooks/use-debounce"

interface EmailInboxProps {
  claimId?: string
  claimNumber?: string
  claimInsuranceNumber?: string
}

export default function EmailInbox({ claimId, claimNumber, claimInsuranceNumber }: EmailInboxProps) {
  const [emails, setEmails] = useState<EmailDto[]>([])
  const [selectedFolder, setSelectedFolder] = useState<EmailFolder>(
    claimId ? EmailFolder.Inbox : EmailFolder.Unassigned,
  )
  const [isComposing, setIsComposing] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<EmailDto | null>(null)
  const [filterText, setFilterText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  // Compose form state
  const [composeTo, setComposeTo] = useState("")
  const [composeSubject, setComposeSubject] = useState("")
  const [composeBody, setComposeBody] = useState("")
  const [composeAttachments, setComposeAttachments] = useState<File[]>([])

  // Attachment preview state
  const [isPreviewingAttachment, setIsPreviewingAttachment] = useState(false)
  const [previewedAttachment, setPreviewedAttachment] = useState<{
    url: string
    fileName: string
    contentType: string
  } | null>(null)

  // Folder counts
  const [folderCounts, setFolderCounts] = useState({
    inbox: 0,
    sent: 0,
    drafts: 0,
    unassigned: 0,
  })

  const [allEmailsForCurrentFolder, setAllEmailsForCurrentFolder] = useState<EmailDto[]>([])
  const debouncedFilterText = useDebounce(filterText, 300)

  // Normalize text for search (remove Polish characters, convert to lowercase)
  const normalizeForSearch = useCallback((text: string): string => {
    if (!text) return ""
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
  }, [])

  const filterEmailsByFolder = useCallback(
    (emails: EmailDto[], folder: EmailFolder): EmailDto[] => {
      switch (folder) {
        case EmailFolder.Inbox:
          return emails.filter((e) => e.direction === "Inbound")
        case EmailFolder.Sent:
          return emails.filter((e) => e.direction === "Outbound")
        case EmailFolder.Drafts:
          return emails.filter((e) => e.status === "Draft")
        case EmailFolder.Important:
          return emails.filter((e) => e.isImportant)
        case EmailFolder.Unassigned:
          return emails.filter((e) => !e.claimIds || e.claimIds.length === 0)
        default:
          return emails
      }
    },
    [],
  )

  // Apply filter to emails
  const filteredEmails = useMemo(() => {
    const trimmedFilter = debouncedFilterText.trim()
    if (!trimmedFilter) return allEmailsForCurrentFolder

    const normalizedFilter = normalizeForSearch(trimmedFilter)
    return allEmailsForCurrentFolder.filter(
      (email) =>
        normalizeForSearch(email.from).includes(normalizedFilter) ||
        (email.to && normalizeForSearch(email.to).includes(normalizedFilter)) ||
        normalizeForSearch(email.subject).includes(normalizedFilter) ||
        normalizeForSearch(stripHtml(email.body)).includes(normalizedFilter),
    )
  }, [allEmailsForCurrentFolder, debouncedFilterText, normalizeForSearch])

  // Load emails for current folder
  const loadEmailsForCurrentFolder = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage("")

    try {
      let emailsData: EmailDto[]

      if (claimId) {
        emailsData = await emailService.getEmailsByEventId(claimId, selectedFolder)
      } else if (selectedFolder === EmailFolder.Unassigned) {
        emailsData = await emailService.getUnassignedEmails()
      } else {
        emailsData = await emailService.getEmailsByFolder(selectedFolder)
      }

      const sortedEmails = emailsData.sort(
        (a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime(),
      )

      setAllEmailsForCurrentFolder(sortedEmails)
    } catch (error) {
      console.error("Error loading emails:", error)
      setErrorMessage("Błąd podczas ładowania wiadomości.")
      setAllEmailsForCurrentFolder([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedFolder, claimId, filterEmailsByFolder])

  // Update folder counts
  const updateFolderCounts = useCallback(async () => {
    try {
      if (claimId) {
        const emails = await emailService.getEmailsByEventId(claimId)
        setFolderCounts({
          inbox: filterEmailsByFolder(emails, EmailFolder.Inbox).length,
          sent: filterEmailsByFolder(emails, EmailFolder.Sent).length,
          drafts: filterEmailsByFolder(emails, EmailFolder.Drafts).length,
          unassigned: filterEmailsByFolder(emails, EmailFolder.Unassigned).length,
        })
      } else {
        const [inboxEmails, sentEmails, draftEmails, unassignedEmails] = await Promise.all([
          emailService.getEmailsByFolder(EmailFolder.Inbox),
          emailService.getEmailsByFolder(EmailFolder.Sent),
          emailService.getEmailsByFolder(EmailFolder.Drafts),
          emailService.getUnassignedEmails(),
        ])

        setFolderCounts({
          inbox: inboxEmails.length,
          sent: sentEmails.length,
          drafts: draftEmails.length,
          unassigned: unassignedEmails.length,
        })
      }
    } catch (error) {
      console.error("Error fetching folder counts:", error)
      setFolderCounts({ inbox: 0, sent: 0, drafts: 0, unassigned: 0 })
    }
  }, [claimId, filterEmailsByFolder])

  // Select folder
  const selectFolder = useCallback((folder: EmailFolder) => {
    setSelectedFolder(folder)
    setIsReading(false)
    setIsComposing(false)
    setFilterText("")
    setSelectedEmail(null)
  }, [])

  // Start compose
  const startCompose = useCallback(
    (isReply = false, isForward = false) => {
      setIsComposing(true)
      setIsReading(false)
      setSuccessMessage("")
      setErrorMessage("")
      setComposeAttachments([])

      if (isReply && selectedEmail) {
        setComposeTo(selectedEmail.from)
        setComposeSubject(`Re: ${selectedEmail.subject}`)
        setComposeBody(
          `<br><br><blockquote>--- Original Message ---<br>From: ${selectedEmail.from}<br>Sent: ${new Date(selectedEmail.receivedDate).toLocaleString()}<br>To: YourAppUser<br>Subject: ${selectedEmail.subject}<br><br>${selectedEmail.body}</blockquote>`,
        )
      } else if (isForward && selectedEmail) {
        setComposeTo("")
        setComposeSubject(`Fwd: ${selectedEmail.subject}`)
        setComposeBody(
          `<br><br><blockquote>--- Forwarded Message ---<br>From: ${selectedEmail.from}<br>Sent: ${new Date(selectedEmail.receivedDate).toLocaleString()}<br>Subject: ${selectedEmail.subject}<br><br>${selectedEmail.body}</blockquote>`,
        )
        prepareForwardAttachments()
      } else {
        setComposeTo("")
        setComposeSubject("")
        setComposeBody("")
      }
    },
    [selectedEmail],
  )

  // Prepare forward attachments
  const prepareForwardAttachments = useCallback(async () => {
    if (!selectedEmail?.attachments?.length) return

    setIsLoading(true)
    try {
      const attachmentFiles: File[] = []
      for (const att of selectedEmail.attachments) {
        const blob = await emailService.downloadAttachment(att.id)
        if (blob) {
          attachmentFiles.push(new File([blob], att.fileName, { type: att.contentType }))
        }
      }
      setComposeAttachments(attachmentFiles)
    } catch (error) {
      setErrorMessage("Nie udało się załadować wszystkich załączników do przekazania.")
      console.error("Error preparing forwarded attachments:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedEmail])

  // Send email
  const sendEmail = useCallback(async () => {
    setIsSending(true)
    setSuccessMessage("")
    setErrorMessage("")

    const request: SendEmailRequestDto = {
      to: composeTo,
      cc: "",
      bcc: "",
      subject: composeSubject + (claimInsuranceNumber ? `[[${claimInsuranceNumber}]]` : ""),
      body: composeBody,
      attachments: composeAttachments,
      claimId,
      eventId: claimId,
    }

    try {
      const success = await emailService.sendEmail(request)
      if (success) {
        setSuccessMessage("Wiadomość została wysłana!")
        setIsComposing(false)
        resetComposeForm()
        if (selectedFolder === EmailFolder.Sent) {
          loadEmailsForCurrentFolder()
        }
        updateFolderCounts()
      } else {
        setErrorMessage("Błąd podczas wysyłania wiadomości. Spróbuj ponownie.")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      setErrorMessage("Błąd podczas wysyłania wiadomości. Spróbuj ponownie.")
    } finally {
      setIsSending(false)
    }
  }, [
    composeTo,
    composeSubject,
    composeBody,
    composeAttachments,
    claimId,
    claimInsuranceNumber,
    selectedFolder,
    loadEmailsForCurrentFolder,
    updateFolderCounts,
  ])

  const saveDraft = useCallback(async () => {
    setIsSavingDraft(true)
    setSuccessMessage("")
    setErrorMessage("")

    const request: SendEmailRequestDto = {
      to: composeTo,
      cc: "",
      bcc: "",
      subject: composeSubject + (claimInsuranceNumber ? `[[${claimInsuranceNumber}]]` : ""),
      body: composeBody,
      attachments: composeAttachments,
      claimId,
      eventId: claimId,
    }

    try {
      const success = await emailService.saveDraft(request)
      if (success) {
        setSuccessMessage("Szkic został zapisany!")
        setIsComposing(false)
        resetComposeForm()
        updateFolderCounts()
        if (selectedFolder === EmailFolder.Drafts) {
          loadEmailsForCurrentFolder()
        }
      } else {
        setErrorMessage("Błąd podczas zapisywania szkicu. Spróbuj ponownie.")
      }
    } catch (error) {
      console.error("Error saving draft:", error)
      setErrorMessage("Błąd podczas zapisywania szkicu. Spróbuj ponownie.")
    } finally {
      setIsSavingDraft(false)
    }
  }, [
    composeTo,
    composeSubject,
    composeBody,
    composeAttachments,
    claimId,
    claimInsuranceNumber,
    updateFolderCounts,
    selectedFolder,
    loadEmailsForCurrentFolder,
  ])

  // Reset compose form
  const resetComposeForm = useCallback(() => {
    setComposeTo("")
    setComposeSubject("")
    setComposeBody("")
    setComposeAttachments([])
    setSuccessMessage("")
    setErrorMessage("")
    setIsSending(false)
    setIsSavingDraft(false)
  }, [])

  // Read email
  const readEmail = useCallback(
    async (email: EmailDto) => {
      setIsReading(true)
      setIsComposing(false)
      setSelectedEmail(email)
      setSuccessMessage("")
      setErrorMessage("")

      if (!email.read) {
        const success = await emailService.markAsRead(email.id)
        if (success) {
          email.read = true
          const emailInList = allEmailsForCurrentFolder.find((e) => e.id === email.id)
          if (emailInList) emailInList.read = true
          setAllEmailsForCurrentFolder([...allEmailsForCurrentFolder])
          updateFolderCounts()
        }
      }
    },
    [allEmailsForCurrentFolder, updateFolderCounts],
  )

  // Delete email
  const deleteEmail = useCallback(
    async (emailId: number, event: React.MouseEvent) => {
      event.stopPropagation()
      if (!confirm("Czy na pewno chcesz usunąć tę wiadomość? Tej akcji nie można cofnąć.")) {
        return
      }

      setIsDeleting(true)
      try {
        const success = await emailService.deleteEmail(emailId)
        if (success) {
          setAllEmailsForCurrentFolder((prev) => prev.filter((e) => e.id !== emailId))
          if (selectedEmail?.id === emailId) {
            setSelectedEmail(null)
            setIsReading(false)
          }
          updateFolderCounts()
          setSuccessMessage("Wiadomość została usunięta.")
        } else {
          setErrorMessage("Nie udało się usunąć wiadomości.")
        }
      } catch (error) {
        console.error("Error deleting email:", error)
        setErrorMessage("Wystąpił błąd serwera podczas usuwania wiadomości.")
      } finally {
        setIsDeleting(false)
      }
    },
    [selectedEmail, updateFolderCounts],
  )

  // Assign email to claim
  const assignEmailToCurrentClaim = useCallback(
    async (email: EmailDto) => {
      if (!claimId || !email) {
        setErrorMessage("Nie można przypisać emaila: brak ID szkody lub emaila.")
        return
      }
      if (email.claimIds && email.claimIds.includes(claimId)) {
        setSuccessMessage("Email jest już przypisany do tej szkody.")
        return
      }

      try {
        const success = await emailService.assignEmailToClaim(email.id, [claimId])
        if (success) {
          setSuccessMessage("Email pomyślnie przypisany do szkody.")
          email.claimIds = [...(email.claimIds ?? []), claimId]
          if (selectedFolder === EmailFolder.Unassigned) {
            setAllEmailsForCurrentFolder((prev) => prev.filter((e) => e.id !== email.id))
          }
          updateFolderCounts()
        } else {
          setErrorMessage("Błąd przy przypisywaniu emaila.")
        }
      } catch (error) {
        console.error("Error assigning email:", error)
        setErrorMessage("Wystąpił błąd serwera podczas przypisywania emaila.")
      }
    },
    [claimId, selectedFolder, updateFolderCounts],
  )

  // Download attachment
  const downloadAttachment = useCallback(async (attachment: AttachmentDto) => {
    if (!attachment?.id) return

    try {
      const blob = await emailService.downloadAttachment(attachment.id)
      if (blob) {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = attachment.fileName || "attachment"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        setErrorMessage(`Nie udało się pobrać załącznika: ${attachment.fileName}`)
      }
    } catch (error) {
      console.error("Error downloading attachment:", error)
      setErrorMessage("Błąd pobierania załącznika.")
    }
  }, [])

  // Preview attachment
  const previewAttachment = useCallback(async (attachment: AttachmentDto) => {
    try {
      const blob = await emailService.downloadAttachment(attachment.id)
      if (blob) {
        const url = URL.createObjectURL(blob)
        setPreviewedAttachment({
          url,
          fileName: attachment.fileName,
          contentType: attachment.contentType,
        })
        setIsPreviewingAttachment(true)
      } else {
        setErrorMessage("Nie można wygenerować podglądu dla tego załącznika.")
      }
    } catch (error) {
      console.error("Error loading attachment for preview:", error)
      setErrorMessage("Błąd podczas ładowania załącznika do podglądu.")
    }
  }, [])

  // Close attachment preview
  const closeAttachmentPreview = useCallback(() => {
    if (previewedAttachment?.url) {
      URL.revokeObjectURL(previewedAttachment.url)
    }
    setIsPreviewingAttachment(false)
    setPreviewedAttachment(null)
  }, [previewedAttachment])

  // Handle file change
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setComposeAttachments((prev) => [...prev, ...Array.from(files)])
      event.target.value = ""
    }
  }, [])

  // Remove attachment
  const removeAttachment = useCallback((index: number) => {
    setComposeAttachments((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // Handle drag end
  const handleDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) return

      const items = Array.from(composeAttachments)
      const [reorderedItem] = items.splice(result.source.index, 1)
      items.splice(result.destination.index, 0, reorderedItem)

      setComposeAttachments(items)
    },
    [composeAttachments],
  )

  // Strip HTML
  const stripHtml = useCallback((html: string, truncate = true): string => {
    if (!html) return ""

    // Clean CID images first
    const cleanedHtml = html.replace(/<img[^>]+src=["']cid:[^"']+["'][^>]*>/gi, "[Obrazek osadzony - usunięty]")

    const tempElement = document.createElement("div")
    tempElement.innerHTML = cleanedHtml

    let text = tempElement.textContent || tempElement.innerText || ""
    text = text
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    if (truncate && text.length > 80) {
      text = text.slice(0, 77).trim() + "..."
    }
    return text
  }, [])

  // Format display date
  const formatDisplayDate = useCallback((dateString: string | Date | undefined, detailed = false): string => {
    if (!dateString) return ""

    const date = new Date(dateString)

    if (detailed) {
      return date.toLocaleString("pl-PL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.getTime() >= today.getTime()) {
      return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
    } else if (date.getTime() >= yesterday.getTime()) {
      return "Wczoraj"
    } else {
      return date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })
    }
  }, [])

  // Check if image
  const isImage = useCallback((contentType: string): boolean => {
    return contentType.startsWith("image/")
  }, [])

  // Effects
  useEffect(() => {
    loadEmailsForCurrentFolder()
  }, [loadEmailsForCurrentFolder])

  useEffect(() => {
    updateFolderCounts()
  }, [updateFolderCounts])

  useEffect(() => {
    setEmails(filteredEmails)
  }, [filteredEmails])

  return (
    <div className="email-app h-full flex flex-col">
      {/* Header */}
      <div className="email-header bg-white border-b border-[#d1d9e6] p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="email-logo flex items-center gap-2 text-[#1a3a6c]">
            <Mail className="w-5 h-5" />
            <span className="text-lg font-semibold">Email Inbox</span>
          </div>

          <div className="email-search relative ml-4 hidden md:block">
            <Input
              type="text"
              placeholder="Szukaj wiadomości..."
              className="pl-9 pr-4 py-2 bg-gray-50 border border-[#d1d9e6] rounded-lg w-64"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="email-content flex-1 flex flex-col overflow-hidden">
        {/* Tabs Navigation */}
        <div className="email-tabs-nav bg-white border-b border-[#d1d9e6] px-4">
          <div className="flex items-center justify-between">
            <div className="flex">
              <button
                className={`email-tab flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  selectedFolder === EmailFolder.Inbox
                    ? "active border-[#1a3a6c] text-[#1a3a6c]"
                    : "border-transparent text-[#64748b]"
                }`}
                onClick={() => selectFolder(EmailFolder.Inbox)}
              >
                <Mail className="w-4 h-4" />
                <span className="font-medium">Odebrane</span>
                {folderCounts.inbox > 0 && (
                  <span className="bg-[#1a3a6c] text-white text-xs px-2 py-0.5 rounded-full min-w-[1.5rem] text-center">
                    {folderCounts.inbox}
                  </span>
                )}
              </button>

              <button
                className={`email-tab flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  selectedFolder === EmailFolder.Unassigned
                    ? "active border-[#1a3a6c] text-[#1a3a6c]"
                    : "border-transparent text-[#64748b]"
                }`}
                onClick={() => selectFolder(EmailFolder.Unassigned)}
              >
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Nieprzypisane</span>
                {folderCounts.unassigned > 0 && (
                  <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[1.5rem] text-center">
                    {folderCounts.unassigned}
                  </span>
                )}
              </button>

              <button
                className={`email-tab flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  selectedFolder === EmailFolder.Sent
                    ? "active border-[#1a3a6c] text-[#1a3a6c]"
                    : "border-transparent text-[#64748b]"
                }`}
                onClick={() => selectFolder(EmailFolder.Sent)}
              >
                <Send className="w-4 h-4" />
                <span className="font-medium">Wysłane</span>
                {folderCounts.sent > 0 && (
                  <span className="bg-[#1a3a6c] text-white text-xs px-2 py-0.5 rounded-full min-w-[1.5rem] text-center">
                    {folderCounts.sent}
                  </span>
                )}
              </button>

              <button
                className={`email-tab flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  selectedFolder === EmailFolder.Drafts
                    ? "active border-[#1a3a6c] text-[#1a3a6c]"
                    : "border-transparent text-[#64748b]"
                }`}
                onClick={() => selectFolder(EmailFolder.Drafts)}
              >
                <FileEdit className="w-4 h-4" />
                <span className="font-medium">Szkice</span>
                {folderCounts.drafts > 0 && (
                  <span className="bg-[#1a3a6c] text-white text-xs px-2 py-0.5 rounded-full min-w-[1.5rem] text-center">
                    {folderCounts.drafts}
                  </span>
                )}
              </button>
            </div>

            <Button
              className="email-compose-button bg-[#1a3a6c] text-white py-2 px-4 rounded-lg flex items-center gap-2"
              onClick={() => startCompose()}
            >
              <Plus className="w-4 h-4" />
              <span>Utwórz wiadomość</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Email List View */}
          {!isReading && !isComposing && (
            <div className="email-list-view flex-1 flex flex-col bg-white">
              <div className="email-list-toolbar p-3 flex justify-between items-center border-b border-[#d1d9e6] bg-gray-50">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={loadEmailsForCurrentFolder} title="Odśwież">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="email-pagination-text text-xs text-[#64748b]">
                    1-{emails.length} z {emails.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                <ul className="email-mail-items">
                  {emails.map((email) => (
                    <li
                      key={email.id}
                      className={`email-mail-item px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 ${
                        emailService.isUnread(email) ? "unread" : ""
                      } ${selectedEmail?.id === email.id ? "bg-[#f0f5ff]" : ""}`}
                      onClick={() => readEmail(email)}
                    >
                      <div className="email-mail-sender w-40 truncate text-[#1a3a6c] font-medium">
                        {email.from.split("<")[0].trim()}
                      </div>
                      <div className="email-mail-content flex-1 truncate">
                        <span className="email-mail-subject font-medium">{email.subject}</span>
                        <span className="email-mail-separator text-gray-400 mx-1">-</span>
                        <span className="email-mail-snippet text-gray-500">{stripHtml(email.body)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {emailService.hasAttachments(email) && (
                          <div className="email-mail-attachment text-gray-400">
                            <Paperclip className="w-4 h-4" />
                          </div>
                        )}
                        <div className="email-mail-date text-[#64748b] text-sm w-24 text-right">
                          {formatDisplayDate(email.receivedDate)}
                        </div>
                      </div>
                    </li>
                  ))}

                  {emails.length === 0 && (
                    <li className="py-16 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Mail className="w-6 h-6 text-[#64748b]" />
                      </div>
                      <h3 className="text-lg font-medium text-[#1a3a6c] mb-1">Brak wiadomości</h3>
                      <p className="text-[#64748b] max-w-xs">Nie znaleziono żadnych wiadomości w tym folderze.</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Email Reading View */}
          {isReading && !isComposing && selectedEmail && (
            <div className="email-reading-view flex-1 flex flex-col bg-white">
              <div className="email-reading-header p-3 border-b border-[#d1d9e6] bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setIsReading(false)}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h1 className="text-lg font-semibold text-[#1a3a6c] truncate">{selectedEmail.subject}</h1>
                </div>
              </div>

              <div className="email-reading-toolbar p-3 border-b border-[#d1d9e6] bg-white flex flex-wrap gap-2">
                <Button onClick={() => startCompose(true, false)}>
                  <Reply className="w-4 h-4 mr-2" />
                  Odpowiedz
                </Button>

                <Button variant="secondary" onClick={() => startCompose(false, true)}>
                  <Forward className="w-4 h-4 mr-2" />
                  Przekaż dalej
                </Button>

                {selectedEmail && !(selectedEmail.claimIds && selectedEmail.claimIds.length > 0) && (
                  <Button variant="secondary" onClick={() => assignEmailToCurrentClaim(selectedEmail)}>
                    Przypisz do szkody
                  </Button>
                )}

                <Button variant="destructive" onClick={(e) => deleteEmail(selectedEmail.id, e)} disabled={isDeleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? "Usuwanie..." : "Usuń"}
                </Button>
              </div>

              <div className="flex-1 flex flex-col p-6 overflow-hidden">
                <div className="flex-shrink-0">
                  <div className="flex items-start gap-4 pb-4 border-b border-[#d1d9e6]">
                    <div className="email-sender-avatar w-10 h-10 rounded-full bg-[#1a3a6c] text-white flex items-center justify-center font-semibold">
                      {selectedEmail.from.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2 mb-1">
                        <div className="email-sender-name text-[#1a3a6c] font-medium">
                          {selectedEmail.from.split("<")[0].trim()}
                        </div>
                      </div>

                      <div className="text-sm text-[#64748b]">
                        <div className="mb-1">{formatDisplayDate(selectedEmail.receivedDate, true)}</div>
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-1">Do:</span>
                          <span className="text-gray-800 truncate" title={selectedEmail.to}>
                            {selectedEmail.to}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedEmail.attachments?.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 border border-[#d1d9e6] rounded-lg">
                      <div className="flex items-center gap-2 mb-3 text-[#1a3a6c]">
                        <Paperclip className="w-4 h-4" />
                        <span className="font-medium">Załączniki ({selectedEmail.attachments.length})</span>
                      </div>
                      <div className="max-h-56 overflow-y-auto pr-2">
                        <div className="email-attachment-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedEmail.attachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="email-attachment-item bg-white border border-gray-200 rounded-md p-3 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center gap-3">
                                <div className="email-attachment-info flex-1 min-w-0">
                                  <div
                                    className="email-attachment-name font-medium text-sm truncate"
                                    title={attachment.fileName}
                                  >
                                    {attachment.fileName}
                                  </div>
                                  <div className="email-attachment-size text-xs text-gray-500">
                                    {attachment.contentType}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => previewAttachment(attachment)}
                                  title="Podgląd załącznika"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadAttachment(attachment)}
                                  title="Pobierz załącznik"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto mt-6">
                  <article
                    className="text-[#334155] prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email Compose View */}
          {isComposing && (
            <div className="email-compose-view flex-1 flex flex-col bg-white">
              <div className="email-compose-header p-3 border-b border-[#d1d9e6] bg-gray-50 flex justify-between items-center w-full">
                <div className="flex items-center gap-3 min-w-0">
                  <Button variant="ghost" size="sm" onClick={() => setIsComposing(false)}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h1 className="text-lg font-semibold text-[#1a3a6c]">Nowa wiadomość</h1>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="outline" onClick={saveDraft} disabled={isSavingDraft}>
                    {isSavingDraft ? "Zapisywanie..." : "Zapisz szkic"}
                  </Button>
                  <Button onClick={sendEmail} disabled={isSending}>
                    <Send className="w-4 h-4 mr-2" />
                    {isSending ? "Wysyłanie..." : "Wyślij"}
                  </Button>
                </div>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden p-4">
                <div className="email-form-field">
                  <label htmlFor="to" className="email-form-label">
                    Do:
                  </label>
                  <Input
                    id="to"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    placeholder="adres@example.com"
                    required
                    className="email-form-input"
                  />
                </div>

                <div className="email-form-field">
                  <label htmlFor="subject" className="email-form-label">
                    Temat:
                  </label>
                  <Input
                    id="subject"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="Temat wiadomości"
                    className="email-form-input"
                  />
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Button variant="secondary" onClick={() => document.getElementById("attachment-input")?.click()}>
                    <Paperclip className="w-4 h-4 mr-2" />
                    Załącz pliki
                  </Button>
                  <input
                    id="attachment-input"
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    style={{ display: "none" }}
                  />
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="attachments" direction="horizontal">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="attachment-drag-container flex flex-wrap gap-2"
                        >
                          {composeAttachments.map((file, index) => (
                            <Draggable
                              key={`${file.name}-${index}`}
                              draggableId={`${file.name}-${index}`}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="email-attachment-chip flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                                >
                                  <span className="email-attachment-name">{file.name}</span>
                                  <span className="email-attachment-size text-xs text-gray-500">
                                    ({emailService.formatFileSize(file.size)})
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeAttachment(index)}
                                    className="email-attachment-remove w-4 h-4 p-0"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>

                <div className="flex-1 overflow-hidden border border-[#d1d9e6] rounded-lg">
                  <Textarea
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    placeholder="Wpisz treść wiadomości..."
                    className="w-full h-full min-h-[200px] border-none resize-none"
                  />
                </div>

                {(successMessage || errorMessage) && (
                  <div className="mt-4">
                    {successMessage && <p className="text-green-600">{successMessage}</p>}
                    {errorMessage && <p className="text-red-600">{errorMessage}</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attachment Preview Modal */}
      {isPreviewingAttachment && previewedAttachment && (
        <div
          className="file-preview-overlay fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={closeAttachmentPreview}
        >
          <div
            className="file-preview-modal bg-white rounded-lg shadow-lg w-[90vw] h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="file-preview-header flex justify-between items-center p-3 border-b border-gray-200">
              <span className="file-preview-filename font-medium">{previewedAttachment.fileName}</span>
              <Button variant="ghost" size="sm" onClick={closeAttachmentPreview} title="Zamknij podgląd">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="file-preview-content flex-1 overflow-auto flex items-center justify-center p-4">
              {isImage(previewedAttachment.contentType) ? (
                <img
                  src={previewedAttachment.url || "/placeholder.svg"}
                  alt="Podgląd załącznika"
                  className="preview-image max-w-full max-h-full object-contain"
                />
              ) : (
                <iframe
                  src={previewedAttachment.url}
                  className="preview-iframe w-full h-full border-none"
                  title="Podgląd załącznika"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
