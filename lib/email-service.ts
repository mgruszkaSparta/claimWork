import { EmailFolder } from "@/types/email"
import { API_BASE_URL } from "./api"
import { authFetch } from "./auth-fetch"
import type { DocumentDto } from "./api"

export interface AttachmentDto {
  id: string
  fileName: string
  contentType: string
  size: number
  /** Fully qualified URL to download the attachment */
  url: string
  cloudUrl?: string
}

export interface EmailDto {
  id: string
  from: string
  to: string
  subject: string
  body: string
  htmlBody?: string
  isHtml?: boolean
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
  isStarred?: boolean
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

  async attachmentToDocument(
    attachmentId: string,
    eventId: string,
    category: string,
    move = false,
  ): Promise<DocumentDto | null> {
    try {
      const res = await authFetch(
        `${API_BASE_URL}/documents/email-attachment/${attachmentId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId, category, move }),
        },
      )
      if (!res.ok) throw new Error("Failed to transfer attachment")
      return (await res.json()) as DocumentDto
    } catch (error) {
      console.error("attachmentToDocument failed:", error)
      return null
    }
  }

  async getAllEmails(): Promise<EmailDto[]> {
    try {
      const response = await authFetch(this.apiUrl, {
        method: "GET",
      })
      if (!response.ok) throw new Error("Failed to fetch emails")
      const data = await response.json()
      return (data as any[]).map((e) => ({
        id: e.id,
        from: e.from,
        to: e.to,
        subject: e.subject,
        body: e.body,
        htmlBody: e.bodyHtml,
        isHtml: e.isHtml,
        receivedDate: e.receivedAt || e.sentAt || e.createdAt,
        read: e.isRead,
        claimIds: e.claimIds,
        eventId: e.eventId,
        direction: e.direction,
        status: e.status,
        isImportant: e.isImportant,
        isStarred: e.isStarred,
        attachments:
          e.attachments?.map((a: any) => {
            const url = a.cloudUrl || `${API_BASE_URL}/emails/attachment/${a.id}`
            return {
              id: a.id,
              fileName: a.fileName,
              contentType: a.contentType,
              size: a.fileSize,
              url,
              cloudUrl: a.cloudUrl || undefined,
            }
          }) || [],
      }))
    } catch (error) {
      console.error("getAllEmails failed:", error)
      return []
    }
  }

  async getEmailById(id: string): Promise<EmailDto | undefined> {
    if (!this.isValidGuid(id)) return undefined
    try {
      const response = await authFetch(`${this.apiUrl}/${id}`, {
        method: "GET",
      })
      if (!response.ok) throw new Error("Failed to fetch email")
      const e = await response.json()
      return {
        id: e.id,
        from: e.from,
        to: e.to,
        subject: e.subject,
        body: e.body,
        htmlBody: e.bodyHtml,
        isHtml: e.isHtml,
        receivedDate: e.receivedAt || e.sentAt || e.createdAt,
        read: e.isRead,
        claimIds: e.claimIds,
        eventId: e.eventId,
        direction: e.direction,
        status: e.status,
        isImportant: e.isImportant,
        isStarred: e.isStarred,
        attachments:
          e.attachments?.map((a: any) => {
            const url = a.cloudUrl || `${API_BASE_URL}/emails/attachment/${a.id}`
            return {
              id: a.id,
              fileName: a.fileName,
              contentType: a.contentType,
              size: a.fileSize,
              url,
              cloudUrl: a.cloudUrl || undefined,
            }
          }) || [],
      }
    } catch (error) {
      console.error(`getEmailById id=${id} failed:`, error)
      return undefined
    }
  }

  async deleteEmail(emailId: string): Promise<boolean> {
    if (!this.isValidGuid(emailId)) return false
    try {
      const response = await authFetch(`${this.apiUrl}/${emailId}`, {
        method: "DELETE",
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
        return emails.filter((e) => !e.eventId)
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
    return emails.filter((e) => !e.eventId)
  }

  async getEmailsByClaimId(claimId: string): Promise<EmailDto[]> {
    const emails = await this.getAllEmails()
    return emails.filter((e) => e.claimIds?.includes(claimId))
  }

  async getEmailsByEventId(
    eventId: string,
    folder?: EmailFolder,
  ): Promise<EmailDto[]> {
    if (!this.isValidGuid(eventId)) return []
    try {
      const url = folder
        ? `${this.apiUrl}/event/${eventId}?folder=${folder}`
        : `${this.apiUrl}/event/${eventId}`
      const response = await authFetch(url, {
        method: "GET",
      })
      if (!response.ok) throw new Error("Failed to fetch emails by event")
      const data = await response.json()
      return (data as any[]).map((e) => ({
        id: e.id,
        from: e.from,
        to: e.to,
        subject: e.subject,
        body: e.body,
        htmlBody: e.bodyHtml,
        isHtml: e.isHtml,
        receivedDate: e.receivedAt || e.sentAt || e.createdAt,
        read: e.isRead,
        claimIds: e.claimIds,
        eventId: e.eventId,
        direction: e.direction,
        status: e.status,
        isImportant: e.isImportant,
        isStarred: e.isStarred,
        attachments:
          e.attachments?.map((a: any) => {
            const url = a.cloudUrl || `${API_BASE_URL}/emails/attachment/${a.id}`
            return {
              id: a.id,
              fileName: a.fileName,
              contentType: a.contentType,
              size: a.fileSize,
              url,
              cloudUrl: a.cloudUrl || undefined,
            }
          }) || [],
      }))
    } catch (error) {
      console.error(`getEmailsByEventId eventId=${eventId} failed:`, error)
      return []
    }
  }

  async markAsRead(emailId: string): Promise<boolean> {
    if (!this.isValidGuid(emailId)) return false
    try {
      const response = await authFetch(`${this.apiUrl}/${emailId}/read`, {
        method: "PUT",
      })
      return response.ok
    } catch (error) {
      console.error("markAsRead failed:", error)
      return false
    }
  }

  async toggleImportant(emailId: string): Promise<boolean> {
    if (!this.isValidGuid(emailId)) return false
    try {
      const response = await authFetch(`${this.apiUrl}/${emailId}/important`, {
        method: "PUT",
      })
      return response.ok
    } catch (error) {
      console.error("toggleImportant failed:", error)
      return false
    }
  }

  async toggleStarred(emailId: string): Promise<boolean> {
    if (!this.isValidGuid(emailId)) return false
    try {
      const response = await authFetch(`${this.apiUrl}/${emailId}/starred`, {
        method: "PUT",
      })
      return response.ok
    } catch (error) {
      console.error("toggleStarred failed:", error)
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
      sendRequest.attachments?.forEach((file) =>
        formData.append("Attachments", file, file.name)
      )

      const response = await authFetch(this.apiUrl, {
        method: "POST",
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
      if (sendRequest.claimId) formData.append("claimId", sendRequest.claimId)
      if (sendRequest.eventId) formData.append("eventId", sendRequest.eventId)
      sendRequest.attachments?.forEach((file) =>
        formData.append("Attachments", file, file.name)
      )

      const response = await authFetch(`${this.apiUrl}/draft`, {
        method: "POST",
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
      const response = await authFetch(`${this.apiUrl}/attachment/${attachmentId}`, {
        method: "GET",
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
      formData.append("file", file, file.name)
      const response = await authFetch(`${this.apiUrl}/${emailId}/attachments`, {
        method: "POST",
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
      const response = await authFetch(`${this.apiUrl}/attachment/${attachmentId}`, {
        method: "DELETE",
      })
      return response.ok
    } catch (error) {
      console.error("deleteAttachment failed:", error)
      return false
    }
  }

  async assignEmailToClaim(emailId: string, claimIds: string[]): Promise<boolean> {
    try {
      const response = await authFetch(`${this.apiUrl}/assign-to-claim`, {
        method: "POST",
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
