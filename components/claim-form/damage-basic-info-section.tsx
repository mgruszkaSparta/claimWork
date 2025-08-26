"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DependentSelect } from "@/components/ui/dependent-select"
import { API_BASE_URL } from "@/lib/api"
import type { Claim } from "@/types"

interface DamageBasicInfoSectionProps {
  claimFormData: Partial<Claim>
  handleFormChange: (field: any, value: any) => void
  claimObjectType: string
  setClaimObjectType: (value: string) => void
  riskTypes: { value: string; label: string }[]
  loadingRiskTypes: boolean
}

export function DamageBasicInfoSection({
  claimFormData,
  handleFormChange,
  claimObjectType,
  setClaimObjectType,
  riskTypes,
  loadingRiskTypes,
}: DamageBasicInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="claimObjectType" className="text-sm font-medium text-gray-700">
          Typ szkody
        </Label>
        <Select
          value={claimObjectType}
          onValueChange={(value) => {
            setClaimObjectType(value)
            handleFormChange("riskType", "")
            handleFormChange("damageType", "")
          }}
          disabled
        >
          <SelectTrigger className="mt-0.5">
            <SelectValue placeholder="Wybierz typ szkody..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Szkoda komunikacyjna</SelectItem>
            <SelectItem value="2">Szkoda mienia</SelectItem>
            <SelectItem value="3">Szkoda transportowa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="riskType" className="text-sm font-medium text-gray-700">
          Ryzyko szkody
        </Label>
        <Select
          value={claimFormData.riskType || ""}
          onValueChange={(value) => {
            handleFormChange("riskType", value)
            handleFormChange("damageType", "")
          }}
          disabled={loadingRiskTypes}
        >
          <SelectTrigger className="mt-0.5">
            <SelectValue placeholder={loadingRiskTypes ? "Ładowanie..." : "Wybierz ryzyko szkody..."} />
          </SelectTrigger>
          <SelectContent>
            {riskTypes.map((riskType) => (
              <SelectItem key={riskType.value} value={riskType.value}>
                {riskType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="damageType" className="text-sm font-medium text-gray-700">
          Rodzaj szkody
        </Label>
        <DependentSelect
          value={claimFormData.damageType || ""}
          onValueChange={(value) => handleFormChange("damageType", value)}
          placeholder="Wybierz rodzaj szkody..."
          apiUrl={`${API_BASE_URL}/damage-types`}
          riskTypeId={claimFormData.riskType ? Number(claimFormData.riskType) : undefined}
          disabled={!claimFormData.riskType}
        />
      </div>
    </div>
  )
}

