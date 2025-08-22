"use client"

import { useState, type Dispatch, type SetStateAction } from "react"
import { useToast } from "@/hooks/use-toast"
import { EmailSidebar } from "./email-sidebar"
import { EmailList } from "./email-list"
import { EmailView } from "./email-view"
import { EmailComposeComponent } from "./email-compose"
import { emailFolders, sampleEmails } from "@/lib/email-data"
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
  const [emails, setEmails] = useState<Email[]>(sampleEmails)
  const [activeFolder, setActiveFolder] = useState("inbox")
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [currentView, setCurrentView] = useState<"list" | "view" | "compose">("list")
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [composeData, setComposeData] = useState<{
    replyTo?: string
    replySubject?: string
    replyBody?: string
    claimId?: string
  }>({})

  const [internalDocuments, setInternalDocuments] = useState<UploadedFile[]>([
    {
      id: "doc1",
      name: "Umowa.pdf",
      size: 1024,
      type: "pdf",
      uploadedAt: new Date().toISOString(),
      url: "#",
    },
    {
      id: "doc2",
      name: "Faktura.jpg",
      size: 2048,
      type: "image",
      uploadedAt: new Date().toISOString(),
      url: "#",
    },
  ])
  const documents = uploadedFiles ?? internalDocuments
  const updateDocuments = setUploadedFiles ?? setInternalDocuments

  const [internalRequiredDocs, setInternalRequiredDocs] = useState<RequiredDocument[]>([
    { id: "req1", name: "Umowa", required: true, uploaded: false, description: "" },
    { id: "req2", name: "Protokół", required: false, uploaded: false, description: "" },
  ])
  const reqDocuments = requiredDocuments ?? internalRequiredDocs
  const updateRequiredDocs = setRequiredDocuments ?? setInternalRequiredDocs

  const mapAttachmentType = (type: string): UploadedFile["type"] => {
    if (type.includes("pdf")) return "pdf"
    if (type.includes("image")) return "image"
    if (
      type.includes("doc") ||
      type.includes("msword") ||
      type.includes("wordprocessingml") ||
      type.includes("ms-excel") ||
      type.includes("spreadsheetml") ||
      type.includes("excel")
    )
      return "doc"
    if (type.includes("video")) return "video"
    return "other"
  }

  const filteredEmails = emails.filter((email) => {
    if (activeFolder === "starred") return email.isStarred
    if (activeFolder === "important") return email.isImportant
    return email.folder === activeFolder
  })

  const handleEmailSelect = (emailId: string) => {
    setSelectedEmails((prev) => (prev.includes(emailId) ? prev.filter((id) => id !== emailId) : [...prev, emailId]))
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedEmails(checked ? filteredEmails.map((e) => e.id) : [])
  }

  const handleEmailClick = (email: Email) => {
    // Mark as read
    setEmails((prev) => prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e)))
    setSelectedEmail(email)
    setCurrentView("view")
  }

  const handleStarEmail = (emailId: string) => {
    setEmails((prev) => prev.map((email) => (email.id === emailId ? { ...email, isStarred: !email.isStarred } : email)))
  }

  const handleArchiveEmails = (emailIds: string[]) => {
    setEmails((prev) => prev.map((email) => (emailIds.includes(email.id) ? { ...email, folder: "trash" } : email)))
    setSelectedEmails([])
    toast({
      title: "E-maile zarchiwizowane",
      description: `Zarchiwizowano ${emailIds.length} e-mail(i)`,
    })
  }

  const handleDeleteEmails = (emailIds: string[]) => {
    setEmails((prev) => prev.map((email) => (emailIds.includes(email.id) ? { ...email, folder: "trash" } : email)))
    setSelectedEmails([])
    toast({
      title: "E-maile usunięte",
      description: `Usunięto ${emailIds.length} e-mail(i)`,
    })
  }

  const handleMarkAsRead = (emailIds: string[], isRead: boolean) => {
    setEmails((prev) => prev.map((email) => (emailIds.includes(email.id) ? { ...email, isRead } : email)))
    setSelectedEmails([])
    toast({
      title: isRead ? "Oznaczono jako przeczytane" : "Oznaczono jako nieprzeczytane",
      description: `Zaktualizowano ${emailIds.length} e-mail(i)`,
    })
  }

  const handleAssignAttachment = (attachment: EmailAttachment, documentId: string) => {
    const doc = reqDocuments.find((d) => d.id === documentId)

    const url = attachment.url || `/api/emails/attachment/${attachment.id}`
    const type = attachment.type || (attachment as any).contentType || ""

    const newFile: UploadedFile = {
      id: attachment.id,
      name: attachment.name,
      size: attachment.size,
      type: mapAttachmentType(type),
      uploadedAt: new Date().toISOString(),
      url,
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

  const handleCompose = () => {
    setComposeData({})
    setCurrentView("compose")
  }

  const handleReply = (email: Email) => {
    setComposeData({
      replyTo: email.from,
      replySubject: email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
      replyBody: email.body,
      claimId: claimId,
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
      claimId: claimId,
    })
    setCurrentView("compose")
  }

  const handleForward = (email: Email) => {
    setComposeData({
      replySubject: email.subject.startsWith("Fwd:") ? email.subject : `Fwd: ${email.subject}`,
      replyBody: `\n\n--- Przekazana wiadomość ---\nOd: ${email.fromName} <${email.from}>\nData: ${email.date}\nTemat: ${email.subject}\n\n${email.body}`,
      claimId: claimId,
    })
    setCurrentView("compose")
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
  }

  const handleBack = () => {
    setCurrentView("list")
    setSelectedEmail(null)
  }

  const handleCloseCompose = () => {
    setCurrentView("list")
    setComposeData({})
  }

  return (
    <div className="flex h-full bg-gray-50">
      <EmailSidebar
        folders={emailFolders}
        activeFolder={activeFolder}
        onFolderChange={setActiveFolder}
        onCompose={handleCompose}
      />

      {currentView === "list" && (
        <EmailList
          emails={filteredEmails}
          selectedEmails={selectedEmails}
          onEmailSelect={handleEmailSelect}
          onEmailClick={handleEmailClick}
          onSelectAll={handleSelectAll}
          onStarEmail={handleStarEmail}
          onArchiveEmails={handleArchiveEmails}
          onDeleteEmails={handleDeleteEmails}
          onMarkAsRead={handleMarkAsRead}
        />
      )}

      {currentView === "view" && selectedEmail && (
        <EmailView
          email={selectedEmail}
          onReply={handleReply}
          onReplyAll={handleReplyAll}
          onForward={handleForward}
          onBack={handleBack}
          onStar={handleStarEmail}
          onArchive={(id) => handleArchiveEmails([id])}
          onDelete={(id) => handleDeleteEmails([id])}
          requiredDocuments={reqDocuments}
          onAssignAttachment={handleAssignAttachment}
        />
      )}

      {currentView === "compose" && (
        <div className="flex-1 p-6 overflow-y-auto">
          <EmailComposeComponent
            onSend={handleSendEmail}
            onSaveDraft={handleSaveDraft}
            onClose={handleCloseCompose}
            replyTo={composeData.replyTo}
            replySubject={composeData.replySubject}
            replyBody={composeData.replyBody}
            claimId={composeData.claimId || ""}
            availableDocuments={documents}
          />
        </div>
      )}
    </div>
  )
}
