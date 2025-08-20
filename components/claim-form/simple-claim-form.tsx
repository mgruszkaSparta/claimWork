"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { FormHeader } from "@/components/ui/form-header"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { DriverForm } from "./driver-form"
import type { DriverInfo } from "@/types"

export function SimpleClaimForm() {
  const { user } = useAuth()
  const isReadOnly = user?.roles?.includes("user")
  const [description, setDescription] = useState("")
  const [driver, setDriver] = useState<DriverInfo & Record<string, any>>({
    id: Date.now().toString(),
    name: "",
    licenseNumber: "",
    role: "driver",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "PL",
    personalId: "",
    identityNumber: "",
    owner: "",
    coOwner: "",
    citizenship: "PL",
    street: "",
    houseNumber: "",
    flatNumber: "",
    emailConsent: false,
    additionalInfo: "",
  })

  const handleDriverChange = (field: keyof DriverInfo | string, value: any) => {
    setDriver((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ description, driver })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset disabled={isReadOnly} className="space-y-6">
        <Card className="border border-gray-200 bg-white shadow-sm">
          <FormHeader icon={FileText} title="Dane szkody" />
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Opis szkody</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Krótki opis szkody"
              />
            </div>
          </CardContent>
        </Card>

        <DriverForm
          driverData={driver}
          onDriverChange={handleDriverChange}
          onRemove={() => {}}
          isRemovable={false}
        />

        {!isReadOnly && (
          <Button type="submit" className="bg-blue-600 text-white">
            Zapisz
          </Button>
        )}
      </fieldset>
      {isReadOnly && (
        <p className="text-sm text-gray-500">
          Brak uprawnień do dodawania lub edycji
        </p>
      )}
    </form>
  )
}

export default SimpleClaimForm

