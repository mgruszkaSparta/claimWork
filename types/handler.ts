// Base model for handler data
export interface Handler {
  id: number
  name: string
  email: string
  phone: string
  department?: string
  position?: string
}

// Model for the dropdown state
export interface HandlerDropdownState {
  isOpen: boolean
  searchTerm: string
  selectedHandlerId: number | null
}

// Model for handler filtering options
export interface HandlerFilterOptions {
  hasDepartment: boolean | null
  hasPhone: boolean | null
  hasEmail: boolean | null
}

// Model for handler details view
export interface HandlerDetails extends Handler {
  hasValidPhone: boolean
  hasValidEmail: boolean
  hasValidDepartment: boolean
}

// Model for handler selection event
export interface HandlerSelectionEvent {
  handlerId: number
  handlerName: string
  handlerEmail: string
  handlerPhone: string
  handlerDepartment?: string
}

// Enum for handler departments
export enum HandlerDepartment {
  CLAIMS = "claims",
  LEGAL = "legal",
  TECHNICAL = "technical",
  CUSTOMER_SERVICE = "customer_service",
  MANAGEMENT = "management",
}

// Extended handler model with additional properties
export interface ExtendedHandler extends Handler {
  department: HandlerDepartment
  position: string
  avatar?: string
  bio?: string
  specializations?: string[]
}
