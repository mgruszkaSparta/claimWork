"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { DriverFormProps } from "../../claim-form/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X, User } from 'lucide-react'



export const DriverFormMobile = ({ driverData, onDriverChange, onRemove, isRemovable }: DriverFormProps) => {
  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-900">Uczestnik</span>
          </div>
          {isRemovable && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {/* Dane podstawowe */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Dane podstawowe</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`driver-firstName-${driverData.id}`} className="text-sm font-medium text-gray-700">
                  Imię
                </Label>
                <Input
                  id={`driver-firstName-${driverData.id}`}
                  value={driverData.firstName || ""}
                  onChange={(e) => onDriverChange("firstName", e.target.value)}
                  placeholder="Wprowadź imię"
                  className="mt-0.5"
                />
              </div>
              <div>
                <Label htmlFor={`driver-lastName-${driverData.id}`} className="text-sm font-medium text-gray-700">
                  Nazwisko
                </Label>
                <Input
                  id={`driver-lastName-${driverData.id}`}
                  value={driverData.lastName || ""}
                  onChange={(e) => onDriverChange("lastName", e.target.value)}
                  placeholder="Wprowadź nazwisko"
                  className="mt-0.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`driver-identityNumber-${driverData.id}`} className="text-sm font-medium text-gray-700">
                  Numer identyfikacyjny (PESEL/Paszport)
                </Label>
                <Input
                  id={`driver-identityNumber-${driverData.id}`}
                  value={driverData.identityNumber || ""}
                  onChange={(e) => onDriverChange("identityNumber", e.target.value)}
                  placeholder="PESEL lub numer paszportu"
                  className="mt-0.5"
                />
              </div>
              <div>
                <Label htmlFor={`driver-licenseNumber-${driverData.id}`} className="text-sm font-medium text-gray-700">
                  Numer prawa jazdy
                </Label>
                <Input
                  id={`driver-licenseNumber-${driverData.id}`}
                  value={driverData.licenseNumber || ""}
                  onChange={(e) => onDriverChange("licenseNumber", e.target.value)}
                  placeholder="Numer prawa jazdy"
                  className="mt-0.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`driver-role-${driverData.id}`} className="text-sm font-medium text-gray-700">
                  Rola
                </Label>
                <Select
                  value={driverData.role || "driver"}
                  onValueChange={(value) => onDriverChange("role", value)}
                >
                  <SelectTrigger className="mt-0.5">
                    <SelectValue placeholder="Wybierz rolę" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Kierowca</SelectItem>
                    <SelectItem value="owner">Właściciel</SelectItem>
                    <SelectItem value="co-owner">Współwłaściciel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`driver-owner-${driverData.id}`} className="text-sm font-medium text-gray-700">
                  Właściciel
                </Label>
                <Input
                  id={`driver-owner-${driverData.id}`}
                  value={driverData.owner || ""}
                  onChange={(e) => onDriverChange("owner", e.target.value)}
                  placeholder="Imię i nazwisko właściciela"
                  className="mt-0.5"
                />
              </div>
              <div>
                <Label htmlFor={`driver-coOwner-${driverData.id}`} className="text-sm font-medium text-gray-700">
                  Współwłaściciel
                </Label>
                <Input
                  id={`driver-coOwner-${driverData.id}`}
                  value={driverData.coOwner || ""}
                  onChange={(e) => onDriverChange("coOwner", e.target.value)}
                  placeholder="Imię i nazwisko współwłaściciela"
                  className="mt-0.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`driver-citizenship-${driverData.id}`} className="text-sm font-medium text-gray-700">
                Obywatelstwo
              </Label>
              <Select
                value={driverData.citizenship || "PL"}
                onValueChange={(value) => onDriverChange("citizenship", value)}
              >
                <SelectTrigger className="mt-0.5">
                  <SelectValue placeholder="Wybierz obywatelstwo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PL">Polska</SelectItem>
                  <SelectItem value="DE">Niemcy</SelectItem>
                  <SelectItem value="FR">Francja</SelectItem>
                  <SelectItem value="GB">Wielka Brytania</SelectItem>
                  <SelectItem value="US">Stany Zjednoczone</SelectItem>
                  <SelectItem value="OTHER">Inne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Adres */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Adres</h4>
                        
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`driver-address-${driverData.id}`} className="text-sm font-medium text-gray-700">
                  Adres
                </Label>
                <Input
                  id={`driver-address-${driverData.id}`}
                  value={driverData.address || ""}
                  onChange={(e) => onDriverChange("address", e.target.value)}
                  placeholder="Ulica i numer"
                  className="mt-0.5"
                />
              </div>
              <div>
                <Label htmlFor={`driver-city-${driverData.id}`} className="text-sm font-medium text-gray-700">
                  Miejscowość
                </Label>
                <Input
                  id={`driver-city-${driverData.id}`}
                  value={driverData.city || ""}
                  onChange={(e) => onDriverChange("city", e.target.value)}
                  placeholder="Nazwa miasta"
                  className="mt-0.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`driver-postalCode-${driverData.id}`} className="text-sm font-medium text-gray-700">
                Kod pocztowy
              </Label>
              <Input
                id={`driver-postalCode-${driverData.id}`}
                value={driverData.postalCode || ""}
                onChange={(e) => onDriverChange("postalCode", e.target.value)}
                placeholder="00-000"
                className="mt-0.5"
              />
            </div>

            <div>
              <Label htmlFor={`driver-street-${driverData.id}`} className="text-sm font-medium text-gray-700">
                Ulica
              </Label>
              <Input
                id={`driver-street-${driverData.id}`}
                value={driverData.street || ""}
                onChange={(e) => onDriverChange("street", e.target.value)}
                placeholder="Nazwa ulicy"
                className="mt-0.5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`driver-houseNumber-${driverData.id}`} className="text-sm font-medium text-gray-700">
                  Numer domu
                </Label>
                <Input
                  id={`driver-houseNumber-${driverData.id}`}
                  value={driverData.houseNumber || ""}
                  onChange={(e) => onDriverChange("houseNumber", e.target.value)}
                  placeholder="Nr domu"
                  className="mt-0.5"
                />
              </div>
              <div>
                <Label htmlFor={`driver-flatNumber-${driverData.id}`} className="text-sm font-medium text-gray-700">
                  Numer mieszkania
                </Label>
                <Input
                  id={`driver-flatNumber-${driverData.id}`}
                  value={driverData.flatNumber || ""}
                  onChange={(e) => onDriverChange("flatNumber", e.target.value)}
                  placeholder="Nr mieszkania"
                  className="mt-0.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`driver-country-${driverData.id}`} className="text-sm font-medium text-gray-700">
                Kraj
              </Label>
              <Select
                value={driverData.country || "PL"}
                onValueChange={(value) => onDriverChange("country", value)}
              >
                <SelectTrigger className="mt-0.5">
                  <SelectValue placeholder="Wybierz kraj" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PL">Polska</SelectItem>
                  <SelectItem value="DE">Niemcy</SelectItem>
                  <SelectItem value="FR">Francja</SelectItem>
                  <SelectItem value="GB">Wielka Brytania</SelectItem>
                  <SelectItem value="US">Stany Zjednoczone</SelectItem>
                  <SelectItem value="OTHER">Inne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dane kontaktowe */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Dane kontaktowe</h4>
                        
            <div>
              <Label htmlFor={`driver-phone-${driverData.id}`} className="text-sm font-medium text-gray-700">
                Numer telefonu
              </Label>
              <Input
                id={`driver-phone-${driverData.id}`}
                value={driverData.phone || ""}
                onChange={(e) => onDriverChange("phone", e.target.value)}
                placeholder="+48 123 456 789"
                className="mt-0.5"
                type="tel"
              />
            </div>

            <div>
              <Label htmlFor={`driver-email-${driverData.id}`} className="text-sm font-medium text-gray-700">
                Adres e-mail
              </Label>
              <Input
                id={`driver-email-${driverData.id}`}
                type="email"
                value={driverData.email || ""}
                onChange={(e) => onDriverChange("email", e.target.value)}
                placeholder="email@example.com"
                className="mt-0.5"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`driver-emailConsent-${driverData.id}`}
                checked={driverData.emailConsent || false}
                onCheckedChange={(checked) => onDriverChange("emailConsent", checked)}
              />
              <Label 
                htmlFor={`driver-emailConsent-${driverData.id}`}
                className="text-sm text-gray-700 cursor-pointer"
              >
                Zgoda na otrzymywanie korespondencji wyłącznie drogą elektroniczną
              </Label>
            </div>
          </div>

          {/* Dodatkowe informacje */}
          <div className="space-y-4">
            <div>
              <Label htmlFor={`driver-additionalInfo-${driverData.id}`} className="text-sm font-medium text-gray-700">
                Dodatkowe informacje
              </Label>
              <Textarea
                id={`driver-additionalInfo-${driverData.id}`}
                value={driverData.additionalInfo || ""}
                onChange={(e) => onDriverChange("additionalInfo", e.target.value)}
                placeholder="Dodatkowe informacje o uczestniku..."
                className="mt-0.5"
                rows={4}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DriverFormMobile
