"use client"

import { useState, useCallback } from "react"
import { initialClaimFormData, emptyDriver, generateId } from "@/lib/constants"
import type { Claim, ParticipantInfo, DriverInfo } from "@/types"

export function useClaimForm(initialData?: Partial<Claim>) {
  const [claimFormData, setClaimFormData] = useState<Partial<Claim>>({
    ...initialClaimFormData,

    id: initialData?.id,

    ...initialData,
  })

  const handleFormChange = useCallback((field: keyof Claim, value: any) => {
    setClaimFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  const handleParticipantChange = useCallback(
    (party: "injuredParty" | "perpetrator", field: keyof Omit<ParticipantInfo, "drivers">, value: any) => {
      setClaimFormData((prev) => {
        const currentParticipant = prev[party] || {
          id: generateId(),
          name: "",
          address: "",
          city: "",
          postalCode: "",
          country: "PL",
          phone: "",
          email: "",
          vehicleRegistration: "",
          vehicleBrand: "",
          vehicleModel: "",
          vehicleVin: "",
          vehicleType: "",
          policyNumber: "",
          insuranceCompany: "",
          firstName: "",
          lastName: "",
          personalId: "",
          inspectionContactName: "",
          inspectionContactPhone: "",
          inspectionContactEmail: "",
          drivers: [{ ...emptyDriver, id: generateId() }],
        }

        return {
          ...prev,
          [party]: {
            ...currentParticipant,
            [field]: value,
          },
        }
      })
    },
    []
  )

  const handleDriverChange = useCallback(
    (party: "injuredParty" | "perpetrator", driverIndex: number, field: keyof DriverInfo, value: any) => {
      setClaimFormData((prev) => {
        const participant = prev[party]
        if (!participant || !participant.drivers || !participant.drivers[driverIndex]) {
          return prev
        }

        const updatedDrivers = [...participant.drivers]
        updatedDrivers[driverIndex] = {
          ...updatedDrivers[driverIndex],
          [field]: value,
        }

        return {
          ...prev,
          [party]: {
            ...participant,
            drivers: updatedDrivers,
          },
        }
      })
    },
    []
  )

  const handleAddDriver = useCallback((party: "injuredParty" | "perpetrator") => {
    setClaimFormData((prev) => {
      const participant = prev[party]
      if (!participant) {
        return prev
      }

      const newDriver = { ...emptyDriver, id: generateId() }
      const updatedDrivers = [...(participant.drivers || []), newDriver]

      return {
        ...prev,
        [party]: {
          ...participant,
          drivers: updatedDrivers,
        },
      }
    })
  }, [])

  const handleRemoveDriver = useCallback((party: "injuredParty" | "perpetrator", driverIndex: number) => {
    setClaimFormData((prev) => {
      const participant = prev[party]
      if (!participant || !participant.drivers || participant.drivers.length <= 1) {
        return prev
      }

      const updatedDrivers = participant.drivers.filter((_, index) => index !== driverIndex)

      return {
        ...prev,
        [party]: {
          ...participant,
          drivers: updatedDrivers,
        },
      }
    })
  }, [])

  const resetForm = useCallback(() => {
    setClaimFormData({ ...initialClaimFormData })
  }, [])

  return {
    claimFormData,
    setClaimFormData,
    handleFormChange,
    handleParticipantChange,
    handleDriverChange,
    handleAddDriver,
    handleRemoveDriver,
    resetForm,
  }
}
