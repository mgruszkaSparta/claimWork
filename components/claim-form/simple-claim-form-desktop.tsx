"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { FormHeader } from "@/components/ui/form-header"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { DriverFormDesktop } from "./driver-form-desktop"
import type { DriverInfo } from "@/types"

export function SimpleClaimFormDesktop() {
  const { user } = useAuth()
  const isReadOnly = user?.roles?.includes("user")
  const [damageNumber, setDamageNumber] = useState("")
  const [damageDate, setDamageDate] = useState("")
  const [damageTime, setDamageTime] = useState("")
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
    console.log({ damageNumber, damageDate, damageTime, description, driver })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset disabled={isReadOnly} className="space-y-6">
        <Card className="border border-gray-200 bg-white shadow-sm">
          <FormHeader icon={FileText} title="Dane szkody" />
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="damageNumber">Nr szkody</Label>
              <Input
                id="damageNumber"
                value={damageNumber}
                onChange={(e) => setDamageNumber(e.target.value)}
                placeholder="Wprowadź numer szkody"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="damageDate">Data szkody</Label>
                <Input
                  id="damageDate"
                  type="date"
                  value={damageDate}
                  onChange={(e) => setDamageDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="damageTime">Godzina szkody</Label>
                <Input
                  id="damageTime"
                  type="time"
                  value={damageTime}
                  onChange={(e) => setDamageTime(e.target.value)}
                />
              </div>
            </div>
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

        <DriverFormDesktop
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

export default SimpleClaimFormDesktop

