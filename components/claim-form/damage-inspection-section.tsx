"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { Claim } from "@/types"

interface DamageInspectionSectionProps {
  claimFormData: Partial<Claim>
  handleFormChange: (field: any, value: any) => void
}

export function DamageInspectionSection({
  claimFormData,
  handleFormChange,
}: DamageInspectionSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="inspectionDate" className="text-sm font-medium text-gray-700">
            Data inspekcji
          </Label>
          <Input
            id="inspectionDate"
            type="date"
            value={(claimFormData as any).inspectionDate || ""}
            onChange={(e) => handleFormChange("inspectionDate", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="inspectionExpert" className="text-sm font-medium text-gray-700">
            Rzeczoznawca
          </Label>
          <Input
            id="inspectionExpert"
            value={(claimFormData as any).inspectionExpert || ""}
            onChange={(e) => handleFormChange("inspectionExpert", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="inspectionNotes" className="text-sm font-medium text-gray-700">
          Dodatkowe uwagi
        </Label>
        <Textarea
          id="inspectionNotes"
          value={(claimFormData as any).inspectionNotes || ""}
          onChange={(e) => handleFormChange("inspectionNotes", e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  )
}

