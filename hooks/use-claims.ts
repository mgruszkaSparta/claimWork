"use client"

import { useState, useCallback } from "react"
import { apiService, type EventUpsertDto, type EventDto, type ParticipantUpsertDto, type EventListItemDto } from "@/lib/api"
import type { Claim, ParticipantInfo, DriverInfo } from "@/types"

const transformApiClaimToFrontend = (apiClaim: EventDto): Claim => {
  const injuredParty = apiClaim.participants?.find((p: any) => p.role === "Poszkodowany")
  const perpetrator = apiClaim.participants?.find((p: any) => p.role === "Sprawca")

  return {
    ...apiClaim,
    id: apiClaim.id?.toString(),
    totalClaim: apiClaim.totalClaim ?? 0,
    payout: apiClaim.payout ?? 0,
    currency: apiClaim.currency ?? "PLN",
    servicesCalled: apiClaim.servicesCalled?.split(",").filter(Boolean) || [],
    damages: apiClaim.damages || [],
    decisions: apiClaim.decisions || [],
    appeals: apiClaim.appeals || [],
    clientClaims: apiClaim.clientClaims || [],
    recourses: apiClaim.recourses || [],
    settlements: apiClaim.settlements || [],
    injuredParty: injuredParty
      ? {
          ...injuredParty,
          drivers: injuredParty.drivers || [],
        }
      : undefined,
    perpetrator: perpetrator
      ? {
          ...perpetrator,
          drivers: perpetrator.drivers || [],
        }
      : undefined,
  }
}

const transformFrontendClaimToApiPayload = (claimData: Partial<Claim>): EventUpsertDto => {
  const {
    id,
    decisions,
    appeals,
    clientClaims,
    recourses,
    settlements,
    damages,
    injuredParty,
    perpetrator,
    servicesCalled,
    ...rest
  } = claimData

  const participants: ParticipantUpsertDto[] = []

  const mapParticipant = (p: ParticipantInfo, role: string): ParticipantUpsertDto => ({
    id: p.id ? parseInt(p.id) : undefined,
    role: role,
    name: p.name,
    phone: p.phone,
    email: p.email,
    address: p.address,
    city: p.city,
    postalCode: p.postalCode,
    country: p.country,
    insuranceCompany: p.insuranceCompany,
    policyNumber: p.policyNumber,
    vehicleRegistration: p.vehicleRegistration,
    vehicleVin: p.vehicleVin,
    vehicleType: p.vehicleType,
    vehicleBrand: p.vehicleBrand,
    vehicleModel: p.vehicleModel,
    inspectionContactName: p.inspectionContactName,
    inspectionContactPhone: p.inspectionContactPhone,
    inspectionContactEmail: p.inspectionContactEmail,
    drivers: p.drivers?.map((d: DriverInfo) => ({
      id: d.id ? parseInt(d.id) : undefined,
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
    ...rest,
    damageDate: rest.damageDate ? new Date(rest.damageDate).toISOString() : undefined,
    reportDate: rest.reportDate ? new Date(rest.reportDate).toISOString() : undefined,
    reportDateToInsurer: rest.reportDateToInsurer ? new Date(rest.reportDateToInsurer).toISOString() : undefined,
    eventTime: rest.eventTime,
    servicesCalled: servicesCalled?.join(","),
    participants: participants,
  }
}

export function useClaims() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching claims from API...")
      const apiClaims: EventListItemDto[] = await apiService.getClaims()
      console.log("API response:", apiClaims)

      const frontendClaims = apiClaims.map((claim) => ({
        ...claim,
        id: claim.id.toString(),
        totalClaim: claim.totalClaim ?? 0,
        payout: claim.payout ?? 0,
        currency: claim.currency ?? "PLN",
      })) as Claim[]

      setClaims(frontendClaims)
      console.log("Claims set in state:", frontendClaims)
    } catch (err) {
      console.error("Error fetching claims:", err)
      const message = err instanceof Error ? err.message : "An unknown error occurred"
      setError(`Failed to fetch claims: ${message}`)
      setClaims([])
    } finally {
      setLoading(false)
    }
  }, [])

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

  const createClaim = async (claimData: Claim): Promise<Claim | null> => {
    try {
      setError(null)
      const payload = transformFrontendClaimToApiPayload(claimData)
      const newApiClaim = await apiService.createClaim(payload)
      const newClaim = transformApiClaimToFrontend(newApiClaim)
      setClaims((prev) => [newClaim, ...prev])
      return newClaim
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred"
      setError(`Failed to create claim: ${message}`)
      return null
    }
  }

  const updateClaim = async (id: string, claimData: Partial<Claim>): Promise<Claim | null> => {
    try {
      setError(null)
      const payload = transformFrontendClaimToApiPayload(claimData)
      const updatedApiClaim = await apiService.updateClaim(id, payload)
      const updatedClaim = transformApiClaimToFrontend(updatedApiClaim)
      setClaims((prev) => prev.map((c) => (c.id === id ? updatedClaim : c)))
      return updatedClaim
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred"
      setError(`Failed to update claim ${id}: ${message}`)
      return null
    }
  }

  const deleteClaim = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      await apiService.deleteClaim(id)
      setClaims((prev) => prev.filter((c) => c.id !== id))
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
    fetchClaims,
    getClaim,
    createClaim,
    updateClaim,
    deleteClaim,
    clearError,
  }
}
