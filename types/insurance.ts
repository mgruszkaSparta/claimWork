// Model podstawowy dla danych towarzystwa ubezpieczeniowego
export interface InsuranceCompany {
  id: number
  name: string
  formLink: string
  phone: string
  email: string
  notes?: string
  leasingIds?: number[] // Powiązane ID firm leasingowych
}

// Model dla stanu dropdown
export interface DropdownState {
  isOpen: boolean
  searchTerm: string
  selectedCompanyId: number | null
}

// Model dla opcji filtrowania firm
export interface FilterOptions {
  hasFormLink: boolean | null
  hasPhone: boolean | null
  hasEmail: boolean | null
}

// Model dla szczegółów firmy
export interface CompanyDetails extends InsuranceCompany {
  hasValidFormLink: boolean
  hasValidPhone: boolean
  hasValidEmail: boolean
}

// Model dla zdarzenia wyboru firmy
export interface CompanySelectionEvent {
  companyId: number
  companyName: string
}
