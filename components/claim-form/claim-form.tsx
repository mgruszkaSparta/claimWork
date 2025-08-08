'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ParticipantsSection } from './participants-section'
import { DocumentsSection } from '../documents-section'
import { useClaims } from '@/hooks/use-claims'
import { useDamages } from '@/hooks/use-damages'
import { useRouter } from 'next/navigation'
import type { Claim, ParticipantInfo, UploadedFile, RequiredDocument } from '@/types'

interface ClaimFormProps {
  initialData?: Claim
  mode: 'create' | 'edit' | 'view'
}

export function ClaimForm({ initialData, mode }: ClaimFormProps) {
  const router = useRouter()
  const { createClaim, updateClaim, initializeClaim, loading, error } = useClaims()
  const initialized = useRef(false)
  const [formData, setFormData] = useState<Claim>({
    spartaNumber: '',
    claimNumber: '',
    insurerClaimNumber: '',
    status: 'Nowa',
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
  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([
    { id: '1', name: 'Zgłoszenie szkody', required: true, uploaded: false, description: 'Formularz zgłoszenia szkody' },
    { id: '2', name: 'Dowód rejestracyjny', required: true, uploaded: false, description: 'Kopia dowodu rejestracyjnego pojazdu' },
    { id: '3', name: 'Polisa ubezpieczeniowa', required: true, uploaded: false, description: 'Kopia polisy OC/AC' },
    { id: '4', name: 'Prawo jazdy', required: false, uploaded: false, description: 'Kopia prawa jazdy kierowcy' },
    { id: '5', name: 'Zdjęcia szkody', required: false, uploaded: false, description: 'Dokumentacja fotograficzna szkody' }
  ])

  const isDisabled = mode === 'view'
  const { createDamage } = useDamages(formData.id)

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
      let finalDamages = formData.damages || []


      if (mode === 'create') {
        const result = await createClaim(payload)
        if (result && result.id) {
          if (pendingFiles.length > 0) {
            await Promise.all(
              pendingFiles.map(async (file) => {
                if (!file.file) return
                const formDataFile = new FormData()
                formDataFile.append('file', file.file)
                formDataFile.append('eventId', result.id.toString())
                formDataFile.append('documentType', file.category || 'Inne dokumenty')
                formDataFile.append('uploadedBy', 'Current User')
                await fetch('/api/documents/upload', {
                  method: 'POST',
                  body: formDataFile,
                })
              })
            )
          }
          router.push(`/claims/${result.id}/view`)

        }
      } else {
        finalDamages = finalDamages.map(d => ({ ...d, id: undefined }))
      }

      setFormData(prev => ({ ...prev, damages: finalDamages }))
      const payload = { ...formData, damages: finalDamages, documents: uploadedFiles }

      if (formData.id) {
        const result = await updateClaim(formData.id, payload)
        if (result) {
          router.push(`/claims/${formData.id}/view`)


        }
      }
    } catch (err) {
      console.error('Error submitting form:', err)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Podstawowe informacje</CardTitle>
          </CardHeader>
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
        <Card>
          <CardHeader>
            <CardTitle>Opis zdarzenia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          <CardHeader>
            <CardTitle>Uczestnicy zdarzenia</CardTitle>
          </CardHeader>
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
          <CardHeader>
            <CardTitle>Dokumenty</CardTitle>
          </CardHeader>
          <CardContent>

            <DocumentsSection
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              pendingFiles={pendingFiles}
              setPendingFiles={setPendingFiles}
              requiredDocuments={requiredDocuments}
              setRequiredDocuments={setRequiredDocuments}
              eventId={formData.id as string}
            />

          </CardContent>
        </Card>

        {/* Form Actions */}
        {mode !== 'view' && (
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
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
