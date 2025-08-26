"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FormHeader } from "@/components/ui/form-header"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText } from "lucide-react"

interface PropertyParticipantsSectionProps {
  claimFormData: Record<string, any>
  handleFormChange: (field: string, value: any) => void
  showVehicleFields?: boolean
}

const countries = [
  { id: "PL", displayName: "Polska" },
  { id: "DE", displayName: "Niemcy" },
  { id: "FR", displayName: "Francja" },
  { id: "GB", displayName: "Wielka Brytania" },
  { id: "IT", displayName: "Włochy" },
  { id: "ES", displayName: "Hiszpania" },
  { id: "CZ", displayName: "Czechy" },
  { id: "SK", displayName: "Słowacja" },
  { id: "UA", displayName: "Ukraina" },
  { id: "LT", displayName: "Litwa" },
]

export function PropertyParticipantsSection({
  claimFormData,
  handleFormChange,
  showVehicleFields = false,
}: PropertyParticipantsSectionProps) {
  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <FormHeader icon={FileText} title="Poszkodowany / Sprawca" />
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="injuredData">Dane poszkodowanego</Label>
          <Textarea
            id="injuredData"
            value={claimFormData.injuredData || ""}
            onChange={(e) => handleFormChange("injuredData", e.target.value)}
            placeholder="Wprowadź dane poszkodowanego"
          />
        </div>
        {showVehicleFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="victimRegistrationNumber">Nr rejestracyjny</Label>
              <Input
                id="victimRegistrationNumber"
                value={claimFormData.victimRegistrationNumber || ""}
                onChange={(e) =>
                  handleFormChange("victimRegistrationNumber", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="victimVehicleBrand">Marka</Label>
              <Input
                id="victimVehicleBrand"
                value={claimFormData.victimVehicleBrand || ""}
                onChange={(e) =>
                  handleFormChange("victimVehicleBrand", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="victimVehicleModel">Model</Label>
              <Input
                id="victimVehicleModel"
                value={claimFormData.victimVehicleModel || ""}
                onChange={(e) =>
                  handleFormChange("victimVehicleModel", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="victimVehicleCountry">Kraj rejestracji</Label>
              <Select
                value={claimFormData.victimVehicleCountry || "PL"}
                onValueChange={(value) =>
                  handleFormChange("victimVehicleCountry", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kraj" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="perpetratorData">Dane sprawcy</Label>
          <Textarea
            id="perpetratorData"
            value={claimFormData.perpetratorData || ""}
            onChange={(e) => handleFormChange("perpetratorData", e.target.value)}
            placeholder="Wprowadź dane sprawcy"
          />
        </div>
        {showVehicleFields && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="perpetratorRegistrationNumber">Nr rejestracyjny</Label>
              <Input
                id="perpetratorRegistrationNumber"
                value={claimFormData.perpetratorRegistrationNumber || ""}
                onChange={(e) =>
                  handleFormChange(
                    "perpetratorRegistrationNumber",
                    e.target.value,
                  )
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="perpetratorVehicleBrand">Marka</Label>
              <Input
                id="perpetratorVehicleBrand"
                value={claimFormData.perpetratorVehicleBrand || ""}
                onChange={(e) =>
                  handleFormChange("perpetratorVehicleBrand", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="perpetratorVehicleModel">Model</Label>
              <Input
                id="perpetratorVehicleModel"
                value={claimFormData.perpetratorVehicleModel || ""}
                onChange={(e) =>
                  handleFormChange("perpetratorVehicleModel", e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="perpetratorVehicleCountry">Kraj rejestracji</Label>
              <Select
                value={claimFormData.perpetratorVehicleCountry || "PL"}
                onValueChange={(value) =>
                  handleFormChange("perpetratorVehicleCountry", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kraj" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PropertyParticipantsSection

