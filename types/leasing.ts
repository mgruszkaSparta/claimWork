// Base model for leasing company data
export interface LeasingCompany {
  id: number
  name: string
  formLink: string
  phone: string
  email: string
}

// Model for the dropdown state
export interface LeasingDropdownState {
  isOpen: boolean
  searchTerm: string
  selectedCompanyId: number | null
}

// Model for company filtering options
export interface LeasingFilterOptions {
  hasFormLink: boolean | null
  hasPhone: boolean | null
  hasEmail: boolean | null
}

// Model for company details view
export interface LeasingCompanyDetails extends LeasingCompany {
  hasValidFormLink: boolean
  hasValidPhone: boolean
  hasValidEmail: boolean
}

// Model for company selection event
export interface LeasingCompanySelectionEvent {
  companyId: number
  companyName: string
}

// Enum for leasing company types
export enum LeasingCompanyType {
  CAR = "car",
  EQUIPMENT = "equipment",
  REAL_ESTATE = "real_estate",
  OTHER = "other",
}

// Extended company model with additional properties
export interface ExtendedLeasingCompany extends LeasingCompany {
  type: LeasingCompanyType
  address?: string
  website?: string
  logoUrl?: string
  description?: string
}
