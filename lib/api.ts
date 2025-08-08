// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.API_BASE_URL ? `${process.env.API_BASE_URL}/api` : "https://claim-work-backend.azurewebsites.net/api")

// Types for API responses
export interface EventListItemDto {
  id: string
  spartaNumber?: string
  claimNumber?: string
  vehicleNumber?: string
  clientId?: number
  client?: string
  liquidator?: string
  brand?: string
  status?: string
  damageDate?: string
  totalClaim?: number
  payout?: number
  currency?: string
  insuranceCompanyId?: number
  insuranceCompany?: string
  leasingCompanyId?: number
  leasingCompany?: string
  handlerId?: number
  handler?: string
}

export interface EventDto extends EventListItemDto {
  reportDate?: string
  reportDateToInsurer?: string
  eventTime?: string
  location?: string
  description?: string

  /**
   * Comma-separated list of services that were called
   * e.g. "policja,pogotowie,straz".
   */
  servicesCalled?: string

  insuranceCompanyId?: number
  handlerId?: number
  riskType?: string
  damageType?: string
  participants?: ParticipantDto[]
  damages?: DamageDto[]
  decisions?: DecisionDto[]
  appeals?: AppealDto[]
  clientClaims?: ClientClaimDto[]
  recourses?: RecourseDto[]
  settlements?: SettlementDto[]
}

export interface DocumentDto {
  id?: string
  filePath?: string
}

export interface EventUpsertDto {
  spartaNumber?: string
  claimNumber?: string
  vehicleNumber?: string
  clientId?: number
  client?: string
  liquidator?: string
  brand?: string
  status?: string
  riskType?: string
  damageType?: string
  insuranceCompanyId?: number
  insuranceCompany?: string
  leasingCompanyId?: number
  leasingCompany?: string
  handlerId?: number
  handler?: string
  damageDate?: string
  reportDate?: string
  reportDateToInsurer?: string
  eventTime?: string
  location?: string
  description?: string

  /**
   * Comma-separated list of services that were called
   * e.g. "policja,pogotowie,straz".
   */
  servicesCalled?: string

  totalClaim?: number
  payout?: number
  currency?: string
  participants?: ParticipantUpsertDto[]

  notes?: NoteUpsertDto[]
  emails?: EmailUpsertDto[]
}

export interface NoteUpsertDto {
  eventId?: string
  category?: string
  title?: string
  content: string
  createdBy?: string
  isPrivate?: boolean
  priority?: string
  tags?: string[]
}

export interface EmailUpsertDto {
  from: string
  to: string
  cc?: string
  bcc?: string
  subject: string
  body: string
  bodyHtml?: string
  isHtml?: boolean
  priority?: string
  direction?: string
  status?: string
  sentAt?: string
  receivedAt?: string
  readAt?: string
  isRead?: boolean
  isImportant?: boolean
  isArchived?: boolean
  tags?: string
  category?: string
  claimId?: string
  claimNumber?: string
  threadId?: string
  messageId?: string
  inReplyTo?: string
  references?: string
  
  documents?: DocumentDto[]
  damages?: DamageUpsertDto[]
  decisions?: DecisionUpsertDto[]
  appeals?: AppealUpsertDto[]
  clientClaims?: ClientClaimUpsertDto[]
  recourses?: RecourseUpsertDto[]
  settlements?: SettlementUpsertDto[]

}

export interface ParticipantDto {
  id?: string
  role?: string
  name?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  insuranceCompany?: string
  policyNumber?: string
  vehicleRegistration?: string
  vehicleVin?: string
  vehicleType?: string
  vehicleBrand?: string
  vehicleModel?: string
  inspectionContactName?: string
  inspectionContactPhone?: string
  inspectionContactEmail?: string
  drivers?: DriverDto[]
}

export interface ParticipantUpsertDto {
  id?: string
  role?: string
  name?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  insuranceCompany?: string
  policyNumber?: string
  vehicleRegistration?: string
  vehicleVin?: string
  vehicleType?: string
  vehicleBrand?: string
  vehicleModel?: string
  inspectionContactName?: string
  inspectionContactPhone?: string
  inspectionContactEmail?: string
  drivers?: DriverUpsertDto[]
}

export interface DriverDto {
  id?: string
  name?: string
  licenseNumber?: string
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  personalId?: string
  role?: string
}

export interface DriverUpsertDto {
  id?: string
  name?: string
  licenseNumber?: string
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  personalId?: string
  role?: string
}

export interface DamageDto {
  id?: string
  eventId?: string
  damageTypeId?: number
  description?: string
  estimatedCost?: number
  actualCost?: number
  status?: string
}

export interface DamageUpsertDto {
  id?: string
  eventId?: string
  description?: string
  detail?: string
  location?: string
  severity?: string
  estimatedCost?: number
  actualCost?: number
  repairStatus?: string
  repairDate?: string
  repairShop?: string
  notes?: string
}

export interface DecisionDto {
  id?: number
  eventId?: number
  decisionDate?: string
  decisionType?: string
  description?: string
  amount?: number
}

export interface DecisionUpsertDto {
  eventId?: string
  decisionDate?: string
  decisionType?: string
  decisionDescription?: string
  decisionAmount?: number
  decisionStatus?: string
  decisionNumber?: string
  description?: string
  reason?: string
  notes?: string
}

export interface AppealDto {
  id?: number
  eventId?: number
  appealDate?: string
  appealType?: string
  description?: string
  status?: string
}

export interface AppealUpsertDto {
  eventId?: string
  appealNumber?: string
  submissionDate?: string
  reason?: string
  status?: string
  notes?: string
  description?: string
  appealAmount?: number
  decisionDate?: string
  decisionReason?: string
}

export interface ClientClaimDto {
  id?: number
  eventId?: number
  claimDate?: string
  claimType?: string
  description?: string
  amount?: number
  status?: string
}

export interface ClientClaimUpsertDto {
  eventId?: string
  claimNumber?: string
  claimDate?: string
  claimType?: string
  claimAmount?: number
  currency?: string
  status?: string
  description?: string
  documentPath?: string
  documentName?: string
  documentDescription?: string
  claimNotes?: string
}

export interface RecourseDto {
  id?: number
  eventId?: number
  recourseDate?: string
  recourseType?: string
  description?: string
  amount?: number
  status?: string
}

export interface RecourseUpsertDto {
  eventId?: string
  status?: string
  initiationDate?: string
  description?: string
  notes?: string
  recourseNumber?: string
  recourseAmount?: number
}

export interface SettlementDto {
  id?: number
  eventId?: number
  settlementDate?: string
  settlementType?: string
  description?: string
  amount?: number
  status?: string
}

export interface SettlementUpsertDto {
  eventId?: string
  settlementNumber?: string
  settlementType?: string
  externalEntity?: string
  customExternalEntity?: string
  transferDate?: string
  status?: string
  settlementDate?: string
  amount?: number
  settlementAmount?: number
  currency?: string
  paymentMethod?: string
  notes?: string
  description?: string
  documentPath?: string
  documentName?: string
  documentDescription?: string
}

// API Service
class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    console.log(`Making API request to: ${url}`)
    console.log("Request options:", options)

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    console.log(`Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} - ${errorText}`)
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    if (response.status === 204) {
      console.log("No content in response")
      return undefined as T
    }

    const contentType = response.headers.get("content-type") ?? ""
    if (contentType.includes("application/json")) {
      try {
        const data = await response.json()
        console.log("Response data:", data)
        return data
      } catch {
        console.log("No content in response")
        return undefined as T
      }
    }

    const text = await response.text()
    console.log("Response text:", text)
    return text as unknown as T
  }

  async getClaims(): Promise<EventListItemDto[]> {
    const claims = await this.request<EventListItemDto[] | undefined>("/events")
    return claims ?? []
  }

  async getClaim(id: string): Promise<EventDto> {
    return this.request<EventDto>(`/events/${id}`)
  }

  async createClaim(claim: EventUpsertDto): Promise<EventDto> {
    return this.request<EventDto>("/events", {
      method: "POST",
      body: JSON.stringify(claim),
    })
  }

  async updateClaim(id: string, claim: EventUpsertDto): Promise<EventDto | undefined> {
    return this.request<EventDto | undefined>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(claim),
    })
  }

  async deleteClaim(id: string): Promise<void> {
    return this.request<void>(`/events/${id}`, {
      method: "DELETE",
    })
  }

  async initializeClaim(): Promise<{ id: string }> {
    return this.request<{ id: string }>("/events/initialize", {
      method: "POST",
    })
  }

  // Events API
  async getEvents(): Promise<EventDto[]> {
    return this.request<EventDto[]>("/events")
  }

  async getEvent(id: string): Promise<EventDto> {
    return this.request<EventDto>(`/events/${id}`)
  }

  async createEvent(event: Partial<EventDto>): Promise<EventDto> {
    return this.request<EventDto>("/events", {
      method: "POST",
      body: JSON.stringify(event),
    })
  }

  async updateEvent(id: string, event: Partial<EventDto>): Promise<EventDto | undefined> {
    return this.request<EventDto | undefined>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(event),
    })
  }

  async deleteEvent(id: string): Promise<void> {
    return this.request<void>(`/events/${id}`, {
      method: "DELETE",
    })
  }

  async getEventByClaimNumber(claimNumber: string): Promise<EventDto> {
    return this.request<EventDto>(`/events/by-claim/${claimNumber}`)
  }
}

export const apiService = new ApiService()
