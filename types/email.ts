export enum EmailFolder {
  Inbox = "Inbox",
  Sent = "Sent",
  Unread = "unread",
  Unassigned = "unassigned",
}

export interface EmailAttachment {
  id: number
  fileName: string
  contentType: string
  size: number
}

export interface Email {
  id: number
  from: string
  to: string
  subject: string
  body: string
  receivedDate: Date
  read?: boolean
  claimIds?: string[]
  attachments: EmailAttachment[]
}
