"use client"

import DamageDataSection from "./damage-data-section"
import { TransportDamageSection } from "./transport-damage-section"
import SubcontractorSection from "./subcontractor-section"
import type { Dispatch, SetStateAction } from "react"
import type {
  Claim,
  UploadedFile,
  RequiredDocument,
  ParticipantInfo,
  DriverInfo,
} from "@/types"

interface RiskType {
  value: string
  label: string
}

interface ClaimStatus {
  id: string
  name: string
  description: string
}

interface TransportClaimFormProps {
  claimFormData: Partial<Claim>
  handleFormChange: (field: keyof Claim, value: any) => void
  handleParticipantChange: (
    party: "injuredParty" | "perpetrator",
    field: keyof Omit<ParticipantInfo, "drivers">,
    value: any,
  ) => void
  handleDriverChange: (
    party: "injuredParty" | "perpetrator",
    driverIndex: number,
    field: keyof DriverInfo,
    value: any,
  ) => void
  handleAddDriver: (party: "injuredParty" | "perpetrator") => void
  handleRemoveDriver: (party: "injuredParty" | "perpetrator", driverIndex: number) => void
  uploadedFiles: UploadedFile[]
  setUploadedFiles: Dispatch<SetStateAction<UploadedFile[]>>
  requiredDocuments: RequiredDocument[]
  setRequiredDocuments: Dispatch<SetStateAction<RequiredDocument[]>>
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
  handleParticipantChange,
  handleDriverChange,
  handleAddDriver,
  handleRemoveDriver,
  uploadedFiles,
  setUploadedFiles,
  requiredDocuments,
  setRequiredDocuments,
  claimObjectType,
  setClaimObjectType,
  riskTypes,
  loadingRiskTypes,
  claimStatuses,
  loadingStatuses,
}: TransportClaimFormProps) {
  return (
    <div className="space-y-4">
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

