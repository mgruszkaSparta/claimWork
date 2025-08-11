import type React from "react"
import type { ClaimDto } from "@/lib/api"

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
  > {
  id?: string
  clientId?: string
  insuranceCompanyId?: string
  leasingCompanyId?: string
  handlerId?: string
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
  damageDescription?: string
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
  compensationTitle?: string
  documentDescription?: string | null
  documentName?: string | null
  documentPath?: string | null
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
}

export interface ClientClaim {
  currency?: string;
  id?: string
  eventId?: string
  claimDate: string
  claimType: string
  description: string
  amount?: number
  status?: string
  documentDescription?: string
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

export interface Settlement {
  id?: string
  eventId?: string
  settlementDate: string
  settlementType: string
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


}
