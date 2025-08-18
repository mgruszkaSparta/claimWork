export interface Client {
  id: number
  name: string
  fullName?: string
  shortName?: string
  nip?: string
  regon?: string
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
