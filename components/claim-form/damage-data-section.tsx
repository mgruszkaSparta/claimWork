"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FormHeader } from "@/components/ui/form-header"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DependentSelect } from "@/components/ui/dependent-select"
import ClientDropdown from "@/components/client-dropdown"
import HandlerDropdown from "@/components/handler-dropdown"
import InsuranceDropdown from "@/components/insurance-dropdown"
import LeasingDropdown from "@/components/leasing-dropdown"
import { API_BASE_URL } from "@/lib/api"
import { FileText } from "lucide-react"
import type { Claim } from "@/types"
import type { ClientSelectionEvent } from "@/types/client"
import type { HandlerSelectionEvent } from "@/types/handler"
import type { CompanySelectionEvent } from "@/types/insurance"
import type { LeasingCompanySelectionEvent } from "@/types/leasing"

interface RiskType {
  value: string
  label: string
}

interface ClaimStatus {
  id: number
  name: string
  description: string
}

interface DamageDataSectionProps {
  claimFormData: Partial<Claim>
  handleFormChange: (field: keyof Claim, value: any) => void
  claimObjectType: string
  setClaimObjectType: (value: string) => void
  riskTypes: RiskType[]
  loadingRiskTypes: boolean
  claimStatuses: ClaimStatus[]
  loadingStatuses: boolean
}

const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return ""
  if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
    return dateString.split("T")[0]
  }
  const parts = dateString.split(".")
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month}-${day}`
  }
  const date = new Date(dateString)
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0]
  }
  return ""
}

export function DamageDataSection({
  claimFormData,
  handleFormChange,
  claimObjectType,
  setClaimObjectType,
  riskTypes,
  loadingRiskTypes,
  claimStatuses,
  loadingStatuses,
}: DamageDataSectionProps) {
  return (
    <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
      <FormHeader icon={FileText} title="Dane szkody" />
      <CardContent className="p-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="claimObjectType" className="text-sm font-medium text-gray-700">
                Typ szkody
              </Label>
              <Select
                value={claimObjectType}
                onValueChange={(value) => {
                  setClaimObjectType(value)
                  handleFormChange("riskType", "")
                  handleFormChange("damageType", "")
                }}
              >
                <SelectTrigger className="mt-0.5">
                  <SelectValue placeholder="Wybierz typ szkody..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Szkoda komunikacyjna</SelectItem>
                  <SelectItem value="2">Szkoda mienia</SelectItem>
                  <SelectItem value="3">Szkoda transportowa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="riskType" className="text-sm font-medium text-gray-700">
                Ryzyko szkody
              </Label>
              <Select
                value={claimFormData.riskType || ""}
                onValueChange={(value) => {
                  handleFormChange("riskType", value)
                  handleFormChange("damageType", "")
                }}
                disabled={loadingRiskTypes}
              >
                <SelectTrigger className="mt-0.5">
                  <SelectValue placeholder={loadingRiskTypes ? "Ładowanie..." : "Wybierz ryzyko szkody..."} />
                </SelectTrigger>
                <SelectContent>
                  {riskTypes.map((riskType) => (
                    <SelectItem key={riskType.value} value={riskType.value}>
                      {riskType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Status szkody
              </Label>
              <Select
                value={claimFormData.claimStatusId?.toString() ?? ""}
                onValueChange={(value) =>
                  handleFormChange("claimStatusId", value ? parseInt(value) : undefined)
                }
                disabled={loadingStatuses}
              >
                <SelectTrigger className="mt-0.5">
                  <SelectValue placeholder={loadingStatuses ? "Ładowanie..." : "Wybierz status szkody..."} />
                </SelectTrigger>
                <SelectContent>
                  {claimStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id.toString()}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportDateToInsurer" className="text-sm font-medium text-gray-700">
                Data zgłoszenia do TU
              </Label>
              <Input
                id="reportDateToInsurer"
                type="date"
                value={formatDateForInput(claimFormData.reportDateToInsurer)}
                onChange={(e) => handleFormChange("reportDateToInsurer", e.target.value)}
                className="mt-0.5"
              />
            </div>
            <div className="relative z-10">
              <Label htmlFor="client" className="text-sm font-medium text-gray-700 mb-2 block">
                Klient
              </Label>
              <ClientDropdown
                selectedClientId={claimFormData.clientId ? parseInt(claimFormData.clientId) : undefined}
                onClientSelected={(event: ClientSelectionEvent) => {
                  handleFormChange("client", event.clientName)
                  handleFormChange("clientId", event.clientId.toString())
                }}
                className="relative z-20"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Kanał zgłoszenia</Label>
              <RadioGroup
                value={claimFormData.reportingChannel || ""}
                onValueChange={(value) => handleFormChange("reportingChannel", value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="infolinia" id="channel-infolinia" />
                  <Label htmlFor="channel-infolinia" className="font-normal text-sm">
                    Infolinia
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="channel-email" />
                  <Label htmlFor="channel-email" className="font-normal text-sm">
                    Email
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bezpośrednio" id="channel-direct" />
                  <Label htmlFor="channel-direct" className="font-normal text-sm">
                    Bezpośrednio
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="damageType" className="text-sm font-medium text-gray-700">
                Rodzaj szkody
              </Label>
              <DependentSelect
                value={claimFormData.damageType || ""}
                onValueChange={(value) => handleFormChange("damageType", value)}
                placeholder="Wybierz rodzaj szkody..."
                apiUrl={`${API_BASE_URL}/damage-types`}
                riskTypeId={claimFormData.riskType ? Number(claimFormData.riskType) : undefined}
                disabled={!claimFormData.riskType}
              />
            </div>
            <div>
              <Label htmlFor="insurerClaimNumber" className="text-sm font-medium text-gray-700">
                Nr szkody TU
              </Label>
              <Input
                id="insurerClaimNumber"
                value={claimFormData.insurerClaimNumber || ""}
                onChange={(e) => handleFormChange("insurerClaimNumber", e.target.value)}
                className="mt-0.5"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Nr szkody Sparta</Label>
              <Input
                id="spartaNumber"
                value={claimFormData.spartaNumber || ""}
                readOnly
                className="bg-gray-50 mt-0.5 border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="handler" className="text-sm font-medium text-gray-700">
                Likwidator
              </Label>
              <HandlerDropdown
                selectedHandlerId={claimFormData.handlerId || undefined}
                onHandlerSelected={(event: HandlerSelectionEvent) => {
                  handleFormChange("handlerId", event.handlerId.toString())
                  handleFormChange("handler", event.handlerName)
                  handleFormChange("handlerEmail", event.handlerEmail || "")
                  handleFormChange("handlerPhone", event.handlerPhone || "")
                }}
                className="mt-0.5"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 my-8" />

        <div className="space-y-4">
          <div className="relative z-10">
            <Label htmlFor="insuranceCompany" className="text-sm font-medium text-gray-700 mb-2 block">
              Towarzystwo ubezpieczeniowe
            </Label>
            <InsuranceDropdown
              selectedCompanyId={claimFormData.insuranceCompanyId ? parseInt(claimFormData.insuranceCompanyId) : undefined}
              onCompanySelected={(event: CompanySelectionEvent) => {
                handleFormChange("insuranceCompany", event.companyName)
                handleFormChange("insuranceCompanyId", event.companyId.toString())
              }}
              className="relative z-20"
            />
          </div>
          <div className="relative z-10">
            <Label htmlFor="leasingCompany" className="text-sm font-medium text-gray-700 mb-2 block">
              Firma leasingowa
            </Label>
            <LeasingDropdown
              selectedCompanyId={claimFormData.leasingCompanyId ? parseInt(claimFormData.leasingCompanyId) : undefined}
              onCompanySelected={(event: LeasingCompanySelectionEvent) => {
                handleFormChange("leasingCompany", event.companyName)
                handleFormChange("leasingCompanyId", event.companyId.toString())
              }}
              className="relative z-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DamageDataSection

