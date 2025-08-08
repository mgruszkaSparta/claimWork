"use client"

import { useCallback } from "react"
import { API_ENDPOINTS } from "@/lib/constants"



export interface Damage {
  id?: string
  eventId?: string
  description: string
  detail?: string
  location?: string
  severity?: string
  estimatedCost?: number
  actualCost?: number
  isSaved?: boolean
}

export function useDamages(eventId?: string) {

  const initDamages = useCallback(async (): Promise<Damage[]> => {
    const response = await fetch(API_ENDPOINTS.DAMAGES_INIT)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Nie udało się pobrać szkód")
    }

    return response.json()
  }, [])


  const createDamage = useCallback(
    async (damage: Omit<Damage, "id" | "eventId">): Promise<void> => {
      if (!eventId) {
        throw new Error("Brak identyfikatora zdarzenia")
      }

      const response = await fetch(API_ENDPOINTS.DAMAGES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...damage, eventId }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Nie udało się zapisać szkody")
      }
    },
    [eventId],
  )

  const updateDamage = useCallback(
    async (id: string, damage: Partial<Damage>): Promise<void> => {
      const response = await fetch(`${API_ENDPOINTS.DAMAGES}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...damage, eventId }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Nie udało się zaktualizować szkody")
      }
    },
    [eventId],
  )

  const deleteDamage = useCallback(async (id: string): Promise<void> => {
    await fetch(`${API_ENDPOINTS.DAMAGES}/${id}`, {
      method: "DELETE",
    })
  }, [])


  const fetchDamages = useCallback(
    async (eventIdToFetch: string): Promise<Damage[]> => {
      const response = await fetch(`/api/damages/event/${eventIdToFetch}`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Nie udało się pobrać listy szkód")
      }

      return response.json()
    },
    [],
  )

  return { createDamage, updateDamage, deleteDamage, fetchDamages }


}

