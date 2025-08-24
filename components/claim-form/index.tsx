'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FormHeader } from '@/components/ui/form-header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { FileText, Users } from 'lucide-react'
import { ParticipantsSection } from './participants-section'
import { DocumentsSection } from '../documents-section'
import { useClaims } from '@/hooks/use-claims'
import { useDamages } from '@/hooks/use-damages'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useUnsavedChangesWarning, UNSAVED_CHANGES_MESSAGE } from '@/hooks/use-unsaved-changes-warning'
import type { Claim, ParticipantInfo, UploadedFile, RequiredDocument } from '@/types'
import { getRequiredDocumentsByObjectType } from '@/lib/required-documents'

interface ClaimFormProps {
  initialData?: Claim
  mode: 'create' | 'edit' | 'view'
}

export function ClaimForm({ initialData, mode }: ClaimFormProps) {
  const router = useRouter()
  const { createClaim, updateClaim, initializeClaim, loading, error } = useClaims()
  const { toast } = useToast()
  useUnsavedChangesWarning(mode !== 'view')
  const initialized = useRef(false)
  const [formData, setFormData] = useState<Claim>({
    spartaNumber: '',
    claimNumber: '',
    insurerClaimNumber: '',
    status: 'Nowa',
    claimStatusId: undefined,
    riskType: '',
    damageType: '',
    damageDate: '',
    eventTime: '',
    reportDate: '',
    reportDateToInsurer: '',
    eventLocation: '',
    eventDescription: '',
    comments: '',
    area: '',
    wereInjured: false,
    statementWithPerpetrator: false,
    perpetratorFined: false,
    reportingChannel: '',
    servicesCalled: [],
    policeUnitDetails: '',
    vehicleType: '',
    damageDescription: '',
    client: '',
    clientId: '',
    handler: '',
    handlerId: '',
    handlerEmail: '',
    handlerPhone: '',
    insuranceCompany: '',
    insuranceCompanyId: '',
    leasingCompany: '',
    leasingCompanyId: '',
    totalClaim: 0,
    payout: 0,
    currency: 'PLN',
    liquidator: '',
    brand: '',
    vehicleNumber: '',
    propertyDamageSubject: '',
    damageListing: '',
    inspectionContact: '',
    injuredPartyData: {},
    cargoDetails: '',
    carrierInfo: '',
    damages: [],
    decisions: [],
    appeals: [],
    clientClaims: [],
    recourses: [],
    settlements: [],
    ...initialData
  })

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [pendingFiles, setPendingFiles] = useState<UploadedFile[]>([])
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>(() =>
    getRequiredDocumentsByObjectType(initialData?.objectTypeId)
  )

  const isDisabled = mode === 'view'
  const { createDamage } = useDamages(formData.id)

  const mapCategoryNameToCode = (name?: string | null) =>
    requiredDocuments.find((d) => d.name === name)?.category || name || 'Inne dokumenty'

  useEffect(() => {
    if (!initialized.current && mode === 'create' && !formData.id) {
      initialized.current = true
      initializeClaim().then((id) => {
        if (id) {
          setFormData((prev) => ({ ...prev, id }))
        }
      })
    }
  }, [mode, formData.id, initializeClaim])

  const handleInputChange = (field: keyof Claim, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  useEffect(() => {
    setRequiredDocuments(getRequiredDocumentsByObjectType(formData.objectTypeId))
  }, [formData.objectTypeId])

  const handleInjuredPartyChange = (participant: ParticipantInfo | undefined) => {
    setFormData(prev => ({
      ...prev,
      injuredParty: participant
    }))
  }

  const handlePerpetratorChange = (participant: ParticipantInfo | undefined) => {
    setFormData(prev => ({
      ...prev,
      perpetrator: participant
    }))
  }

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData(prev => {
      const currentServices = prev.servicesCalled || []
      if (checked) {
        return {
          ...prev,
          servicesCalled: [...currentServices, service as any]
        }
      } else {
        return {
          ...prev,
          servicesCalled: currentServices.filter(s => s !== service)
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Settlements and recourses are handled via dedicated endpoints and
      // should not be included when creating or updating a claim. Exclude
      // them from the payload to prevent accidental overwrites.
      const {
        settlements: _settlements,
        recourses: _recourses,
        ...claimWithoutSettlementsRecourses
      } = formData

      const payload: Claim = {
        ...claimWithoutSettlementsRecourses,
        damages:
          claimWithoutSettlementsRecourses.damages?.map((d) => ({
            ...d,
            id: mode === 'create' ? undefined : d.id,
          })) || [],
        documents: uploadedFiles,
      }

      let saved: Claim | null = null

      if (mode === 'create') {
        saved = await createClaim(payload)
      } else if (formData.id) {
        saved = await updateClaim(formData.id, payload)
      }

      if (saved && saved.id) {
        if (pendingFiles.length > 0) {
          await Promise.all(
            pendingFiles.map(async (file) => {
              if (!file.file) return
              const formDataFile = new FormData()
              formDataFile.append('file', file.file)
              formDataFile.append('eventId', saved!.id.toString())
              formDataFile.append('category', file.categoryCode || mapCategoryNameToCode(file.category || 'Inne dokumenty'))
              formDataFile.append('uploadedBy', 'Current User')
              await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formDataFile,
              })
            })
          )
        }

        setFormData(saved)
        router.push(`/claims/${saved.id}/view`)
      }
    } catch (err) {
      console.error('Error submitting form:', err)
      toast({
        title: 'Błąd',
        description: err instanceof Error ? err.message : 'Wystąpił błąd podczas zapisywania szkody.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <FormHeader icon={FileText} title="Podstawowe informacje" />
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="spartaNumber">Numer Sparta</Label>
              <Input
                id="spartaNumber"
                value={formData.spartaNumber || ''}
                onChange={(e) => handleInputChange('spartaNumber', e.target.value)}
                disabled={isDisabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="claimNumber">Numer szkody</Label>
              <Input
                id="claimNumber"
                value={formData.claimNumber || ''}
                onChange={(e) => handleInputChange('claimNumber', e.target.value)}
                disabled={isDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || ''}
                onValueChange={(value) => handleInputChange('status', value)}
                disabled={isDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nowa">Nowa</SelectItem>
                  <SelectItem value="W trakcie">W trakcie</SelectItem>
                  <SelectItem value="Zamknięta">Zamknięta</SelectItem>
                  <SelectItem value="Zawieszona">Zawieszona</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="damageDate">Data szkody</Label>
              <Input
                id="damageDate"
                type="date"
                value={formData.damageDate || ''}
                onChange={(e) => handleInputChange('damageDate', e.target.value)}
                disabled={isDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventTime">Godzina zdarzenia</Label>
              <Input
                id="eventTime"
                type="time"
                value={formData.eventTime || ''}
                onChange={(e) => handleInputChange('eventTime', e.target.value)}
                disabled={isDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventLocation">Miejsce zdarzenia</Label>
              <Input
                id="eventLocation"
                value={formData.eventLocation || ''}
                onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                disabled={isDisabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Description */}
        <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
          <FormHeader icon={FileText} title="Opis zdarzenia" />
          <CardContent className="p-6 bg-white space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventDescription">Opis zdarzenia</Label>
              <Textarea
                id="eventDescription"
                value={formData.eventDescription || ''}
                onChange={(e) => handleInputChange('eventDescription', e.target.value)}
                disabled={isDisabled}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="wereInjured"
                  checked={formData.wereInjured || false}
                  onCheckedChange={(checked) => handleInputChange('wereInjured', checked)}
                  disabled={isDisabled}
                />
                <Label htmlFor="wereInjured">Czy były osoby ranne?</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="statementWithPerpetrator"
                  checked={formData.statementWithPerpetrator || false}
                  onCheckedChange={(checked) => handleInputChange('statementWithPerpetrator', checked)}
                  disabled={isDisabled}
                />
                <Label htmlFor="statementWithPerpetrator">Oświadczenie ze sprawcą</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perpetratorFined"
                  checked={formData.perpetratorFined || false}
                  onCheckedChange={(checked) => handleInputChange('perpetratorFined', checked)}
                  disabled={isDisabled}
                />
                <Label htmlFor="perpetratorFined">Sprawca ukarany</Label>
              </div>
            </div>

            {/* Services Called */}
            <div className="space-y-2">
              <Label>Wezwane służby</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['policja', 'pogotowie', 'straz', 'holownik'].map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={formData.servicesCalled?.includes(service as any) || false}
                      onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                      disabled={isDisabled}
                    />
                    <Label htmlFor={service} className="capitalize">
                      {service === 'straz' ? 'Straż pożarna' : service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants Section */}
        <Card>
          <FormHeader icon={Users} title="Uczestnicy zdarzenia" />
          <CardContent>
            <ParticipantsSection
              injuredParty={formData.injuredParty}
              perpetrator={formData.perpetrator}
              onInjuredPartyChange={handleInjuredPartyChange}
              onPerpetratorChange={handlePerpetratorChange}
              disabled={isDisabled}
            />
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card>
          <FormHeader icon={FileText} title="Dokumenty" />
          <CardContent>

            <DocumentsSection
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              pendingFiles={pendingFiles}
              setPendingFiles={setPendingFiles}
              requiredDocuments={requiredDocuments}
              setRequiredDocuments={setRequiredDocuments}
              eventId={formData.id}
              storageKey={`claim-form-${formData.id || 'new'}`}
            />

          </CardContent>
        </Card>

        {/* Form Actions */}
        {mode !== 'view' && (
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (confirm(UNSAVED_CHANGES_MESSAGE)) {
                  router.back()
                }
              }}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Zapisywanie...' : mode === 'create' ? 'Utwórz szkodę' : 'Zapisz zmiany'}
            </Button>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm mt-2">
            {error}
          </div>
        )}
      </form>
    </div>
  )
}
