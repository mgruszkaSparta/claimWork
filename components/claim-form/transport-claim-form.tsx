"use client"

import DamageDataSection from "./damage-data-section"
import { TransportDamageSection } from "./transport-damage-section"
import SubcontractorSection from "./subcontractor-section"
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

interface TransportClaimFormProps {
  claimFormData: Partial<Claim>
  handleFormChange: (field: keyof Claim, value: any) => void
  claimObjectType: string
  setClaimObjectType: (value: string) => void
  riskTypes: RiskType[]
  loadingRiskTypes: boolean
  claimStatuses: ClaimStatus[]
  loadingStatuses: boolean
}

export function TransportClaimForm({
  claimFormData,
  handleFormChange,
  claimObjectType,
  setClaimObjectType,
  riskTypes,
  loadingRiskTypes,
  claimStatuses,
  loadingStatuses,
}: TransportClaimFormProps) {
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
      <TransportDamageSection
        claimFormData={claimFormData}
        handleFormChange={handleFormChange}
      />
      <SubcontractorSection
        claimFormData={claimFormData}
        handleFormChange={handleFormChange}
      />
    </div>
  )
}

export default TransportClaimForm

