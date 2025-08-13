"use client"

import { useState, useCallback } from "react"
import {
  apiService,
  type ClaimUpsertDto,
  type ClaimDto,
  type ParticipantUpsertDto,
} from "@/lib/api"
import type { Claim, ParticipantInfo, DriverInfo, Note } from "@/types"

const toIso = (value?: string, field?: string): string | undefined => {
  if (!value) return undefined
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) {
    if (field) {
      console.warn(`Invalid date for ${field}: "${value}"`)
    }
    return undefined
  }
  return new Date(parsed).toISOString()
}

export const transformApiClaimToFrontend = (apiClaim: ClaimDto): Claim => {
  const injuredParty = apiClaim.participants?.find((p: any) => p.role === "Poszkodowany")
  const perpetrator = apiClaim.participants?.find((p: any) => p.role === "Sprawca")

  const mapParticipantDto = (p: any): ParticipantInfo => ({
    ...p,
    id: p.id?.toString() || "",
    policyDealDate: p.policyDealDate ? p.policyDealDate.split("T")[0] : undefined,
    policyStartDate: p.policyStartDate ? p.policyStartDate.split("T")[0] : undefined,
    policyEndDate: p.policyEndDate ? p.policyEndDate.split("T")[0] : undefined,
    firstRegistrationDate: p.firstRegistrationDate
      ? p.firstRegistrationDate.split("T")[0]
      : undefined,
    drivers: p.drivers?.map((d: any) => ({
      ...d,
      id: d.id?.toString() || "",
    })) || [],
  })

  return {
    ...apiClaim,
    id: apiClaim.id,
    rowVersion: apiClaim.rowVersion,
    insuranceCompanyId: apiClaim.insuranceCompanyId?.toString(),
    leasingCompanyId: apiClaim.leasingCompanyId?.toString(),
    handlerId: apiClaim.handlerId?.toString(),
    clientId: apiClaim.clientId?.toString(),
    totalClaim: apiClaim.totalClaim ?? 0,
    payout: apiClaim.payout ?? 0,
    currency: apiClaim.currency ?? "PLN",

    eventTime: apiClaim.eventTime?.split("T")[1]?.slice(0, 5),

    servicesCalled: Array.isArray(apiClaim.servicesCalled)
      ? apiClaim.servicesCalled
      : (apiClaim.servicesCalled?.split(",").filter(Boolean) ?? []),

    damages: apiClaim.damages?.map((d: any) => ({
      id: d.id?.toString(),
      eventId: d.eventId?.toString(),
      description: d.description,
      detail: d.detail,
    })) || [],
    notes:
      apiClaim.notes?.map((n: any) => ({
        id: n.id,
        type: (n.category as Note["type"]) || "note",
        title: n.title,
        description: n.content,
        user: n.createdBy,
        createdAt: n.createdAt,
        priority: n.priority as Note["priority"],
      })) || [],
    decisions: apiClaim.decisions || [],
    appeals: apiClaim.appeals,
    clientClaims:
      apiClaim.clientClaims?.map((c: any) => ({
        id: c.id,
        eventId: c.eventId,
        claimNumber: c.claimNumber,
        claimDate: c.claimDate,
        claimType: c.claimType,
        claimAmount: c.claimAmount,
        currency: c.currency,
        status: c.status,
        description: c.description,
        documentPath: c.documentPath,
        documentName: c.documentName,
        documentDescription: c.documentDescription,
        claimNotes: c.claimNotes,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })) || [],
    recourses: apiClaim.recourses || [],
    settlements: apiClaim.settlements || [],
    injuredParty: injuredParty ? mapParticipantDto(injuredParty) : undefined,
    perpetrator: perpetrator ? mapParticipantDto(perpetrator) : undefined,
  }
}

export const transformFrontendClaimToApiPayload = (
  claimData: Partial<Claim>,
): ClaimUpsertDto => {
  const {
    id,
    rowVersion,
    decisions,
    appeals,
    clientClaims,
    recourses,
    settlements,
    damages,
    notes,
    injuredParty,
    perpetrator,
    servicesCalled,
    documents,
    insuranceCompanyId,
    leasingCompanyId,
    handlerId,
    clientId,
    riskType,
    damageType,
    registeredByUserId,
    registeredByUserName,

    ...rest
  } = claimData

  let damageTypeValue: string | undefined
  if (typeof damageType === "object" && damageType !== null) {
    damageTypeValue = (damageType as any).code ?? (damageType as any).id
  } else if (typeof damageType === "number") {
    damageTypeValue = damageType.toString()
  } else if (typeof damageType === "string") {
    damageTypeValue = damageType
  }

  const participants: ParticipantUpsertDto[] = []

  const isGuid = (value: string) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      value,
    )

  const mapParticipant = (p: ParticipantInfo, role: string): ParticipantUpsertDto => ({

    id: p.id && isGuid(p.id) ? p.id : undefined,
    role,

    name: p.name,
    phone: p.phone,
    email: p.email,
    address: p.address,
    city: p.city,
    postalCode: p.postalCode,
    country: p.country,
    insuranceCompany: p.insuranceCompany,
    policyNumber: p.policyNumber,
    policyDealDate: toIso(p.policyDealDate, `${role}.policyDealDate`),
    policyStartDate: toIso(p.policyStartDate, `${role}.policyStartDate`),
    policyEndDate: toIso(p.policyEndDate, `${role}.policyEndDate`),
    firstRegistrationDate: toIso(
      p.firstRegistrationDate,
      `${role}.firstRegistrationDate`,
    ),
    policySumAmount: p.policySumAmount,
    vehicleRegistration: p.vehicleRegistration,
    vehicleVin: p.vehicleVin,
    vehicleType: p.vehicleType,
    vehicleBrand: p.vehicleBrand,
    vehicleModel: p.vehicleModel,
    inspectionNotes: p.inspectionNotes,
    inspectionContactName: p.inspectionContactName,
    inspectionContactPhone: p.inspectionContactPhone,
    inspectionContactEmail: p.inspectionContactEmail,
    drivers: p.drivers?.map((d: DriverInfo) => ({

      id: d.id && isGuid(d.id) ? d.id : undefined,

      name: d.name,
      licenseNumber: d.licenseNumber,
      firstName: d.firstName,
      lastName: d.lastName,
      phone: d.phone,
      email: d.email,
      address: d.address,
      city: d.city,
      postalCode: d.postalCode,
      country: d.country,
      personalId: d.personalId,
      role: d.role,
    })),
  })

  if (injuredParty) {
    participants.push(mapParticipant(injuredParty, "Poszkodowany"))
  }
  if (perpetrator) {
    participants.push(mapParticipant(perpetrator, "Sprawca"))
  }

  return {
    id,
    rowVersion,
    ...rest,

    // Convert string identifiers to numbers for API payload
    insuranceCompanyId: insuranceCompanyId ? parseInt(insuranceCompanyId, 10) : undefined,
    leasingCompanyId: leasingCompanyId ? parseInt(leasingCompanyId, 10) : undefined,
    clientId: clientId ? parseInt(clientId, 10) : undefined,
    handlerId: handlerId ? parseInt(handlerId, 10) : undefined,
    riskType,
    ...(damageTypeValue ? { damageType: damageTypeValue } : {}),
    damageDate: toIso(rest.damageDate, "damageDate"),
    reportDate: toIso(rest.reportDate, "reportDate"),
    reportDateToInsurer: toIso(rest.reportDateToInsurer, "reportDateToInsurer"),
    eventTime: toIso(
      rest.damageDate && rest.eventTime
        ? `${rest.damageDate}T${rest.eventTime}`
        : undefined,
      "eventTime",
    ),
    servicesCalled: servicesCalled?.join(","),
    participants: participants,

    documents: documents?.map((d) => ({ id: d.id, filePath: d.url })),

    damages: damages?.map((d) => ({
      id: d.id,
      eventId: d.eventId,
      description: d.description,
      detail: d.detail,
    })),
    ...(Array.isArray(notes) && notes.length > 0
      ? {
          notes: notes.map((n: Note) => ({
            id: n.id && n.id.startsWith("temp-") ? undefined : n.id,
            category: n.type,
            title: n.title,
            content: n.description,
            createdBy: n.user,
            priority: n.priority,
          })),
        }
      : {}),
    ...(Array.isArray(decisions) && decisions.length > 0
      ? {
          decisions: decisions.map((d) => ({
            ...d,
            decisionDate: toIso(d.decisionDate, "decisions.decisionDate"),
          })),
        }
      : {}),

    ...(Array.isArray(appeals) && appeals.length > 0
      ? {
          appeals: appeals.map((a) => ({
            ...a,
            appealDate: toIso(a.appealDate, "appeals.appealDate"),
          })),
        }
      : {}),

    clientClaims: clientClaims?.map((c) => {
      const { id, claimDate, document, claimId, createdAt, updatedAt, ...rest } = c
      return {
        ...rest,
        ...(id && isGuid(id) ? { id } : {}),
        claimDate: toIso(claimDate, "clientClaims.claimDate"),
      }
    }),
    recourses: recourses?.map((r) => ({
      ...r,
      recourseDate: toIso(r.recourseDate, "recourses.recourseDate"),
    })),

    // Settlements may be managed through dedicated endpoints. When included
    // in the claim payload, ensure IDs are valid GUID strings; otherwise omit
    // them to prevent backend validation errors.
    ...(settlements && settlements.length > 0

      ? {
          settlements: settlements.map((s) => {
            const { id, settlementDate, ...rest } = s
            const isGuid =
              typeof id === "string" &&
              /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)

            return {
              ...rest,
              ...(isGuid ? { id } : {}),
              settlementDate: toIso(
                settlementDate,
                "settlements.settlementDate",
              ),
            }
          }),
        }
      : {}),

  }
}

export function useClaims() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const fetchClaims = useCallback(

    async (params: Record<string, string | number | undefined> = {}) => {

      try {
        setLoading(true)
        setError(null)

        const isDev = process.env.NODE_ENV !== "production"
        if (isDev) {
          console.log("Fetching claims from API...")
        }


        const { items: apiClaims, totalCount } = await apiService.getClaims(params)

        if (isDev) {
          console.log("API response:", apiClaims)
        }

        const frontendClaims = apiClaims.map((claim) => ({

          ...claim,
          id: claim.id,
          totalClaim: claim.totalClaim ?? 0,
          payout: claim.payout ?? 0,
          currency: claim.currency ?? "PLN",
          clientId: claim.clientId?.toString(),
          insuranceCompanyId: claim.insuranceCompanyId?.toString(),
          leasingCompanyId: claim.leasingCompanyId?.toString(),
          handlerId: claim.handlerId?.toString(),
        })) as Claim[]

        setClaims(frontendClaims)
        setTotalCount(totalCount)
        if (isDev) {
          console.log("Claims set in state:", frontendClaims)


        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred"

        setError(`Failed to fetch claims: ${message}`)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const getClaim = async (id: string): Promise<Claim | null> => {
    try {
      setError(null)
      const apiClaim = await apiService.getClaim(id)
      return transformApiClaimToFrontend(apiClaim)
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred"
      setError(`Failed to fetch claim ${id}: ${message}`)
      return null
    }
  }

  const initializeClaim = useCallback(async (): Promise<string | null> => {
    try {
      setError(null)
      const { id } = await apiService.initializeClaim()
      return id
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred"
      setError(`Failed to initialize claim: ${message}`)
      return null
    }
  }, [])

  const createClaim = async (claimData: Claim): Promise<Claim | null> => {
    try {
      setError(null)
      const payload = transformFrontendClaimToApiPayload(claimData)
      const newApiClaim = await apiService.createClaim(payload)
      const newClaim = transformApiClaimToFrontend(newApiClaim)
      setClaims((prev) => [newClaim, ...prev])
      setTotalCount((prev) => prev + 1)
      return newClaim
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred"
      setError(`Failed to create claim: ${message}`)
      return null
    }
  }

  const updateClaim = async (id: string, claimData: Partial<Claim>): Promise<Claim> => {
    try {
      setError(null)
      const payload = transformFrontendClaimToApiPayload(claimData)
      const updatedApiClaim = await apiService.updateClaim(id, payload)
      const existingClaim = claims.find((c) => c.id === id)

      const updatedClaim: Claim = updatedApiClaim
        ? transformApiClaimToFrontend(updatedApiClaim)
        : ({ ...(existingClaim || {}), ...claimData } as Claim)

      setClaims((prev) => prev.map((c) => (c.id === id ? updatedClaim : c)))
      return updatedClaim
    } catch (err: any) {
      let message = err instanceof Error ? err.message : "An unknown error occurred"
      const status = err?.status || err?.response?.status
      if (status === 409 || message.includes("409")) {
        message = "Another user has modified this claim. Please reload."
      }
      setError(`Failed to update claim ${id}: ${message}`)
      throw new Error(message)
    }
  }

  const deleteClaim = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      await apiService.deleteClaim(id)
      setClaims((prev) => prev.filter((c) => c.id !== id))
      setTotalCount((prev) => Math.max(0, prev - 1))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred"
      setError(`Failed to delete claim ${id}: ${message}`)
      return false
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    claims,
    loading,
    error,
    totalCount,
    fetchClaims,
    getClaim,
    initializeClaim,
    createClaim,
    updateClaim,
    deleteClaim,
    clearError,
  }
}
