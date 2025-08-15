"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface PropertyDamageSectionProps {
  claimFormData: Record<string, any>
  handleFormChange: (field: string, value: any) => void
}

export function PropertyDamageSection({ claimFormData, handleFormChange }: PropertyDamageSectionProps) {
  const handleServiceChange = (service: string, checked: boolean) => {
    const currentServices = claimFormData.servicesCalled || []
    const newServices = checked
      ? [...currentServices, service]
      : currentServices.filter((s: string) => s !== service)
    handleFormChange("servicesCalled", newServices)
  }

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

        <div className="space-y-2">
          <Label>Wezwane służby</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['policja', 'pogotowie', 'straz', 'holownik'].map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={service}
                  checked={claimFormData.servicesCalled?.includes(service) || false}
                  onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                />
                <Label htmlFor={service} className="capitalize">
                  {service === 'straz' ? 'Straż pożarna' : service}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {claimFormData.servicesCalled?.includes("policja") && (
          <div className="space-y-2">
            <Label htmlFor="policeDescription">Policja - opis</Label>
            <Input
              id="policeDescription"
              value={claimFormData.policeDescription || ""}
              onChange={(e) => handleFormChange("policeDescription", e.target.value)}
              placeholder="Wprowadź opis interwencji policji"
            />
            <Label htmlFor="policeUnitDetails">Policja - dane jednostki</Label>
            <Input
              id="policeUnitDetails"
              value={claimFormData.policeUnitDetails || ""}
              onChange={(e) => handleFormChange("policeUnitDetails", e.target.value)}
              placeholder="Wprowadź dane jednostki policji"
            />
          </div>
        )}

        {claimFormData.servicesCalled?.includes("pogotowie") && (
          <div className="space-y-2">
            <Label htmlFor="ambulanceDescription">Pogotowie - opis</Label>
            <Input
              id="ambulanceDescription"
              value={claimFormData.ambulanceDescription || ""}
              onChange={(e) => handleFormChange("ambulanceDescription", e.target.value)}
              placeholder="Wprowadź opis interwencji pogotowia"
            />
          </div>
        )}

        {claimFormData.servicesCalled?.includes("straz") && (
          <div className="space-y-2">
            <Label htmlFor="fireDescription">Straż pożarna - opis</Label>
            <Input
              id="fireDescription"
              value={claimFormData.fireDescription || ""}
              onChange={(e) => handleFormChange("fireDescription", e.target.value)}
              placeholder="Wprowadź opis interwencji straży pożarnej"
            />
          </div>
        )}

        {claimFormData.servicesCalled?.includes("holownik") && (
          <div className="space-y-2">
            <Label htmlFor="towDescription">Holownik - opis</Label>
            <Input
              id="towDescription"
              value={claimFormData.towDescription || ""}
              onChange={(e) => handleFormChange("towDescription", e.target.value)}
              placeholder="Wprowadź opis usługi holowania"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PropertyDamageSection

