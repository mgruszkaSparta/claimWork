"use client"

import DamageDataSection from "./damage-data-section"
import PropertyDamageSection from "./property-damage-section"
import PropertyParticipantsSection from "./property-participants-section"
import type { Claim } from "@/types"

interface RiskType {
  value: string
  label: string
}

interface ClaimStatus {
  id: number
  name: string
  description: string
}

interface PropertyClaimFormProps {
  claimFormData: Partial<Claim>
  handleFormChange: (field: keyof Claim, value: any) => void
  claimObjectType: string
  setClaimObjectType: (value: string) => void
  riskTypes: RiskType[]
  loadingRiskTypes: boolean
  claimStatuses: ClaimStatus[]
  loadingStatuses: boolean
}

export function PropertyClaimForm({
  claimFormData,
  handleFormChange,
  claimObjectType,
  setClaimObjectType,
  riskTypes,
  loadingRiskTypes,
  claimStatuses,
  loadingStatuses,
}: PropertyClaimFormProps) {
  return (
    <div className="space-y-6">
      <DamageDataSection
        claimFormData={claimFormData}
        handleFormChange={handleFormChange}
        claimObjectType={claimObjectType}
        setClaimObjectType={setClaimObjectType}
        riskTypes={riskTypes}
        loadingRiskTypes={loadingRiskTypes}
        claimStatuses={claimStatuses}
        loadingStatuses={loadingStatuses}
      />
      <PropertyDamageSection
        claimFormData={claimFormData}
        handleFormChange={handleFormChange}
      />
      <PropertyParticipantsSection
        claimFormData={claimFormData}
        handleFormChange={handleFormChange}
      />
    </div>
  )
}

export default PropertyClaimForm

