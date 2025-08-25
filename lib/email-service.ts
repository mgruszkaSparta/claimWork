import { EmailFolder } from "@/types/email"
import { API_BASE_URL } from "./api"

export interface AttachmentDto {
  id: string
  fileName: string
  contentType: string
  size: number
  /** Fully qualified URL to download the attachment */
  url: string
}

export interface EmailDto {
  id: string
  from: string
  to: string
  subject: string
  body: string
  /**
   * Date string representing when the email was received or sent.
   * The backend returns "receivedAt" for inbound messages and
   * "sentAt" for outbound ones. We map it to a generic
   * `receivedDate` property for the UI.
   */
  receivedDate?: string
  read?: boolean
  claimIds?: string[]
  eventId?: string
  attachments: AttachmentDto[]
  direction?: string
  status?: string
  isImportant?: boolean
}

export interface SendEmailRequestDto {
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
  attachments?: File[]
  claimId?: string
  eventId?: string
}

export interface AssignEmailToClaimDto {
  emailId: string
  claimIds: string[]
}

class EmailService {
  private apiUrl = `${API_BASE_URL}/emails`
  private defaultFrom = "noreply@automotiveclaims.com"

  private isValidGuid(id: string): boolean {
    const guidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    return guidRegex.test(id)
  }

  async getAllEmails(): Promise<EmailDto[]> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "GET",
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to fetch emails")
      const data = await response.json()
      return (data as any[]).map((e) => ({
        id: e.id,
        from: e.from,
        to: e.to,
        subject: e.subject,
        body: e.body,
        receivedDate: e.receivedAt || e.sentAt || e.createdAt,
        read: e.isRead,
        claimIds: e.claimIds,
        eventId: e.eventId,
        direction: e.direction,
        status: e.status,
        isImportant: e.isImportant,
        attachments:
          e.attachments?.map((a: any) => ({
            id: a.id,
            fileName: a.fileName,
            contentType: a.contentType,
            size: a.fileSize,
            url: `/api/emails/attachment/${a.id}`,
          })) || [],
      }))
    } catch (error) {
      console.error("getAllEmails failed:", error)
      return []
    }
  }

  async getEmailById(id: string): Promise<EmailDto | undefined> {
    if (!this.isValidGuid(id)) return undefined
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: "GET",
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to fetch email")
      const e = await response.json()
      return {
        id: e.id,
        from: e.from,
        to: e.to,
        subject: e.subject,
        body: e.body,
        receivedDate: e.receivedAt || e.sentAt || e.createdAt,
        read: e.isRead,
        claimIds: e.claimIds,
        eventId: e.eventId,
        direction: e.direction,
        status: e.status,
        isImportant: e.isImportant,
        attachments:
          e.attachments?.map((a: any) => ({
            id: a.id,
            fileName: a.fileName,
            contentType: a.contentType,
            size: a.fileSize,
            url: `/api/emails/attachment/${a.id}`,
          })) || [],
      }
    } catch (error) {
      console.error(`getEmailById id=${id} failed:`, error)
      return undefined
    }
  }

  async deleteEmail(emailId: string): Promise<boolean> {
    if (!this.isValidGuid(emailId)) return false
    try {
      const response = await fetch(`${this.apiUrl}/${emailId}`, {
        method: "DELETE",
        credentials: "include",
      })
      return response.ok
    } catch (error) {
      console.error("deleteEmail failed:", error)
      return false
    }
  }

  async getEmailsByFolder(folder: EmailFolder): Promise<EmailDto[]> {
    const emails = await this.getAllEmails()
    if (folder === EmailFolder.Unread) {
      return emails.filter((email) => !email.read && email.direction === "Inbound")
    }

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
  }

  async getAssignedEmailsByFolderAndClaim(
    folder: EmailFolder,
    claimId: string,
  ): Promise<EmailDto[]> {
    const emails = await this.getEmailsByFolder(folder)
    return emails.filter((email) => email.claimIds?.includes(claimId))
  }

  async getUnassignedEmails(): Promise<EmailDto[]> {
    const emails = await this.getAllEmails()
    return emails.filter((e) => !e.claimIds || e.claimIds.length === 0)
  }

  async getEmailsByClaimId(claimId: string): Promise<EmailDto[]> {
    const emails = await this.getAllEmails()
    return emails.filter((e) => e.claimIds?.includes(claimId))
  }

  async getEmailsByEventId(eventId: string): Promise<EmailDto[]> {
    if (!this.isValidGuid(eventId)) return []
    try {
      const response = await fetch(`${this.apiUrl}/event/${eventId}`, {
        method: "GET",
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to fetch emails by event")
      const data = await response.json()
      return (data as any[]).map((e) => ({
        id: e.id,
        from: e.from,
        to: e.to,
        subject: e.subject,
        body: e.body,
        receivedDate: e.receivedAt || e.sentAt || e.createdAt,
        read: e.isRead,
        claimIds: e.claimIds,
        eventId: e.eventId,
        direction: e.direction,
        status: e.status,
        isImportant: e.isImportant,
        attachments:
          e.attachments?.map((a: any) => ({
            id: a.id,
            fileName: a.fileName,
            contentType: a.contentType,
            size: a.fileSize,
            url: `/api/emails/attachment/${a.id}`,
          })) || [],
      }))
    } catch (error) {
      console.error(`getEmailsByEventId eventId=${eventId} failed:`, error)
      return []
    }
  }

  async markAsRead(emailId: string): Promise<boolean> {
    if (!this.isValidGuid(emailId)) return false
    try {
      const response = await fetch(`${this.apiUrl}/${emailId}/read`, {
        method: "PUT",
        credentials: "include",
      })
      return response.ok
    } catch (error) {
      console.error("markAsRead failed:", error)
      return false
    }
  }

  async sendEmail(sendRequest: SendEmailRequestDto): Promise<boolean> {
    try {
      const formData = new FormData()
      formData.append("to", sendRequest.to)
      if (sendRequest.cc) formData.append("cc", sendRequest.cc)
      if (sendRequest.bcc) formData.append("bcc", sendRequest.bcc)
      formData.append("subject", sendRequest.subject)
      formData.append("body", sendRequest.body)
      formData.append("isHtml", "false")
      if (sendRequest.claimId) formData.append("claimId", sendRequest.claimId)
      if (sendRequest.eventId) formData.append("eventId", sendRequest.eventId)
      sendRequest.attachments?.forEach((file) => formData.append("attachments", file))

      const response = await fetch(this.apiUrl, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      return response.ok
    } catch (error) {
      console.error("sendEmail failed:", error)
      return false
    }
  }

  async saveDraft(sendRequest: SendEmailRequestDto): Promise<boolean> {
    try {
      const formData = new FormData()
      formData.append("to", sendRequest.to)
      if (sendRequest.cc) formData.append("cc", sendRequest.cc)
      if (sendRequest.bcc) formData.append("bcc", sendRequest.bcc)
      formData.append("subject", sendRequest.subject)
      formData.append("body", sendRequest.body)
      formData.append("isHtml", "false")
      formData.append("direction", "Outbound")
      if (sendRequest.claimId) formData.append("claimIds", sendRequest.claimId)
      if (sendRequest.eventId) formData.append("eventId", sendRequest.eventId)
      sendRequest.attachments?.forEach((file) => formData.append("attachments", file))

      const response = await fetch(`${this.apiUrl}/draft`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      return response.ok
    } catch (error) {
      console.error("saveDraft failed:", error)
      return false
    }
  }

  async downloadAttachment(attachmentId: string): Promise<Blob | undefined> {
    if (!this.isValidGuid(attachmentId)) return undefined
    try {
      const response = await fetch(`${this.apiUrl}/attachment/${attachmentId}`, {
        method: "GET",
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to download attachment")
      return await response.blob()
    } catch (error) {
      console.error("downloadAttachment failed:", error)
      return undefined
    }
  }

  async uploadAttachment(
    emailId: string,
    file: File,
  ): Promise<AttachmentDto | undefined> {
    if (!this.isValidGuid(emailId)) return undefined
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch(`${this.apiUrl}/${emailId}/attachments`, {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      if (!response.ok) throw new Error("Failed to upload attachment")
      return (await response.json()) as AttachmentDto
    } catch (error) {
      console.error("uploadAttachment failed:", error)
      return undefined
    }
  }

  async deleteAttachment(attachmentId: string): Promise<boolean> {
    if (!this.isValidGuid(attachmentId)) return false
    try {
      const response = await fetch(`${this.apiUrl}/attachment/${attachmentId}`, {
        method: "DELETE",
        credentials: "include",
      })
      return response.ok
    } catch (error) {
      console.error("deleteAttachment failed:", error)
      return false
    }
  }

  async assignEmailToClaim(emailId: string, claimIds: string[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/assign-to-claim`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId, claimIds }),
      })
      return response.ok
    } catch (error) {
      console.error("assignEmailToClaim failed:", error)
      return false
    }
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  isUnread(email: EmailDto): boolean {
    return !email.read
  }

  hasAttachments(email: EmailDto): boolean {
    return !!email.attachments && email.attachments.length > 0
  }
}

export const emailService = new EmailService()
