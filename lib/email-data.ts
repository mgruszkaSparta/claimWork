import type { Email, EmailFolder } from "@/types/email"

export const emailFolders: EmailFolder[] = [
  { id: "inbox", name: "Odebrane", count: 0, unreadCount: 0, icon: "Inbox" },
  { id: "sent", name: "Wysłane", count: 0, unreadCount: 0, icon: "Send" },
  { id: "drafts", name: "Szkice", count: 0, unreadCount: 0, icon: "FileEdit" },
  { id: "starred", name: "Oznaczone gwiazdką", count: 0, unreadCount: 0, icon: "Star" },
  { id: "important", name: "Ważne", count: 0, unreadCount: 0, icon: "AlertCircle" },
  { id: "trash", name: "Kosz", count: 0, unreadCount: 0, icon: "Trash2" },
  { id: "spam", name: "Spam", count: 0, unreadCount: 0, icon: "Shield" },
]

export const sampleEmails: Email[] = []

export const emailTemplates = [
  {
    id: "template1",
    name: "Potwierdzenie otrzymania dokumentów",
    subject: "Potwierdzenie otrzymania dokumentów - {{claimNumber}}",
    body: "Dzień dobry,\n\nPotwierdzamy otrzymanie dokumentów dotyczących szkody {{claimNumber}}.\n\nDokumenty zostaną przeanalizowane w ciągu 2-3 dni roboczych.\n\nW razie pytań proszę o kontakt.\n\nPozdrawiam,\n{{handlerName}}",
  },
  {
    id: "template2",
    name: "Prośba o dodatkowe dokumenty",
    subject: "Prośba o dodatkowe dokumenty - {{claimNumber}}",
    body: "Dzień dobry,\n\nW związku z likwidacją szkody {{claimNumber}} prosimy o przesłanie następujących dokumentów:\n\n- \n- \n- \n\nDokumenty można przesłać mailem lub dostarczyć osobiście.\n\nPozdrawiam,\n{{handlerName}}",
  },
  {
    id: "template3",
    name: "Informacja o zakończeniu likwidacji",
    subject: "Zakończenie likwidacji szkody - {{claimNumber}}",
    body: "Dzień dobry,\n\nInformujemy, że likwidacja szkody {{claimNumber}} została zakończona.\n\nWyszczególnienie odszkodowania:\n- Naprawa pojazdu: {{repairCost}} PLN\n- Pozostałe koszty: {{otherCosts}} PLN\n- Razem: {{totalCost}} PLN\n\nOdszkodowanie zostanie wypłacone w ciągu 14 dni.\n\nPozdrawiam,\n{{handlerName}}",
  },
]
