"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import VehicleTypeDropdown from "@/components/vehicle-type-dropdown"
import type { VehicleTypeSelectionEvent } from "@/types/vehicle-type"
import type { Claim } from "@/types"

interface DamageVehicleDetailsSectionProps {
  claimFormData: Partial<Claim>
  handleFormChange: (field: any, value: any) => void
}

export function DamageVehicleDetailsSection({
  claimFormData,
  handleFormChange,
}: DamageVehicleDetailsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="vehicleNumber" className="text-sm font-medium text-gray-700">
          Numer floty
        </Label>
        <Input
          id="vehicleNumber"
          value={claimFormData.vehicleNumber || ""}
          onChange={(e) => handleFormChange("vehicleNumber", e.target.value)}
          className="mt-0.5"
        />
      </div>
      <div>
        <Label htmlFor="vehicleRegistration" className="text-sm font-medium text-gray-700">
          Numer rejestracyjny
        </Label>
        <Input
          id="vehicleRegistration"
          value={(claimFormData as any).vehicleRegistration || ""}
          onChange={(e) => handleFormChange("vehicleRegistration", e.target.value)}
          className="mt-0.5"
        />
      </div>
      <div>
        <Label htmlFor="vehicleVin" className="text-sm font-medium text-gray-700">
          VIN
        </Label>
        <Input
          id="vehicleVin"
          value={(claimFormData as any).vehicleVin || ""}
          onChange={(e) => handleFormChange("vehicleVin", e.target.value)}
          className="mt-0.5"
        />
      </div>
      <div>
        <Label htmlFor="brand" className="text-sm font-medium text-gray-700">
          Marka
        </Label>
        <Input
          id="brand"
          value={claimFormData.brand || ""}
          onChange={(e) => handleFormChange("brand", e.target.value)}
          className="mt-0.5"
        />
      </div>
      <div>
        <Label htmlFor="vehicleType" className="text-sm font-medium text-gray-700">
          Rodzaj pojazdu
        </Label>
        <VehicleTypeDropdown
          selectedVehicleTypeId={claimFormData.vehicleTypeId}
          selectedVehicleTypeName={claimFormData.vehicleType}
          onVehicleTypeSelected={(event: VehicleTypeSelectionEvent) => {
            handleFormChange("vehicleType", event.vehicleTypeName)
            handleFormChange("vehicleTypeId", event.vehicleTypeId)
            handleFormChange("vehicleTypeCode", event.vehicleTypeCode)
          }}
          className="mt-0.5"
        />
      </div>
      <div>
        <Label htmlFor="vehicleModel" className="text-sm font-medium text-gray-700">
          Model
        </Label>
        <Input
          id="vehicleModel"
          value={(claimFormData as any).vehicleModel || ""}
          onChange={(e) => handleFormChange("vehicleModel", e.target.value)}
          className="mt-0.5"
        />
      </div>
    </div>
  )
}

