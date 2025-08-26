"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FormHeader } from "@/components/ui/form-header"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TRANSPORT_TYPES } from "@/lib/constants"
import { FileText, Plus, Trash2 } from "lucide-react"

interface TransportDamage {
  transportType: string
  transportTypeId: string
  cargoDescription: string
  losses: string[]
  carrier: string
  policyNumber: string
  inspectionContactName: string
  inspectionContactPhone: string
  inspectionContactEmail: string
}

export interface TransportDamageSectionProps {
  claimFormData: Record<string, any>
  handleFormChange: (field: string, value: any) => void
  disabled?: boolean
}

export function TransportDamageSection({
  claimFormData,
  handleFormChange,
  disabled = false,
}: TransportDamageSectionProps) {
  const transportDamage: TransportDamage =
    claimFormData.transportDamage || {
      transportType: "",
      transportTypeId: "",
      cargoDescription: "",
      losses: [""],
      carrier: "",
      policyNumber: "",
      inspectionContactName: "",
      inspectionContactPhone: "",
      inspectionContactEmail: "",
    }

  const handleFieldChange = (field: keyof TransportDamage, fieldValue: any) => {
    handleFormChange("transportDamage", {
      ...transportDamage,
      [field]: fieldValue,
    })
  }

  const handleLossChange = (index: number, newLoss: string) => {
    const updated = [...transportDamage.losses]
    updated[index] = newLoss
    handleFieldChange("losses", updated)
  }

  const addLoss = () => {
    handleFieldChange("losses", [...transportDamage.losses, ""])
  }

  const removeLoss = (index: number) => {
    const updated = transportDamage.losses.filter((_, i) => i !== index)
    handleFieldChange("losses", updated)
  }

  const handleTransportTypeChange = (value: string) => {
    const selected = TRANSPORT_TYPES.find((t) => t.value === value)
    handleFormChange("transportDamage", {
      ...transportDamage,
      transportTypeId: value,
      transportType: selected?.code || "",
    })
  }

  return (
    <Card>
      <FormHeader icon={FileText} title="Szkoda w transporcie" />
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="transportType">Rodzaj transportu</Label>
          <Select
            value={transportDamage.transportTypeId}
            onValueChange={handleTransportTypeChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz rodzaj transportu" />
            </SelectTrigger>
            <SelectContent>
              {TRANSPORT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cargoDescription">Opis ładunku / lista strat</Label>
          <Textarea
            id="cargoDescription"
            placeholder="Opisz ładunek lub ogólną listę strat"
            value={transportDamage.cargoDescription}
            onChange={(e) => handleFieldChange("cargoDescription", e.target.value)}
            disabled={disabled}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Lista strat</Label>
          {transportDamage.losses.map((loss, index) => (
            <div key={`loss-${index}`} className="flex items-center space-x-2">
              <Input
                placeholder={`Strata ${index + 1}`}
                value={loss}
                onChange={(e) => handleLossChange(index, e.target.value)}
                disabled={disabled}
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLoss(index)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
          {!disabled && (
            <Button type="button" variant="outline" size="sm" onClick={addLoss}>
              <Plus className="h-4 w-4 mr-2" /> Dodaj stratę
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="carrier">Przewoźnik / ubezpieczyciel</Label>
            <Input
              id="carrier"
              placeholder="Nazwa przewoźnika lub ubezpieczyciela"
              value={transportDamage.carrier}
              onChange={(e) => handleFieldChange("carrier", e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="policyNumber">Numer polisy</Label>
            <Input
              id="policyNumber"
              placeholder=""
              value={transportDamage.policyNumber}
              onChange={(e) => handleFieldChange("policyNumber", e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Dane kontaktowe do oględzin</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Imię i nazwisko"
              value={transportDamage.inspectionContactName}
              onChange={(e) => handleFieldChange("inspectionContactName", e.target.value)}
              disabled={disabled}
            />
            <Input
              placeholder="Telefon"
              value={transportDamage.inspectionContactPhone}
              onChange={(e) => handleFieldChange("inspectionContactPhone", e.target.value)}
              disabled={disabled}
            />
            <Input
              type="email"
              placeholder="E-mail"
              value={transportDamage.inspectionContactEmail}
              onChange={(e) => handleFieldChange("inspectionContactEmail", e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

      </CardContent>
    </Card>
  )
}

