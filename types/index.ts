import type React from "react"
import type { ClaimDto, DocumentDto } from "@/lib/api"
import type { Settlement } from "@/lib/api/settlements"

export type { Settlement } from "@/lib/api/settlements"

export type ClaimStatus =
  | "Złożone"
  | "W trakcie analizy"
  | "Zaakceptowane"
  | "Odrzucone"
  | "Częściowo zaakceptowane"

export interface Note {
  id?: string
  type?: "note" | "task" | "internal" | "status"
  title?: string
  description: string
  user?: string
  createdAt?: string
  priority?: "low" | "medium" | "high"
  status?: "active" | "completed" | "cancelled"
  dueDate?: string
}


export interface TransportDamage {
  transportType: string
  transportTypeId: string
  cargoDescription: string
  losses: string[]
  carrier: string
  policyNumber: string
  inspectionContactName: string
  inspectionContactPhone: string
  inspectionContactEmail: string
}
export interface SubcontractorInfo {
  subcontractorName: string
  subcontractorPolicyNumber: string
  subcontractorInsurer: string
  complaintToSubcontractor?: boolean
  complaintToSubcontractorDate?: string
  claimFromSubcontractorPolicy?: boolean
  claimFromSubcontractorPolicyDate?: string
  complaintResponse?: boolean
  complaintResponseDate?: string

}

export interface Claim
  extends Omit<
    ClaimDto,
    | "id"
    | "clientId"
    | "insuranceCompanyId"
    | "leasingCompanyId"
    | "handlerId"
    | "servicesCalled"
    | "participants"
    | "damages"
    | "decisions"
    | "appeals"
    | "clientClaims"
    | "recourses"
    | "settlements"
    | "subcontractorName"
    | "subcontractorPolicyNumber"
    | "subcontractorInsurer"
    | "complaintToSubcontractor"
    | "complaintToSubcontractorDate"
    | "claimFromSubcontractorPolicy"
    | "claimFromSubcontractorPolicyDate"
    | "complaintResponse"
    | "complaintResponseDate"
    | "cargoDescription"
    | "losses"
    | "carrier"
    | "carrierPolicyNumber"
    | "inspectionContactName"
    | "inspectionContactPhone"
    | "inspectionContactEmail"
    | "transportType"
    | "transportTypeId"
  > {
  id?: string
  clientId?: string
  insuranceCompanyId?: string
  leasingCompanyId?: string
  handlerId?: string
  isDraft?: boolean
  /**
   * List of services called.
   * API stores this as a comma-separated string
   * (e.g. "policja,pogotowie").
   */
  servicesCalled?: Service[]
  insurerClaimNumber?: string
  eventLocation?: string
  eventDescription?: string
  comments?: string
  area?: string
  wereInjured?: boolean
  statementWithPerpetrator?: boolean
  perpetratorFined?: boolean
  reportingChannel?: string
  policeDescription?: string
  ambulanceDescription?: string
  fireDescription?: string
  towDescription?: string
  policeUnitDetails?: string
  vehicleType?: string
  vehicleTypeId?: string
  vehicleTypeCode?: string
  propertyDamageSubject?: string
  damageListing?: string
  inspectionContact?: string
  injuredData?: string
  perpetratorData?: string
  injuredPartyData?: Record<string, any>
  cargoDetails?: string
  carrierInfo?: string
  damageDescription?: string
  transportDamage?: TransportDamage
  damages?: DamageItem[]
  notes?: Note[]
  injuredParty?: ParticipantInfo
  perpetrator?: ParticipantInfo
  decisions?: Decision[]
  appeals?: Appeal[]
  clientClaims?: ClientClaim[]
  recourses?: Recourse[]
  settlements?: Settlement[]
  handlerEmail?: string
  handlerPhone?: string
  documents?: UploadedFile[]
  pendingFiles?: UploadedFile[]
  documentsSectionProps?: DocumentsSectionProps
  subcontractor?: SubcontractorInfo
}

export interface ParticipantInfo {
  id: string
  name: string
  address: string
  city: string
  postalCode: string
  country: string
  phone: string
  email: string
  vehicleRegistration: string
  vehicleVin: string
  vehicleType: string
  vehicleBrand: string
  vehicleModel: string
  vehicleYear?: number
  inspectionContactName?: string
  inspectionContactPhone?: string
  inspectionContactEmail?: string
  insuranceCompany: string
  policyNumber: string
  policyStartDate?: string
  policyEndDate?: string
  policyDealDate?: string
  policySumAmount?: number
  drivers: DriverInfo[]
  // Additional fields for participant form
  firstName?: string
  lastName?: string
  personalId?: string
  owner?: string
  coOwner?: string
  vehicleAddress?: string
  firstRegistrationDate?: string
  citizenship?: string
  street?: string
  houseNumber?: string
  flatNumber?: string
  inspectionNotes?: string
}

export interface DriverInfo {
  id: string
  name: string
  licenseNumber: string
  role?: 'kierowca' | 'wlasciciel' | 'wspol_wlasciciel'
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  personalId?: string
}

export interface DamageItem {
  id?: string
  eventId?: string
  description: string
  detail: string
  isSaved?: boolean
}

export interface Decision {
  id?: string
  eventId?: string
  decisionDate: string
  status?: string
  amount?: number
  currency?: string
  compensationTitle?: string | null
  documentDescription?: string | null
  documentName?: string | null
  documentPath?: string | null
  documents?: DocumentDto[]
}

export interface Appeal {
  id?: string
  eventId?: string
  appealNumber?: string
  submissionDate?: string
  extensionDate?: string
  decisionDate?: string
  reason?: string
  status?: string
  notes?: string
  description?: string
  appealAmount?: number
  decisionReason?: string
  documentPath?: string
  documentName?: string
  documentDescription?: string
  documents?: UploadedFile[]
}

export interface ClientClaim {
  id?: string
  eventId?: string
  claimNumber?: string
  claimDate: string
  claimType: string
  claimAmount?: number
  currency?: string
  status?: ClaimStatus
  description?: string
  documentPath?: string
  documentName?: string
  documentDescription?: string
  claimNotes?: string
  createdAt?: string
  updatedAt?: string
  /**
   * Local-only fields for client-side handling
   */
  document?: UploadedFile
  documents?: DocumentDto[]
  claimId?: string
}

export interface Recourse {
  id?: string
  eventId?: string
  recourseDate: string
  recourseType: string
  description: string
  amount?: number
  status?: string
}

export type Service = "policja" | "pogotowie" | "straz" | "holownik"

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: "image" | "pdf" | "doc" | "video" | "other"
  uploadedAt: string // ISO timestamp when the file was uploaded
  url: string
  cloudUrl?: string
  /** Human readable category name for UI display */
  category?: string
  /** Machine readable category code for API communication */
  categoryCode?: string
  description?: string
  date?: string
  file?: File
}

export interface RequiredDocument {
  id: string
  name: string
  required: boolean
  uploaded: boolean
  description: string
  category?: string
}

export interface DocumentsSectionProps {
  uploadedFiles: UploadedFile[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  requiredDocuments: RequiredDocument[]
  setRequiredDocuments: React.Dispatch<React.SetStateAction<RequiredDocument[]>>

  eventId?: string
  pendingFiles?: UploadedFile[]
  setPendingFiles?: React.Dispatch<React.SetStateAction<UploadedFile[]>>

  /**
   * Optional key used to persist user preferences (e.g. view mode) for each
   * section separately. When provided, UI state is stored in localStorage under
   * this key so changing the view in one section doesn't affect others.
   */
  storageKey?: string
  /**
   * List of document category names that should be hidden from the user.
   * Useful for categories that are managed in dedicated modules (e.g. decyzje,
   * regresy) and shouldn't appear in the generic documents section.
   */
  hiddenCategories?: string[]
}

export interface DocumentsSectionRef {
  downloadAll: (category?: string) => Promise<void>
  downloadSelected: (category?: string) => Promise<void>
  /**
   * Set search query for documents in this section.
   * Used for global document search across sections.
   */
  search: (query: string) => void
}
