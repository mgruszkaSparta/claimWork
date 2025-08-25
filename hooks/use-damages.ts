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

export interface DamageInit {
  id: string
}

export function createDamageDraft(params: Partial<Damage> = {}): Damage {
  return {
    description: "",
    isSaved: false,
    ...params,
  }
}

export function useDamages(eventId?: string) {
  const initDamage = useCallback(async (): Promise<DamageInit> => {
    const response = await fetch(API_ENDPOINTS.DAMAGES_INIT, {
      method: "POST",
      credentials: "omit",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Nie udało się pobrać szkód")
    }

    return response.json()
  }, [])

  const fetchDamages = useCallback(
    async (id?: string): Promise<Damage[]> => {
      const targetId = id || eventId
      if (!targetId) {
        throw new Error("Brak identyfikatora zdarzenia")
      }

      const response = await fetch(
        `${API_ENDPOINTS.DAMAGES}/event/${targetId}`,
        { method: "GET", credentials: "omit" },
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Nie udało się pobrać szkód")
      }

      return response.json()
    },
    [eventId],
  )

  const createDamage = useCallback(
    async (damage: Omit<Damage, "id" | "eventId">): Promise<void> => {
      if (!eventId) {
        throw new Error("Brak identyfikatora zdarzenia")
      }

      const response = await fetch(API_ENDPOINTS.DAMAGES, {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...damage,
          eventId: (damage as any).eventId || eventId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Nie udało się zapisać szkody")
      }

      return response.json()
    },
    [eventId],
  )

  const updateDamage = useCallback(
    async (id: string, damage: Partial<Damage>): Promise<void> => {
      const response = await fetch(`${API_ENDPOINTS.DAMAGES}/${id}`, {
        method: "PUT",
        credentials: "omit",
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
    const response = await fetch(`${API_ENDPOINTS.DAMAGES}/${id}`, {
      method: "DELETE",
      credentials: "omit",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Nie udało się usunąć szkody")
    }
  }, [])

  return { createDamage, updateDamage, deleteDamage, initDamage, fetchDamages }

}

