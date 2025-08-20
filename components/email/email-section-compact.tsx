"use client"

import { useState, type Dispatch, type SetStateAction } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailComposeComponent } from "./email-compose"
import { EmailView } from "./email-view"
import { sampleEmails } from "@/lib/email-data"
import { cn } from "@/lib/utils"
import {
  Mail,
  MailOpen,
  Send,
  Inbox,
  Star,
  Search,
  Plus,
  Paperclip,
  Flag,
  MoreVertical,
} from "lucide-react"
import type { Email, EmailCompose, EmailAttachment } from "@/types/email"
import type { UploadedFile, RequiredDocument } from "@/types"

interface EmailSectionProps {
  claimId?: string
  uploadedFiles?: UploadedFile[]
  setUploadedFiles?: Dispatch<SetStateAction<UploadedFile[]>>
  requiredDocuments?: RequiredDocument[]
  setRequiredDocuments?: Dispatch<SetStateAction<RequiredDocument[]>>
}

export const EmailSection = ({
  claimId,
  uploadedFiles,
  setUploadedFiles,
  requiredDocuments,
  setRequiredDocuments,
}: EmailSectionProps) => {
  const { toast } = useToast()
  const [emails, setEmails] = useState<Email[]>(
    sampleEmails.filter((email) => !claimId || (email.claimIds && email.claimIds.includes(claimId)))
  )
  const [activeTab, setActiveTab] = useState("inbox")
  const [currentView, setCurrentView] = useState<"list" | "view" | "compose">("list")
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [composeData, setComposeData] = useState<{
    replyTo?: string
    replySubject?: string
    replyBody?: string
  }>({})

  const [internalDocuments, setInternalDocuments] = useState<UploadedFile[]>([])
  const documents = uploadedFiles ?? internalDocuments
  const updateDocuments = setUploadedFiles ?? setInternalDocuments
  const [internalRequiredDocs, setInternalRequiredDocs] = useState<RequiredDocument[]>([])
  const docs = requiredDocuments ?? internalRequiredDocs
  const updateRequiredDocs = setRequiredDocuments ?? setInternalRequiredDocs

  const mapAttachmentType = (type: string): UploadedFile["type"] => {
    if (type.includes("pdf")) return "pdf"
    if (type.includes("image")) return "image"
    if (type.includes("doc")) return "doc"
    if (type.includes("video")) return "video"
    return "other"
  }

  const filteredEmails = emails.filter((email) => {
    if (activeTab === "sent") return email.folder === "sent"
    if (activeTab === "drafts") return email.folder === "drafts"
    if (activeTab === "starred") return email.isStarred
    return email.folder === "inbox"
  })

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

  const handleEmailClick = (email: Email) => {
    setEmails((prev) => prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e)))
    setSelectedEmail(email)
    setCurrentView("view")
  }

  const handleStarEmail = (emailId: string) => {
    setEmails((prev) => prev.map((email) => (email.id === emailId ? { ...email, isStarred: !email.isStarred } : email)))
  }

  const handleCompose = () => {
    setComposeData({})
    setCurrentView("compose")
  }

  const handleReply = (email: Email) => {
    setComposeData({
      replyTo: email.from,
      replySubject: email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
      replyBody: email.body,
    })
    setCurrentView("compose")
  }

  const handleReplyAll = (email: Email) => {
    const allRecipients = [email.from, ...email.to, ...(email.cc || [])]
      .filter((addr, index, arr) => arr.indexOf(addr) === index)
      .join(", ")

    setComposeData({
      replyTo: allRecipients,
      replySubject: email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
      replyBody: email.body,
    })
    setCurrentView("compose")
  }

  const handleForward = (email: Email) => {
    setComposeData({
      replySubject: email.subject.startsWith("Fwd:") ? email.subject : `Fwd: ${email.subject}`,
      replyBody: `\n\n--- Przekazana wiadomość ---\nOd: ${email.fromName} <${email.from}>\nData: ${email.date}\nTemat: ${email.subject}\n\n${email.body}`,
    })
    setCurrentView("compose")
  }

  const handleAssignAttachment = (attachment: EmailAttachment, documentId: string) => {
    const doc = docs.find((d) => d.id === documentId)
    const newFile: UploadedFile = {
      id: attachment.id,
      name: attachment.name,
      size: attachment.size,
      type: mapAttachmentType(attachment.type),
      uploadedAt: new Date().toISOString(),
      url: attachment.url,
      category: doc?.name,
      categoryCode: doc?.category,
    }
    updateDocuments((prev) => [...prev, newFile])
    updateRequiredDocs((prev) => prev.map((d) => (d.id === documentId ? { ...d, uploaded: true } : d)))
    toast({
      title: "Załącznik przypisany",
      description: `Dodano ${attachment.name} do dokumentu ${doc?.name || documentId}`,
    })
  }

  const handleSendEmail = (emailData: EmailCompose) => {
    const newEmail: Email = {
      id: Math.random().toString(36).substr(2, 9),
      from: "piotr.raniecki@spartabrokers.pl",
      fromName: "Piotr Raniecki",
      to: emailData.to.split(",").map((email) => email.trim()),
      cc: emailData.cc ? emailData.cc.split(",").map((email) => email.trim()) : undefined,
      bcc: emailData.bcc ? emailData.bcc.split(",").map((email) => email.trim()) : undefined,
      subject: emailData.subject,
      body: emailData.body,
      htmlBody: emailData.isHtml ? emailData.body : undefined,
      isRead: true,
      isStarred: false,
      isImportant: emailData.priority === "high",
      folder: "sent",
      date: new Date().toISOString(),
      attachments: emailData.attachments,
      labels: [],
      claimId: claimId,
    }

    setEmails((prev) => [newEmail, ...prev])
    setCurrentView("list")
    setComposeData({})

    toast({
      title: "E-mail wysłany",
      description: "Wiadomość została wysłana pomyślnie",
    })
  }

  const handleSaveDraft = (emailData: EmailCompose) => {
    const draftEmail: Email = {
      id: Math.random().toString(36).substr(2, 9),
      from: "piotr.raniecki@spartabrokers.pl",
      fromName: "Piotr Raniecki",
      to: emailData.to
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean),
      cc: emailData.cc
        ? emailData.cc
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean)
        : undefined,
      subject: emailData.subject || "(Bez tematu)",
      body: emailData.body,
      isRead: true,
      isStarred: false,
      isImportant: false,
      folder: "drafts",
      date: new Date().toISOString(),
      attachments: emailData.attachments,
      labels: ["szkic"],
      claimId: claimId,
    }

    setEmails((prev) => [draftEmail, ...prev])
    setCurrentView("list")
    setComposeData({})

    toast({
      title: "Szkic zapisany",
      description: "Wiadomość została zapisana w szkicach",
    })
  }

  const handleBack = () => {
    setCurrentView("list")
    setSelectedEmail(null)
  }

  const handleCloseCompose = () => {
    setCurrentView("list")
    setComposeData({})
  }

  const unreadCount = filteredEmails.filter((email) => !email.isRead).length

  if (currentView === "compose") {
    return (
      <EmailComposeComponent
        onSend={handleSendEmail}
        onSaveDraft={handleSaveDraft}
        onClose={handleCloseCompose}
        replyTo={composeData.replyTo}
        replySubject={composeData.replySubject}
        replyBody={composeData.replyBody}
        claimId={claimId || ""}
        availableDocuments={documents}
      />
    )
  }

  if (currentView === "view" && selectedEmail) {
    return (
      <EmailView
        email={selectedEmail}
        onReply={handleReply}
        onReplyAll={handleReplyAll}
        onForward={handleForward}
        onBack={handleBack}
        onStar={handleStarEmail}
        onArchive={(id) => {
          setEmails((prev) => prev.map((email) => (email.id === id ? { ...email, folder: "trash" } : email)))
          toast({ title: "E-mail zarchiwizowany" })
        }}
        onDelete={(id) => {
          setEmails((prev) => prev.map((email) => (email.id === id ? { ...email, folder: "trash" } : email)))
          toast({ title: "E-mail usunięty" })
        }}
        requiredDocuments={docs}
        onAssignAttachment={handleAssignAttachment}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Korespondencja e-mail {claimId && `- ${claimId}`}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={handleCompose} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Napisz e-mail
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="inbox" className="flex items-center space-x-2">
                <Inbox className="h-4 w-4" />
                <span>Odebrane</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center space-x-2">
                <Send className="h-4 w-4" />
                <span>Wysłane</span>
              </TabsTrigger>
              <TabsTrigger value="drafts" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Szkice</span>
              </TabsTrigger>
              <TabsTrigger value="starred" className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>Oznaczone</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Szukaj w e-mailach..." className="pl-10" />
                </div>
                <div className="text-sm text-gray-500">{filteredEmails.length} wiadomości</div>
              </div>

              <TabsContent value={activeTab} className="mt-0">
                {filteredEmails.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <Mail className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="font-medium">Brak e-maili</p>
                      <p className="text-sm">Nie znaleziono wiadomości w tej kategorii</p>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    {filteredEmails.map((email, index) => (
                      <div
                        key={email.id}
                        className={cn(
                          "flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0",
                          !email.isRead && "bg-blue-50/30",
                        )}
                        onClick={() => handleEmailClick(email)}
                      >
                        <div className="flex items-center space-x-3 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStarEmail(email.id)
                            }}
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                email.isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400",
                              )}
                            />
                          </Button>
                          {email.isImportant && <Flag className="h-4 w-4 text-red-500" />}
                          {!email.isRead ? (
                            <Mail className="h-4 w-4 text-blue-600" />
                          ) : (
                            <MailOpen className="h-4 w-4 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 ml-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2 min-w-0">
                              <span
                                className={cn(
                                  "font-medium truncate",
                                  !email.isRead ? "text-gray-900" : "text-gray-600",
                                )}
                              >
                                {email.fromName}
                              </span>
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

                          <span className="text-sm text-gray-500 truncate block">
                            {email.body.substring(0, 100)}...
                          </span>
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
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
