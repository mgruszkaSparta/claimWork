"use client"


import type React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import type { Claim, TransportDamage } from "@/types"

interface TransportDamageSectionProps {
  claimFormData: Claim
  handleFormChange: (field: keyof Claim, value: any) => void
  disabled?: boolean
}

export function TransportDamageSection({
  claimFormData,
  handleFormChange,
  disabled = false,
}: TransportDamageSectionProps) {
  const transportDamage: TransportDamage =
    claimFormData.transportDamage || {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Szkoda w transporcie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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

