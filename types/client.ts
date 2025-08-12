export interface Client {
  id: number
  name: string
  fullName?: string
  shortName?: string
  taxId?: string
  registrationNumber?: string
  phoneNumber?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ClientSelectionEvent {
  clientId: number
  clientName: string
}
