// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "/api"

export async function getJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })
  const text = await res.text().catch(() => "")
  if (!res.ok) {
    throw new Error(`GET ${path} ${res.status}: ${text || res.statusText}`)
  }
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(`GET ${path} ${res.status}: Invalid JSON response: ${text}`)
  }
}

// Types for API responses
export interface EventListItemDto {
  id: string
  spartaNumber?: string
  claimNumber?: string
  vehicleNumber?: string
  victimRegistrationNumber?: string
  perpetratorRegistrationNumber?: string
  clientId?: number
  client?: string
  liquidator?: string
  brand?: string
  status?: string
  claimStatusId?: number
  damageDate?: string
  totalClaim?: number
  payout?: number
  currency?: string
  insuranceCompanyId?: number
  insuranceCompany?: string
  insurerClaimNumber?: string
  reportDate?: string
  riskType?: string
  damageType?: string
  leasingCompanyId?: number
  leasingCompany?: string
  handlerId?: number
  handler?: string
  objectTypeId?: number
  registeredById?: string
  registeredByName?: string
}

export interface EventDto extends EventListItemDto {
  reportDateToInsurer?: string
  eventTime?: string
  location?: string
  description?: string
  rowVersion?: string

  /**
   * Comma-separated list of services that were called
   * e.g. "policja,pogotowie,straz".
   */
  servicesCalled?: string

  propertyDamageSubject?: string
  damageListing?: string
  inspectionContact?: string
  policeDescription?: string
  ambulanceDescription?: string
  fireDescription?: string
  towDescription?: string
  injuredData?: string
  perpetratorData?: string

  insuranceCompanyId?: number
  handlerId?: number
  riskType?: string
  damageType?: string
  subcontractorName?: string
  subcontractorPolicyNumber?: string
  subcontractorInsurer?: string
  complaintToSubcontractor?: boolean
  complaintToSubcontractorDate?: string
  claimFromSubcontractorPolicy?: boolean
  claimFromSubcontractorPolicyDate?: string
  complaintResponse?: boolean
  complaintResponseDate?: string
  cargoDescription?: string
  losses?: string[]
  carrier?: string
  carrierPolicyNumber?: string
  inspectionContactName?: string
  inspectionContactPhone?: string
  inspectionContactEmail?: string
  participants?: ParticipantDto[]
  damages?: DamageDto[]
  notes?: NoteDto[]
  decisions?: DecisionDto[]
  appeals?: AppealDto[]
  clientClaims?: ClientClaimDto[]
  recourses?: RecourseDto[]
  settlements?: SettlementDto[]
}

export interface DocumentDto {
  id: string
  eventId?: string
  fileName: string
  originalFileName?: string
  filePath: string
  cloudUrl?: string
  fileSize: number
  contentType: string
  category?: string
  description?: string
  uploadedBy?: string
  status?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  downloadUrl?: string
  previewUrl?: string
  canPreview?: boolean
}

export interface ClaimNotificationSettings {
  recipients: string[]
  events: string[]
}

export interface AdminSettings {
  version: string
  serverTime: string
}

export interface EventUpsertDto {
  id?: string
  rowVersion?: string
  spartaNumber?: string
  claimNumber?: string
  vehicleNumber?: string
  victimRegistrationNumber?: string
  perpetratorRegistrationNumber?: string
  clientId?: number
  client?: string
  liquidator?: string
  brand?: string
  status?: string
  claimStatusId?: number
  riskType?: string
  damageType?: string
  objectTypeId?: number
  registeredById?: string
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

  propertyDamageSubject?: string
  damageListing?: string
  inspectionContact?: string
  policeDescription?: string
  ambulanceDescription?: string
  fireDescription?: string
  towDescription?: string
  injuredData?: string
  perpetratorData?: string

  totalClaim?: number
  payout?: number
  currency?: string
  subcontractorName?: string
  subcontractorPolicyNumber?: string
  subcontractorInsurer?: string
  complaintToSubcontractor?: boolean
  complaintToSubcontractorDate?: string
  claimFromSubcontractorPolicy?: boolean
  claimFromSubcontractorPolicyDate?: string
  complaintResponse?: boolean
  complaintResponseDate?: string
  cargoDescription?: string
  losses?: string
  carrier?: string
  carrierPolicyNumber?: string
  inspectionContactName?: string
  inspectionContactPhone?: string
  inspectionContactEmail?: string
  participants?: ParticipantUpsertDto[]

  notes?: NoteUpsertDto[]
  emails?: EmailUpsertDto[]
}

export interface ClaimListItemDto extends EventListItemDto {}
export interface ClaimDto extends EventDto {
  notes?: NoteDto[]
}
export interface ClaimUpsertDto extends EventUpsertDto {
  notes?: NoteUpsertDto[]
}

export interface UserListItemDto {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  status: "active" | "inactive"
  createdAt?: string
  lastLogin?: string
}

export interface UpdateUsersBulkDto {
  userIds: string[]
  action: "activate" | "deactivate" | "assignRole" | "delete"
  role?: string
}

export interface ClientDto {
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
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface CreateClientDto {
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
}

export interface UpdateClientDto {
  name?: string
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
}

export interface RiskTypeDto {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
}

export interface DamageTypeDto {
  id: string
  code: string
  name: string
  description?: string
  riskTypeId: string
  riskTypeName?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface CaseHandlerDto {
  id: number
  name: string
  code?: string
  email?: string
  phone?: string
  department?: string
  isActive: boolean
}

export interface CreateCaseHandlerDto {
  name: string
  code?: string
  email?: string
  phone?: string
  department?: string
  isActive?: boolean
}

export interface UpdateCaseHandlerDto {
  name?: string
  code?: string
  email?: string
  phone?: string
  department?: string
  isActive?: boolean
}

export interface CreateRiskTypeDto {
  code: string
  name: string
  description?: string
  isActive?: boolean
}

export interface UpdateRiskTypeDto {
  code?: string
  name?: string
  description?: string
  isActive?: boolean
}

export interface CreateDamageTypeDto {
  code: string
  name: string
  description?: string
  riskTypeId: string
  isActive?: boolean
}

export interface UpdateDamageTypeDto {
  code?: string
  name?: string
  description?: string
  riskTypeId?: string
  isActive?: boolean
}

export interface NoteDto {
  id: string
  eventId: string
  category?: string
  title?: string
  content: string
  createdBy?: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
  isPrivate: boolean
  priority?: string
  tags?: string[]
}

export interface NoteUpsertDto {
  id?: string
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
  decisions?: DecisionDto[]
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
  policyDealDate?: string
  policyStartDate?: string
  policyEndDate?: string
  firstRegistrationDate?: string
  policySumAmount?: number
  inspectionNotes?: string
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
  policyDealDate?: string
  policyStartDate?: string
  policyEndDate?: string
  firstRegistrationDate?: string
  policySumAmount?: number
  inspectionNotes?: string
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
  id?: string
  eventId?: string
  decisionDate?: string
  status?: string
  amount?: number
  currency?: string
  compensationTitle?: string | null
  documentDescription?: string | null
  documentName?: string | null
  documentPath?: string | null
}

export interface AppealDto {
  id: string
  eventId?: string
  submissionDate?: string
  extensionDate?: string
  decisionDate?: string
  reason?: string
  status?: string
  notes?: string
  description?: string
  appealNumber?: string
  appealAmount?: number
  decisionReason?: string
  documentPath?: string
  documentName?: string
  documentDescription?: string
  documentId?: string
  documents?: DocumentDto[]
  createdAt?: string
  updatedAt?: string
  daysSinceSubmission?: number
}

export interface AppealUpsertDto {
  id?: string
  eventId?: string
  appealNumber?: string
  submissionDate?: string
  extensionDate?: string
  reason?: string
  status?: string
  notes?: string
  description?: string
  appealAmount?: number
  decisionDate?: string
  decisionReason?: string
  documentPath?: string
  documentName?: string
  documentDescription?: string
}

export interface ClientClaimDto {
  id: string
  eventId: string
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
  documentId?: string
  documents?: DocumentDto[]
  claimNotes?: string
  createdAt: string
  updatedAt: string
}

export interface ClientClaimUpsertDto {
  id?: string
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
  id?: string
  eventId?: string
  status?: string
  initiationDate?: string
  description?: string
  notes?: string
  recourseNumber?: string
  recourseAmount?: number
  isJustified?: boolean
  filingDate?: string
  insuranceCompany?: string
  obtainDate?: string
  amount?: number
  currencyCode?: string
  documentPath?: string
  documentName?: string
  documentDescription?: string
  documentId?: string
  documents?: DocumentDto[]
  createdAt?: string
  updatedAt?: string
}

export interface RecourseUpsertDto {
  id?: string
  eventId?: string
  status?: string
  initiationDate?: string
  description?: string
  notes?: string
  recourseNumber?: string
  recourseAmount?: number
  isJustified?: boolean
  filingDate?: string
  insuranceCompany?: string
  obtainDate?: string
  amount?: number
  currencyCode?: string
  documentDescription?: string
  documentPath?: string
  documentName?: string
}

export interface SettlementDto {
  id?: number
  eventId?: number
  claimId?: string
  externalEntity?: string
  customExternalEntity?: string
  transferDate?: string
  settlementDate?: string
  settlementNumber?: string
  settlementType?: string
  amount?: number
  settlementAmount?: number
  currency?: string
  paymentMethod?: string
  notes?: string
  description?: string
  status?: string
  documentPath?: string
  documentName?: string
  documentDescription?: string
  documentId?: string
  documents?: DocumentDto[]
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
  private getToken(): string | null {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )token=([^;]+)/)
      return match ? decodeURIComponent(match[1]) : null
    }
    return null
  }

  private setToken(token: string | null) {
    if (typeof document !== "undefined") {
      if (token) {
        document.cookie = `token=${token}; path=/`
      } else {
        document.cookie = "token=; Max-Age=0; path=/"
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    if (process.env.NODE_ENV === "development") {
      console.log(`Making API request to: ${url}`)
      console.log("Request options:", options)
    }

    const token = this.getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const response = await fetch(url, {
      credentials: "include",
      headers,
      ...options,
    })

    if (process.env.NODE_ENV === "development") {
      console.log(`Response status: ${response.status}`)
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} - ${errorText}`)
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    if (response.status === 204) {
      if (process.env.NODE_ENV === "development") {
        console.log("No content in response")
      }
      return undefined as T
    }

    const contentType = response.headers.get("content-type") ?? ""
    if (contentType.includes("application/json")) {
      try {
        const data = await response.json()
        if (process.env.NODE_ENV === "development") {
          console.log("Response data:", data)
        }
        return data
      } catch {
        if (process.env.NODE_ENV === "development") {
          console.log("No content in response")
        }
        return undefined as T
      }
    }

    const text = await response.text()
    if (process.env.NODE_ENV === "development") {
      console.log("Response text:", text)
    }
    return text as unknown as T
  }

  async register(data: {
    userName: string
    email: string
    password: string
    firstName: string
    lastName: string
    roles: string[]
    status: "active" | "inactive"
    phone?: string
  }): Promise<void> {
    await this.request<void>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ mustChangePassword: boolean }> {
    const data = await this.request<{ mustChangePassword: boolean }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ userName: username, password }),
      },
    )
    return { mustChangePassword: data.mustChangePassword }
  }

  async forceChangePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await this.request<void>("/auth/force-change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  async logout(): Promise<void> {
    await this.request<void>("/auth/logout", { method: "POST" })
    this.setToken(null)
  }

  async checkHealth(): Promise<void> {
    try {
      await fetch(API_BASE_URL, { method: "HEAD" })
    } catch {
      throw new Error("API unavailable")
    }
  }

  async getCurrentUser(): Promise<{ id: string; username: string; email?: string; roles?: string[]; createdAt?: string; lastLogin?: string } | undefined> {
    const data = await this.request<{ id: string; userName: string; email: string; roles: string[]; createdAt: string; lastLogin?: string }>("/auth/me")
    if (!data) return undefined
    return { id: data.id, username: data.userName, email: data.email, roles: data.roles, createdAt: data.createdAt, lastLogin: data.lastLogin }
  }


  async getUser(id: string): Promise<{ id: string; userName: string; email?: string; createdAt?: string; lastLogin?: string }> {
    return await this.request<{ id: string; userName: string; email?: string; createdAt?: string; lastLogin?: string }>(`/auth/users/${id}`)

  }

  async updateUser(
    id: string,
    data: {
      userName?: string
      email?: string
      firstName?: string
      lastName?: string
      roles?: string[]
      status?: "active" | "inactive"
      phone?: string
    },
  ): Promise<void> {
    await this.request<void>(`/auth/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async createUser(data: {
    userName: string
    email?: string
    password: string
  }): Promise<void> {
    await this.request<void>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async checkEmail(email: string): Promise<boolean> {
    const result = await this.request<{ isUnique?: boolean; exists?: boolean }>(
      `/auth/users/check-email?email=${encodeURIComponent(email)}`,
    )
    if (result == null) return false
    if (typeof result.isUnique === "boolean") return result.isUnique
    if (typeof result.exists === "boolean") return !result.exists
    return true
  }
  async getUsers(
    params: {
      search?: string
      role?: string
      status?: string
      page?: number
      pageSize?: number
      sortBy?: string
      sortOrder?: "asc" | "desc"
    } = {},
  ): Promise<{ items: UserListItemDto[]; totalCount: number }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value))
      }
    })

    const url = `/auth/users${searchParams.toString() ? `?${searchParams.toString()}` : ""}`

    const token = this.getToken()
    const response = await fetch(`${API_BASE_URL}${url}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { items: [], totalCount: 0 }
      }
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    const data = (await response.json()) as UserListItemDto[]
    const totalCountHeader = response.headers.get("X-Total-Count")
    const totalCount = totalCountHeader
      ? parseInt(totalCountHeader, 10)
      : data.length

    return { items: data ?? [], totalCount }
  }

  async updateUsersBulk(data: UpdateUsersBulkDto): Promise<void> {
    await this.request<void>("/auth/users/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getClaims(
    params: Record<string, string | number | undefined> = {},
  ): Promise<{ items: ClaimListItemDto[]; totalCount: number }> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value))
      }
    })

    const url = `/claims${searchParams.toString() ? `?${searchParams.toString()}` : ""}`

    const token = this.getToken()
    const response = await fetch(`${API_BASE_URL}${url}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { items: [], totalCount: 0 }
      }
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }

    const data = (await response.json()) as ClaimListItemDto[]
    const totalCountHeader = response.headers.get("X-Total-Count")
    const totalCount = totalCountHeader
      ? parseInt(totalCountHeader, 10)
      : data.length

    return { items: data ?? [], totalCount }

  }

  async getClaim(id: string): Promise<ClaimDto> {
    return this.request<ClaimDto>(`/claims/${id}`)
  }

  async createClaim(claim: ClaimUpsertDto): Promise<ClaimDto> {
    return this.request<ClaimDto>("/claims", {
      method: "POST",
      body: JSON.stringify(claim),
    })
  }


  async updateClaim(
    id: string,
    claim: ClaimUpsertDto,
  ): Promise<ClaimDto | undefined> {

    return this.request<ClaimDto | undefined>(`/claims/${id}`, {
      method: "PUT",
      body: JSON.stringify(claim),
    })
  }

  async deleteClaim(id: string): Promise<void> {
    return this.request<void>(`/claims/${id}`, {
      method: "DELETE",
    })
  }

  async initializeClaim(): Promise<{ id: string }> {
    return this.request<{ id: string }>("/claims/initialize", {
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

  // Clients API
  async getClients(): Promise<ClientDto[]> {
    return this.request<ClientDto[]>('/clients')
  }

  async getClient(id: number): Promise<ClientDto> {
    return this.request<ClientDto>(`/clients/${id}`)
  }

  async createClient(client: CreateClientDto): Promise<ClientDto> {
    return this.request<ClientDto>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    })
  }

  async updateClient(id: number, client: UpdateClientDto): Promise<void> {
    await this.request<void>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    })
  }

  async deleteClient(id: number): Promise<void> {
    await this.request<void>(`/clients/${id}`, {
      method: 'DELETE',
    })
  }

  // Risk Types API
  async getRiskTypes(
    params: { claimObjectTypeId?: number } = {},
  ): Promise<RiskTypeDto[]> {
    const searchParams = new URLSearchParams()
    if (params.claimObjectTypeId !== undefined) {
      searchParams.append('claimObjectTypeId', String(params.claimObjectTypeId))
    }

    const url = `/RiskTypes${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

    return this.request<RiskTypeDto[]>(url)
  }

  async createRiskType(data: CreateRiskTypeDto): Promise<RiskTypeDto> {
    return this.request<RiskTypeDto>('/RiskTypes', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateRiskType(id: string, data: UpdateRiskTypeDto): Promise<void> {
    await this.request<void>(`/RiskTypes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteRiskType(id: string): Promise<void> {
    const token = this.getToken()
    const response = await fetch(`${API_BASE_URL}/RiskTypes/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    if (!response.ok) {
      const errorText = await response.text()
      const error: any = new Error(errorText)
      error.status = response.status
      throw error
    }
  }

  // Damage Types API
  async getDamageTypes(params: { riskTypeId?: string; isActive?: boolean } = {}): Promise<DamageTypeDto[]> {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const url = `/damage-types${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return this.request<DamageTypeDto[]>(url)
  }

  async createDamageType(data: CreateDamageTypeDto): Promise<DamageTypeDto> {
    return this.request<DamageTypeDto>('/damage-types', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateDamageType(id: string, data: UpdateDamageTypeDto): Promise<void> {
    await this.request<void>(`/damage-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteDamageType(id: string): Promise<void> {
    await this.request<void>(`/damage-types/${id}`, {
      method: 'DELETE',
    })
  }

  // Case Handlers API
  async getCaseHandlers(): Promise<CaseHandlerDto[]> {
    return this.request<CaseHandlerDto[]>('/case-handlers')
  }

  async createCaseHandler(data: CreateCaseHandlerDto): Promise<CaseHandlerDto> {
    return this.request<CaseHandlerDto>('/case-handlers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateCaseHandler(id: number, data: UpdateCaseHandlerDto): Promise<void> {
    await this.request<void>(`/case-handlers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteCaseHandler(id: number): Promise<void> {
    await this.request<void>(`/case-handlers/${id}`, {
      method: 'DELETE',
    })
  }

  // Notification settings API
  async getNotificationSettings(): Promise<ClaimNotificationSettings> {
    return this.request<ClaimNotificationSettings>('/ClaimNotifications')
  }

  async updateNotificationSettings(data: ClaimNotificationSettings): Promise<void> {
    await this.request<void>('/ClaimNotifications', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Admin API
  async getAdminSettings(): Promise<AdminSettings> {
    return this.request<AdminSettings>('/admin/settings')
  }

  async forgotPassword(email: string): Promise<void> {
    return this.request<void>("/auth/forgot-password", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(
    email: string,
    token: string,
    password: string,
  ): Promise<void> {
    return this.request<void>("/auth/reset-password", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ email, token, password }),
    })
  }
}

export const apiService = new ApiService()
