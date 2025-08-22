'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Car, FileText, Info, User, Plus } from 'lucide-react'
import InsuranceDropdown from '@/components/insurance-dropdown'
import { InsuranceCompaniesService } from '@/lib/insurance-companies'
import type { ParticipantInfo, DriverInfo } from '@/types'

interface DateInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, disabled, placeholder }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#1a3a6c]">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
      <input
        type="date"
        className="w-full border border-[#d1d9e6] rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3a6c] focus:border-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  )
}

interface ParticipantFormProps {
  participantData: ParticipantInfo
  onParticipantChange: (field: keyof Omit<ParticipantInfo, "drivers">, value: any) => void
  onDriverChange: (driverIndex: number, field: keyof DriverInfo, value: any) => void
  onAddDriver: () => void
  onRemoveDriver: (driverIndex: number) => void
  isVictim?: boolean
  disabled?: boolean
}

const vehicleTypes = [
  { id: 'car', name: 'Samochód osobowy' },
  { id: 'truck', name: 'Samochód ciężarowy' },
  { id: 'motorcycle', name: 'Motocykl' },
  { id: 'bus', name: 'Autobus' },
  { id: 'trailer', name: 'Przyczepa' },
]

const countries = [
  { id: 'PL', displayName: 'Polska' },
  { id: 'DE', displayName: 'Niemcy' },
  { id: 'FR', displayName: 'Francja' },
  { id: 'GB', displayName: 'Wielka Brytania' },
  { id: 'IT', displayName: 'Włochy' },
  { id: 'ES', displayName: 'Hiszpania' },
  { id: 'CZ', displayName: 'Czechy' },
  { id: 'SK', displayName: 'Słowacja' },
  { id: 'UA', displayName: 'Ukraina' },
  { id: 'LT', displayName: 'Litwa' },
]

const personRoles = [
  { id: 'kierowca', name: 'Kierowca' },
  { id: 'wlasciciel', name: 'Właściciel' },
  { id: 'wspol_wlasciciel', name: 'Współwłaściciel' },
]

export const ParticipantForm: React.FC<ParticipantFormProps> = ({
  participantData,
  onParticipantChange,
  onDriverChange,
  onAddDriver,
  onRemoveDriver,
  isVictim = false,
  disabled = false,
}) => {
  // Ensure we have at least one driver/person entry
  React.useEffect(() => {
    if (!participantData.drivers || participantData.drivers.length === 0) {
      onAddDriver()
    }
  }, [participantData.drivers, onAddDriver])

  const selectedInsuranceCompanyId = React.useMemo(() => {
    const company = InsuranceCompaniesService.getCompanies().find(
      (c) => c.name === participantData.insuranceCompany,
    )
    return company?.id
  }, [participantData.insuranceCompany])

  return (
    <div className="container-fluid p-4">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Vehicle information card */}
          <div className="bg-white rounded-lg shadow-sm border border-[#d1d9e6] overflow-hidden">
            <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-t-lg border-b border-[#d1d9e6]">
              <div className="text-[#1a3a6c]">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1a3a6c]">Dane pojazdu</h2>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                {/* License Plates */}
                <div className="space-y-1">
                  <Label className="text-[#1a3a6c] text-sm font-medium block">
                    Numer rejestracyjny:
                  </Label>
                  <Input
                    type="text"
                    className="w-full border border-[#d1d9e6] rounded px-3 py-2 uppercase"
                    disabled={disabled}
                    maxLength={50}
                    value={participantData.vehicleRegistration || ''}
                    onChange={(e) => onParticipantChange("vehicleRegistration", e.target.value)}
                    name="vehicleLicensePlates"
                    autoComplete="off"
                  />
                </div>

                {/* VIN */}
                <div className="space-y-1">
                  <Label className="text-[#1a3a6c] text-sm font-medium block">
                    VIN:
                  </Label>
                  <Input
                    type="text"
                    className="w-full border border-[#d1d9e6] rounded px-3 py-2 uppercase"
                    disabled={disabled}
                    value={participantData.vehicleVin || ''}
                    onChange={(e) => onParticipantChange("vehicleVin", e.target.value)}
                    autoComplete="off"
                    name="vehicleVIN"
                  />
                </div>

                {/* Vehicle Type */}
                <div className="space-y-1">
                  <Label className="text-[#1a3a6c] text-sm font-medium block">
                    Rodzaj pojazdu:
                  </Label>
                  <Select
                    disabled={disabled}
                    value={participantData.vehicleType || ''}
                    onValueChange={(value) => onParticipantChange("vehicleType", value)}
                  >
                    <SelectTrigger className="border border-[#d1d9e6] rounded">
                      <SelectValue placeholder="Wybierz rodzaj pojazdu" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Vehicle Make */}
                <div className="space-y-1">
                  <Label className="text-[#1a3a6c] text-sm font-medium block">
                    Marka:
                  </Label>
                  <Input
                    type="text"
                    className="w-full border border-[#d1d9e6] rounded px-3 py-2"
                    disabled={disabled}
                    value={participantData.vehicleBrand || ''}
                    onChange={(e) => onParticipantChange("vehicleBrand", e.target.value)}
                    autoComplete="off"
                    name="vehicleMark"
                  />
                </div>

                {/* Vehicle Model */}
                <div className="space-y-1">
                  <Label className="text-[#1a3a6c] text-sm font-medium block">
                    Model:
                  </Label>
                  <Input
                    type="text"
                    className="w-full border border-[#d1d9e6] rounded px-3 py-2"
                    disabled={disabled}
                    value={participantData.vehicleModel || ''}
                    onChange={(e) => onParticipantChange("vehicleModel", e.target.value)}
                    autoComplete="off"
                    name="vehicleModel"
                  />
                </div>

                {/* Country of Registration */}
                <div className="space-y-1">
                  <Label className="text-[#1a3a6c] text-sm font-medium block">
                    Kraj rejestracji:
                  </Label>
                  <Select
                    value={participantData.country || 'PL'}
                    onValueChange={(value) => onParticipantChange("country", value)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="border border-[#d1d9e6] rounded">
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
            </div>
          </div>

          {/* Vehicle inspection card - only for victims */}
          {isVictim && (
            <div className="bg-white rounded-lg shadow-sm border border-[#d1d9e6] overflow-hidden">
              <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-t-lg border-b border-[#d1d9e6]">
                <div className="text-[#1a3a6c]">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#1a3a6c]">Dane i kontakt do oględzin</h2>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Textarea
                      className="w-full border border-[#d1d9e6] rounded px-3 py-2"
                      disabled={disabled}
                      autoComplete="off"
                      value={participantData.inspectionNotes || ''}
                      onChange={(e) => onParticipantChange("inspectionNotes", e.target.value)}
                      name="vehicleInspectionCity"
                      rows={4}
                      placeholder="Dodatkowe informacje dotyczące oględzin..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Policy information card */}
          <div className="bg-white rounded-lg shadow-sm border border-[#d1d9e6] overflow-hidden">
            <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-t-lg border-b border-[#d1d9e6]">
              <div className="text-[#1a3a6c]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1a3a6c]">Polisa</h2>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                {/* Policy Number */}
                <div className="space-y-1">
                  <Label className="text-[#1a3a6c] text-sm font-medium block">
                    Numer polisy:
                  </Label>
                  <Input
                    type="text"
                    className="w-full border border-[#d1d9e6] rounded px-3 py-2"
                    disabled={disabled}
                    autoComplete="off"
                    value={participantData.policyNumber || ''}
                    onChange={(e) => onParticipantChange("policyNumber", e.target.value)}
                    name="policyNumber"
                  />
                </div>

                {/* Policy Start Date */}
                <div className="space-y-1">
                  <Label className="text-[#1a3a6c] text-sm font-medium block">
                    Data rozpoczęcia:
                  </Label>
                  <DateInput
                    value={participantData.policyStartDate || ''}
                    onChange={(value) => onParticipantChange("policyStartDate", value)}
                    disabled={disabled}
                  />
                </div>

                {/* Policy End Date */}
                <div className="space-y-1">
                  <Label className="text-[#1a3a6c] text-sm font-medium block">
                    Data zakończenia:
                  </Label>
                  <DateInput
                    value={participantData.policyEndDate || ''}
                    onChange={(value) => onParticipantChange("policyEndDate", value)}
                    disabled={disabled}
                  />
                </div>

                {/* Policy Deal Date */}
                <div className="space-y-1">
                  <Label className="text-[#1a3a6c] text-sm font-medium block">
                    Data zawarcia umowy:
                  </Label>
                  <DateInput
                    value={participantData.policyDealDate || ''}
                    onChange={(value) => onParticipantChange("policyDealDate", value)}
                    disabled={disabled}
                  />
                </div>

                {/* Insurance Company */}
                <div className="space-y-1 relative z-10">
                  <Label className="text-[#1a3a6c] text-sm font-medium block">
                    Zakład ubezpieczeń:
                  </Label>
                  <InsuranceDropdown
                    selectedCompanyId={selectedInsuranceCompanyId}
                    onCompanySelected={(event) =>
                      onParticipantChange("insuranceCompany", event.companyName)
                    }
                    className="relative z-20"
                    showClaimLink={false}
                  />
                </div>

                {/* Policy Sum Amount */}
                <div className="space-y-1">
                  <Label className="text-[#1a3a6c] text-sm font-medium block">
                    Suma ubezpieczenia:
                  </Label>
                  <Input
                    type="number"
                    className="w-full border border-[#d1d9e6] rounded px-3 py-2"
                    disabled={disabled}
                    autoComplete="off"
                    value={participantData.policySumAmount || ''}
                    onChange={(e) => onParticipantChange("policySumAmount", Number(e.target.value))}
                    name="policySumAmount"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal data section (full width) */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow-sm border border-[#d1d9e6] overflow-hidden">
          <div className="flex items-center justify-between bg-gray-100 p-3 rounded-t-lg border-b border-[#d1d9e6]">
            <div className="flex items-center gap-3">
              <div className="text-[#1a3a6c]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1a3a6c]">Dane osobowe uczestnika</h2>
              </div>
            </div>
            <Button
              type="button"
              onClick={onAddDriver}
              disabled={disabled}
              size="sm"
              className="bg-[#1a3a6c] hover:bg-[#15305a] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj osobę
            </Button>
          </div>

          <div className="p-4">
            <div className="space-y-4">
              {participantData.drivers && participantData.drivers.map((driver, index) => (
                <div key={driver.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-[#1a3a6c]">
                      Osoba {index + 1}
                    </h4>
                    {participantData.drivers.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveDriver(index)}
                        disabled={disabled}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Role */}
                    <div className="space-y-1">
                      <Label className="text-[#1a3a6c] text-sm font-medium block">
                        Rola:
                      </Label>
                      <Select
                        value={driver.role || 'kierowca'}
                        onValueChange={(value) => onDriverChange(index, 'role', value)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="border border-[#d1d9e6] rounded">
                          <SelectValue placeholder="Wybierz rolę" />
                        </SelectTrigger>
                        <SelectContent>
                          {personRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* First Name */}
                    <div className="space-y-1">
                      <Label className="text-[#1a3a6c] text-sm font-medium block">
                        Imię:
                      </Label>
                      <Input
                        type="text"
                        className="w-full border border-[#d1d9e6] rounded px-3 py-2"
                        disabled={disabled}
                        value={driver.firstName || ''}
                        onChange={(e) => onDriverChange(index, 'firstName', e.target.value)}
                        autoComplete="off"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1">
                      <Label className="text-[#1a3a6c] text-sm font-medium block">
                        Nazwisko:
                      </Label>
                      <Input
                        type="text"
                        className="w-full border border-[#d1d9e6] rounded px-3 py-2"
                        disabled={disabled}
                        value={driver.lastName || ''}
                        onChange={(e) => onDriverChange(index, 'lastName', e.target.value)}
                        autoComplete="off"
                      />
                    </div>

                    {/* Personal ID */}
                    <div className="space-y-1">
                      <Label className="text-[#1a3a6c] text-sm font-medium block">
                        Numer identyfikacyjny:
                      </Label>
                      <Input
                        type="text"
                        className="w-full border border-[#d1d9e6] rounded px-3 py-2"
                        disabled={disabled}
                        value={driver.personalId || ''}
                        onChange={(e) => onDriverChange(index, 'personalId', e.target.value)}
                        autoComplete="off"
                      />
                    </div>

                    {/* License Number - only for drivers */}
                    {driver.role === 'kierowca' && (
                      <div className="space-y-1">
                        <Label className="text-[#1a3a6c] text-sm font-medium block">
                          Numer prawa jazdy:
                        </Label>
                        <Input
                          type="text"
                          className="w-full border border-[#d1d9e6] rounded px-3 py-2"
                          disabled={disabled}
                          value={driver.licenseNumber || ''}
                          onChange={(e) => onDriverChange(index, 'licenseNumber', e.target.value)}
                          autoComplete="off"
                        />
                      </div>
                    )}

                    {/* Phone */}
                    <div className="space-y-1">
                      <Label className="text-[#1a3a6c] text-sm font-medium block">
                        Telefon:
                      </Label>
                      <Input
                        type="tel"
                        className="w-full border border-[#d1d9e6] rounded px-3 py-2"
                        disabled={disabled}
                        value={driver.phone || ''}
                        onChange={(e) => onDriverChange(index, 'phone', e.target.value)}
                        autoComplete="off"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <Label className="text-[#1a3a6c] text-sm font-medium block">
                        E-mail:
                      </Label>
                      <Input
                        type="email"
                        className="w-full border border-[#d1d9e6] rounded px-3 py-2"
                        disabled={disabled}
                        value={driver.email || ''}
                        onChange={(e) => onDriverChange(index, 'email', e.target.value)}
                        autoComplete="off"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-1">
                      <Label className="text-[#1a3a6c] text-sm font-medium block">
                        Adres:
                      </Label>
                      <Input
                        type="text"
                        className="w-full border border-[#d1d9e6] rounded px-3 py-2"
                        disabled={disabled}
                        value={driver.address || ''}
                        onChange={(e) => onDriverChange(index, 'address', e.target.value)}
                        autoComplete="off"
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-1">
                      <Label className="text-[#1a3a6c] text-sm font-medium block">
                        Miasto:
                      </Label>
                      <Input
                        type="text"
                        className="w-full border border-[#d1d9e6] rounded px-3 py-2"
                        disabled={disabled}
                        value={driver.city || ''}
                        onChange={(e) => onDriverChange(index, 'city', e.target.value)}
                        autoComplete="off"
                      />
                    </div>

                    {/* Postal Code */}
                    <div className="space-y-1">
                      <Label className="text-[#1a3a6c] text-sm font-medium block">
                        Kod pocztowy:
                      </Label>
                      <Input
                        type="text"
                        className="w-full border border-[#d1d9e6] rounded px-3 py-2"
                        disabled={disabled}
                        value={driver.postalCode || ''}
                        onChange={(e) => onDriverChange(index, 'postalCode', e.target.value)}
                        autoComplete="off"
                        placeholder="00-000"
                      />
                    </div>

                    {/* Country */}
                    <div className="space-y-1">
                      <Label className="text-[#1a3a6c] text-sm font-medium block">
                        Kraj:
                      </Label>
                      <Select
                        value={driver.country || 'PL'}
                        onValueChange={(value) => onDriverChange(index, 'country', value)}
                        disabled={disabled}
                      >
                        <SelectTrigger className="border border-[#d1d9e6] rounded">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
