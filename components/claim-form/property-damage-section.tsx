"use client"




import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface PropertyDamageSectionProps {
  claimFormData: Record<string, any>
  handleFormChange: (field: string, value: any) => void
}

export function PropertyDamageSection({ claimFormData, handleFormChange }: PropertyDamageSectionProps) {
  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-lg font-semibold text-gray-700">
          Szkoda w mieniu
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="propertyDamageSubject">Przedmiot szkody</Label>
          <Textarea
            id="propertyDamageSubject"
            value={claimFormData.propertyDamageSubject || ""}
            onChange={(e) => handleFormChange("propertyDamageSubject", e.target.value)}
            placeholder="Opis przedmiotu szkody"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="damageListing">Wykaz uszkodzeń / strat</Label>
          <Textarea
            id="damageListing"
            value={claimFormData.damageListing || ""}
            onChange={(e) => handleFormChange("damageListing", e.target.value)}
            placeholder="Opis uszkodzeń lub strat"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="injuredData">Dane poszkodowanego</Label>
          <Textarea
            id="injuredData"
            value={claimFormData.injuredData || ""}
            onChange={(e) => handleFormChange("injuredData", e.target.value)}
            placeholder="Wprowadź dane poszkodowanego"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="policyNumber">Nr polisy</Label>
            <Input
              id="policyNumber"
              value={claimFormData.policyNumber || ""}
              onChange={(e) => handleFormChange("policyNumber", e.target.value)}
              placeholder="Wprowadź numer polisy"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insurer">Ubezpieczyciel</Label>
            <Input
              id="insurer"
              value={claimFormData.insurer || ""}
              onChange={(e) => handleFormChange("insurer", e.target.value)}
              placeholder="Wprowadź nazwę ubezpieczyciela"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="inspectionContact">Dane i kontakt do oględzin</Label>
          <Textarea
            id="inspectionContact"
            value={claimFormData.inspectionContact || ""}
            onChange={(e) => handleFormChange("inspectionContact", e.target.value)}
            placeholder="Osoba kontaktowa i informacje do oględzin"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default PropertyDamageSection

