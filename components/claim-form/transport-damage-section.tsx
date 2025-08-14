"use client"


import type React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"
import type { Claim, TransportDamage } from "@/types"




interface SubcontractorInfo {
  subcontractorName: string
  subcontractorPolicyNumber: string
  subcontractorInsurer: string
  complaintToSubcontractor: boolean
  complaintToSubcontractorDate: string
  claimFromSubcontractorPolicy: boolean
  claimFromSubcontractorPolicyDate: string
  complaintResponse: boolean
  complaintResponseDate: string
}

interface TransportDamage {
  cargoDescription: string
  losses: string[]
  carrier: string
  policyNumber: string
  inspectionContactName: string
  inspectionContactPhone: string
  inspectionContactEmail: string
  subcontractor: SubcontractorInfo
}

export interface TransportDamageSectionProps {
  value: TransportDamage
  onChange: (value: TransportDamage) => void

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

  const handleSubcontractorChange = (
    field: keyof SubcontractorInfo,
    fieldValue: any,
  ) => {
    handleFieldChange("subcontractor", {
      ...value.subcontractor,
      [field]: fieldValue,
    })
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

        <div className="space-y-4">
          <Label>Podwykonawca</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Nazwa podwykonawcy"
              value={value.subcontractor.subcontractorName}
              onChange={(e) =>
                handleSubcontractorChange("subcontractorName", e.target.value)
              }
              disabled={disabled}
            />
            <Input
              placeholder="Numer polisy"
              value={value.subcontractor.subcontractorPolicyNumber}
              onChange={(e) =>
                handleSubcontractorChange(
                  "subcontractorPolicyNumber",
                  e.target.value,
                )
              }
              disabled={disabled}
            />
            <Input
              placeholder="Ubezpieczyciel"
              value={value.subcontractor.subcontractorInsurer}
              onChange={(e) =>
                handleSubcontractorChange(
                  "subcontractorInsurer",
                  e.target.value,
                )
              }
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="complaintToSubcontractor"
                checked={value.subcontractor.complaintToSubcontractor}
                onCheckedChange={(checked) =>
                  handleSubcontractorChange(
                    "complaintToSubcontractor",
                    checked === true,
                  )
                }
                disabled={disabled}
              />
              <Label htmlFor="complaintToSubcontractor">
                Reklamacja do podwykonawcy
              </Label>
            </div>
            <Input
              type="date"
              value={value.subcontractor.complaintToSubcontractorDate}
              onChange={(e) =>
                handleSubcontractorChange(
                  "complaintToSubcontractorDate",
                  e.target.value,
                )
              }
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="claimFromSubcontractorPolicy"
                checked={value.subcontractor.claimFromSubcontractorPolicy}
                onCheckedChange={(checked) =>
                  handleSubcontractorChange(
                    "claimFromSubcontractorPolicy",
                    checked === true,
                  )
                }
                disabled={disabled}
              />
              <Label htmlFor="claimFromSubcontractorPolicy">
                Roszczenie z polisy podwykonawcy
              </Label>
            </div>
            <Input
              type="date"
              value={value.subcontractor.claimFromSubcontractorPolicyDate}
              onChange={(e) =>
                handleSubcontractorChange(
                  "claimFromSubcontractorPolicyDate",
                  e.target.value,
                )
              }
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="complaintResponse"
                checked={value.subcontractor.complaintResponse}
                onCheckedChange={(checked) =>
                  handleSubcontractorChange(
                    "complaintResponse",
                    checked === true,
                  )
                }
                disabled={disabled}
              />
              <Label htmlFor="complaintResponse">Odpowiedź na reklamację</Label>
            </div>
            <Input
              type="date"
              value={value.subcontractor.complaintResponseDate}
              onChange={(e) =>
                handleSubcontractorChange(
                  "complaintResponseDate",
                  e.target.value,
                )
              }
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

