import { EmailFolder } from "@/types/email"

export interface AttachmentDto {
  id: number
  fileName: string
  contentType: string
  size: number
}

export interface EmailDto {
  id: number
  from: string
  to: string
  subject: string
  body: string
  receivedDate: Date
  read?: boolean
  claimId?: string | null
  attachments: AttachmentDto[]
}

export interface SendEmailRequestDto {
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
  attachments?: File[]
  claimId?: string
}

export interface AssignEmailToClaimDto {
  emailId: number
  claimId: string
}

class EmailService {
  private apiUrl = "/api/emails"

  async getAllEmails(): Promise<EmailDto[]> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "GET",
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to fetch emails")
      return await response.json()
    } catch (error) {
      console.error("getAllEmails failed:", error)
      return []
    }
  }

  async getEmailById(id: number): Promise<EmailDto | undefined> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: "GET",
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to fetch email")
      return await response.json()
    } catch (error) {
      console.error(`getEmailById id=${id} failed:`, error)
      return undefined
    }
  }

  async deleteEmail(emailId: number): Promise<boolean> {
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
    if (folder === EmailFolder.Unread) {
      const emails = await this.getEmailsByFolder(EmailFolder.Inbox)
      return emails.filter((email) => !email.read)
    }

    try {
      const response = await fetch(`${this.apiUrl}/folder/${folder}`, {
        method: "GET",
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to fetch emails by folder")
      return await response.json()
    } catch (error) {
      console.error("getEmailsByFolder failed:", error)
      return []
    }
  }

  async getAssignedEmailsByFolderAndClaim(folder: EmailFolder, claimId: string): Promise<EmailDto[]> {
    if (folder === EmailFolder.Unread) {
      const emails = await this.getAssignedEmailsByFolderAndClaim(EmailFolder.Inbox, claimId)
      return emails.filter((email) => !email.read)
    }

    try {
      const response = await fetch(
        `${this.apiUrl}/folder/${folder}/assigned/${claimId}`,
        {
          method: "GET",
          credentials: "include",
        },
      )
      if (!response.ok) throw new Error("Failed to fetch assigned emails")
      return await response.json()
    } catch (error) {
      console.error("getAssignedEmailsByFolderAndClaim failed:", error)
      return []
    }
  }

  async getUnassignedEmails(): Promise<EmailDto[]> {
    try {
      const response = await fetch(`${this.apiUrl}/unassigned`, {
        method: "GET",
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to fetch unassigned emails")
      return await response.json()
    } catch (error) {
      console.error("getUnassignedEmails failed:", error)
      return []
    }
  }

  async getEmailsByClaimId(claimId: string): Promise<EmailDto[]> {
    try {
      const response = await fetch(`${this.apiUrl}/by-claim/${claimId}`, {
        method: "GET",
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to fetch emails by claim")
      return await response.json()
    } catch (error) {
      console.error("getEmailsByClaimId failed:", error)
      return []
    }
  }

  async markAsRead(emailId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/${emailId}/read`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
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
      formData.append("subject", sendRequest.subject)
      formData.append("body", sendRequest.body)

      if (sendRequest.cc) formData.append("cc", sendRequest.cc)
      if (sendRequest.bcc) formData.append("bcc", sendRequest.bcc)

      if (sendRequest.attachments) {
        sendRequest.attachments.forEach((file) => {
          formData.append("attachments", file, file.name)
        })
      }

      const url = sendRequest.claimId
        ? `${this.apiUrl}/sendClaim?claimId=${sendRequest.claimId}`
        : `${this.apiUrl}/send`

      const response = await fetch(url, {
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

  async downloadAttachment(attachmentId: number): Promise<Blob | undefined> {
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

  async assignEmailToClaim(emailId: number, claimId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/assign-to-claim`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId, claimId }),
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
