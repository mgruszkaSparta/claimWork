// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

// Types for API responses
export interface EventListItemDto {
  id: number
  spartaNumber?: string
  claimNumber?: string
  vehicleNumber?: string
  client?: string
  liquidator?: string
  brand?: string
  status?: string
  damageDate?: string
  totalClaim?: number
  payout?: number
  currency?: string
}

export interface EventDto extends EventListItemDto {
  reportDate?: string
  reportDateToInsurer?: string
  eventTime?: string
  location?: string
  description?: string
  servicesCalled?: string
  participants?: ParticipantDto[]
  damages?: DamageDto[]
  decisions?: DecisionDto[]
  appeals?: AppealDto[]
  clientClaims?: ClientClaimDto[]
  recourses?: RecourseDto[]
  settlements?: SettlementDto[]
}

export interface EventUpsertDto {
  spartaNumber?: string
  claimNumber?: string
  vehicleNumber?: string
  client?: string
  liquidator?: string
  brand?: string
  status?: string
  damageDate?: string
  reportDate?: string
  reportDateToInsurer?: string
  eventTime?: string
  location?: string
  description?: string
  servicesCalled?: string
  totalClaim?: number
  payout?: number
  currency?: string
  participants?: ParticipantUpsertDto[]
  damages?: DamageUpsertDto[]
  decisions?: DecisionUpsertDto[]
  appeals?: AppealUpsertDto[]
  clientClaims?: ClientClaimUpsertDto[]
  recourses?: RecourseUpsertDto[]
  settlements?: SettlementUpsertDto[]
}

export interface ParticipantDto {
  id?: number
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
  id?: number
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
  id?: number
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
  id?: number
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
  id?: number
  eventId?: number
  damageTypeId?: number
  description?: string
  estimatedCost?: number
  actualCost?: number
  status?: string
}

export interface DamageUpsertDto {
  id?: number
  description: string
  detail?: string
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
  id?: number
  decisionDate?: string
  decisionType?: string
  description?: string
  amount?: number
  status?: string
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
  id?: number
  appealDate?: string
  appealType?: string
  description?: string
  status?: string
  amount?: number
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
  id?: number
  claimDate?: string
  claimType?: string
  description?: string
  amount?: number
  status?: string
  currency?: number
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
  id?: number
  recourseDate?: string
  recourseType?: string
  description?: string
  amount?: number
  status?: string
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
  id?: number
  settlementDate?: string
  settlementType?: string
  description?: string
  amount?: number
  status?: string
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

    const data = await response.json()
    console.log("Response data:", data)
    return data
  }

  async getClaims(): Promise<EventListItemDto[]> {
    return this.request<EventListItemDto[]>("/events")
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

  async updateClaim(id: string, claim: EventUpsertDto): Promise<EventDto> {
    return this.request<EventDto>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(claim),
    })
  }

  async deleteClaim(id: string): Promise<void> {
    return this.request<void>(`/events/${id}`, {
      method: "DELETE",
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

  async updateEvent(id: string, event: Partial<EventDto>): Promise<EventDto> {
    return this.request<EventDto>(`/events/${id}`, {
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
