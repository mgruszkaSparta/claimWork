import { API_BASE_URL, ClientClaimDto } from "../api"
import type { ClientClaim, ClaimStatus } from "@/types"

export interface ClientClaimUpsert {
  eventId?: string
  claimNumber?: string
  claimDate: string
  claimType: string
  claimAmount: number
  currency: string
  status: ClaimStatus
  description?: string
  claimNotes?: string
  documentDescription?: string
}

const CLIENT_CLAIMS_URL = `${API_BASE_URL}/clientclaims`

function mapDtoToClientClaim(dto: ClientClaimDto): ClientClaim {
  return {
    id: dto.id,
    eventId: dto.eventId,
    claimNumber: dto.claimNumber || undefined,
    claimDate: dto.claimDate?.split("T")[0] || "",
    claimType: dto.claimType || "",
    claimAmount: dto.claimAmount,
    currency: dto.currency,
    status: dto.status as ClaimStatus,
    description: dto.description || undefined,
    documentPath: dto.documentPath || undefined,
    documentName: dto.documentName || undefined,
    documentDescription: dto.documentDescription || undefined,
    claimNotes: dto.claimNotes || undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

function buildFormData(data: ClientClaimUpsert, document?: File) {
  const formData = new FormData()
  if (data.eventId) formData.append("EventId", data.eventId)
  formData.append("ClaimDate", data.claimDate)
  formData.append("ClaimType", data.claimType)
  formData.append("ClaimAmount", data.claimAmount.toString())
  formData.append("Currency", data.currency)
  formData.append("Status", data.status)
  if (data.description) formData.append("Description", data.description)
  if (data.claimNotes) formData.append("ClaimNotes", data.claimNotes)
  if (data.claimNumber) formData.append("ClaimNumber", data.claimNumber)
  if (data.documentDescription)
    formData.append("DocumentDescription", data.documentDescription)
  if (document) formData.append("Document", document)
  return formData
}

export async function createClientClaim(
  data: ClientClaimUpsert,
  document?: File,
): Promise<ClientClaim> {
  const body = buildFormData(data, document)
  const response = await fetch(CLIENT_CLAIMS_URL, {
    method: "POST",
    credentials: "include",
    body,
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || "Failed to create client claim")
  }
  const dto = (await response.json()) as ClientClaimDto
  return mapDtoToClientClaim(dto)
}

export async function updateClientClaim(
  id: string,
  data: ClientClaimUpsert,
  document?: File,
): Promise<ClientClaim> {
  const body = buildFormData(data, document)
  const response = await fetch(`${CLIENT_CLAIMS_URL}/${id}`, {
    method: "PUT",
    credentials: "include",
    body,
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || "Failed to update client claim")
  }
  const dto = (await response.json()) as ClientClaimDto
  return mapDtoToClientClaim(dto)
}

export async function deleteClientClaim(id: string): Promise<void> {
  const response = await fetch(`${CLIENT_CLAIMS_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || "Failed to delete client claim")
  }
}

export async function downloadClientClaimDocument(id: string): Promise<Blob> {
  const response = await fetch(`${CLIENT_CLAIMS_URL}/${id}/download`, {
    method: "GET",
    credentials: "include",
  })
  if (!response.ok) {
    throw new Error("Failed to download document")
  }
  return response.blob()
}

export async function previewClientClaimDocument(id: string): Promise<Blob> {
  const response = await fetch(`${CLIENT_CLAIMS_URL}/${id}/preview`, {
    method: "GET",
    credentials: "include",
  })
  if (!response.ok) {
    throw new Error("Failed to preview document")
  }
  return response.blob()
}
