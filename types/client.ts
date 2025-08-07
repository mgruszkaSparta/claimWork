// Base model for client data
export interface Client {
  id: number
  name: string
  address: string
  city: string
  postalCode: string
  phone: string
  email: string
  nip?: string
  regon?: string
  krs?: string
}

// Model for the dropdown state
export interface ClientDropdownState {
  isOpen: boolean
  searchTerm: string
  selectedClientId: number | null
}

// Model for client filtering options
export interface ClientFilterOptions {
  hasPhone: boolean | null
  hasEmail: boolean | null
  hasNip: boolean | null
}

// Model for client details view
export interface ClientDetails extends Client {
  hasValidPhone: boolean
  hasValidEmail: boolean
  hasValidNip: boolean
}

// Model for client selection event
export interface ClientSelectionEvent {
  clientId: number
  clientName: string
}

// Enum for client types
export enum ClientType {
  INDIVIDUAL = "individual",
  COMPANY = "company",
  TRANSPORT = "transport",
  OTHER = "other",
}

// Extended client model with additional properties
export interface ExtendedClient extends Client {
  type: ClientType
  website?: string
  logoUrl?: string
  description?: string
  contactPerson?: string
}
