'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FormHeader } from '@/components/ui/form-header'
import { Plus, User, AlertTriangle, Trash2 } from 'lucide-react'
import { ParticipantForm } from './participant-form'
import type { ParticipantInfo, DriverInfo } from '@/types'

interface ParticipantsSectionProps {
  injuredParty?: ParticipantInfo
  perpetrator?: ParticipantInfo
  onInjuredPartyChange: (participant: ParticipantInfo | undefined) => void
  onPerpetratorChange: (participant: ParticipantInfo | undefined) => void
  disabled?: boolean
}

export function ParticipantsSection({ 
  injuredParty,
  perpetrator,
  onInjuredPartyChange,
  onPerpetratorChange,
  disabled = false
}: ParticipantsSectionProps) {
  
  const createNewParticipant = (): ParticipantInfo => ({
    id: Date.now().toString(),
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'PL',
    phone: '',
    email: '',
    vehicleRegistration: '',
    vehicleVin: '',
    vehicleType: '',
    vehicleBrand: '',
    vehicleModel: '',
    insuranceCompany: '',
    policyNumber: '',
    drivers: []
  })

  const createNewDriver = (): DriverInfo => ({
    id: Date.now().toString(),
    name: '',
    licenseNumber: '',
    role: 'kierowca',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'PL',
    personalId: ''
  })

  const addInjuredParty = () => {
    if (!injuredParty) {
      const newParticipant = createNewParticipant()
      newParticipant.drivers = [createNewDriver()]
      onInjuredPartyChange(newParticipant)
    }
  }

  const addPerpetrator = () => {
    if (!perpetrator) {
      const newParticipant = createNewParticipant()
      newParticipant.drivers = [createNewDriver()]
      onPerpetratorChange(newParticipant)
    }
  }

  const removeInjuredParty = () => {
    onInjuredPartyChange(undefined)
  }

  const removePerpetrator = () => {
    onPerpetratorChange(undefined)
  }

  const updateInjuredParty = (field: keyof Omit<ParticipantInfo, "drivers">, value: any) => {
    if (injuredParty) {
      onInjuredPartyChange({
        ...injuredParty,
        [field]: value
      })
    }
  }

  const updatePerpetrator = (field: keyof Omit<ParticipantInfo, "drivers">, value: any) => {
    if (perpetrator) {
      onPerpetratorChange({
        ...perpetrator,
        [field]: value
      })
    }
  }

  const updateInjuredPartyDriver = (driverIndex: number, field: keyof DriverInfo, value: any) => {
    if (injuredParty && injuredParty.drivers[driverIndex]) {
      const updatedDrivers = [...injuredParty.drivers]
      updatedDrivers[driverIndex] = {
        ...updatedDrivers[driverIndex],
        [field]: value
      }
      onInjuredPartyChange({
        ...injuredParty,
        drivers: updatedDrivers
      })
    }
  }

  const updatePerpetratorDriver = (driverIndex: number, field: keyof DriverInfo, value: any) => {
    if (perpetrator && perpetrator.drivers[driverIndex]) {
      const updatedDrivers = [...perpetrator.drivers]
      updatedDrivers[driverIndex] = {
        ...updatedDrivers[driverIndex],
        [field]: value
      }
      onPerpetratorChange({
        ...perpetrator,
        drivers: updatedDrivers
      })
    }
  }

  const addInjuredPartyDriver = () => {
    if (injuredParty) {
      onInjuredPartyChange({
        ...injuredParty,
        drivers: [...injuredParty.drivers, createNewDriver()]
      })
    }
  }

  const addPerpetratorDriver = () => {
    if (perpetrator) {
      onPerpetratorChange({
        ...perpetrator,
        drivers: [...perpetrator.drivers, createNewDriver()]
      })
    }
  }

  const removeInjuredPartyDriver = (driverIndex: number) => {
    if (injuredParty && injuredParty.drivers.length > 1) {
      const updatedDrivers = injuredParty.drivers.filter((_, index) => index !== driverIndex)
      onInjuredPartyChange({
        ...injuredParty,
        drivers: updatedDrivers
      })
    }
  }

  const removePerpetratorDriver = (driverIndex: number) => {
    if (perpetrator && perpetrator.drivers.length > 1) {
      const updatedDrivers = perpetrator.drivers.filter((_, index) => index !== driverIndex)
      onPerpetratorChange({
        ...perpetrator,
        drivers: updatedDrivers
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Add participant buttons */}
      <div className="flex gap-3 mb-6">
        {!injuredParty && (
          <Button
            type="button"
            onClick={addInjuredParty}
            disabled={disabled}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Dodaj poszkodowanego
          </Button>
        )}
        {!perpetrator && (
          <Button
            type="button"
            onClick={addPerpetrator}
            disabled={disabled}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Dodaj sprawcę
          </Button>
        )}
      </div>

      {/* Injured Party Form */}
      {injuredParty && (
        <Card className="border border-blue-300 bg-blue-50/30 rounded-lg overflow-hidden">
          <FormHeader icon={User} title="Poszkodowany">
            <Button
              variant="destructive"
              size="sm"
              onClick={removeInjuredParty}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Usuń uczestnika
            </Button>
          </FormHeader>
          <CardContent className="p-0">
            <ParticipantForm
              participantData={injuredParty}
              onParticipantChange={updateInjuredParty}
              onDriverChange={updateInjuredPartyDriver}
              onAddDriver={addInjuredPartyDriver}
              onRemoveDriver={removeInjuredPartyDriver}
              isVictim={true}
              disabled={disabled}
            />
          </CardContent>
        </Card>
      )}

      {/* Perpetrator Form */}
      {perpetrator && (
        <Card className="border border-red-300 bg-red-50/30 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-md border border-[#d1d9e6]">
                <div className="text-[#1a3a6c]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-[#1a3a6c]">Sprawca</h2>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={removePerpetrator}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Usuń uczestnika
              </Button>
            </div>
            <ParticipantForm
              participantData={perpetrator}
              onParticipantChange={updatePerpetrator}
              onDriverChange={updatePerpetratorDriver}
              onAddDriver={addPerpetratorDriver}
              onRemoveDriver={removePerpetratorDriver}
              isVictim={false}
              disabled={disabled}
            />
          </div>
        </Card>
      )}

      {!injuredParty && !perpetrator && (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-lg">Brak uczestników zdarzenia</p>
          <p className="text-sm mt-2">Użyj przycisków powyżej, aby dodać poszkodowanego lub sprawcę</p>
        </div>
      )}
    </div>
  )
}
