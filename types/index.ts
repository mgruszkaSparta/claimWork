import type React from "react"

export interface Claim {
  id?: string
  spartaNumber?: string
  claimNumber?: string
  insurerClaimNumber?: string
  status?: string
  riskType?: string
  damageType?: string
  damageDate?: string
  eventTime?: string
  reportDate?: string
  reportDateToInsurer?: string
  eventLocation?: string
  eventDescription?: string
  comments?: string
  area?: string
  wereInjured?: boolean
  statementWithPerpetrator?: boolean
  perpetratorFined?: boolean
  reportingChannel?: string
  servicesCalled?: Service[]
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
  injuredParty?: ParticipantInfo
  perpetrator?: ParticipantInfo
  decisions?: Decision[]
  appeals?: Appeal[]
  clientClaims?: ClientClaim[]
  recourses?: Recourse[]
  settlements?: Settlement[]
  client?: string
  clientId?: string
  handler?: string
  handlerId?: string
  handlerEmail?: string
  handlerPhone?: string
  insuranceCompany?: string
  insuranceCompanyId?: string
  leasingCompany?: string
  leasingCompanyId?: string
  totalClaim?: number
  payout?: number
  currency?: string
  liquidator?: string
  brand?: string
  vehicleNumber?: string
  location?: string
  description?: string
  documents?: UploadedFile[]
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
  description: string
  detail: string
}

export interface Decision {
  id?: string
  eventId?: string
  decisionDate: string
  decisionType: string
  description: string
  amount?: number
  status?: string
}

export interface Appeal {
  id?: string
  eventId?: string
  appealDate: string
  appealType: string
  description: string
  status?: string
  amount?: number
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
  type: "image" | "pdf" | "doc" | "other"
  uploadedAt: string // ISO timestamp when the file was uploaded
  url: string
  category?: string
  description?: string
  date?: string
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
  eventId?: number
}
