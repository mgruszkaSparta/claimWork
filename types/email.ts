export enum EmailFolder {
  Inbox = "inbox",
  Sent = "sent",
  Drafts = "drafts",
  Starred = "starred",
  Important = "important",
  Trash = "trash",
  Spam = "spam",
  Unassigned = "unassigned",
}

export interface EmailFolderItem {
  id: EmailFolder | string
  name: string
  count: number
  unreadCount: number
  icon: string
}

export interface EmailAttachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  file?: File
}

export interface Email {
  id: string
  from: string
  fromName: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  htmlBody?: string
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  folder: EmailFolder | string
  date: string
  attachments: EmailAttachment[]
  labels: string[]
  claimId?: string
  claimIds?: string[]
  threadId?: string
}

export interface EmailCompose {
  to: string
  cc: string
  bcc: string
  subject: string
  body: string
  attachments: EmailAttachment[]
  isHtml: boolean
  priority: "normal" | "high"
  replyTo?: string
  inReplyTo?: string
  claimId?: string
}

export type { EmailFolderItem as EmailFolderDefinition }

