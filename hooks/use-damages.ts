"use client"

import { useCallback } from "react"

export interface Damage {
  id?: string
  eventId?: string
  description: string
  detail?: string
  location?: string
  severity?: string
  estimatedCost?: number
  actualCost?: number
}

export function useDamages(eventId?: string) {
  const createDamage = useCallback(
    async (damage: Omit<Damage, "id" | "eventId">): Promise<Damage> => {
      if (!eventId) {
        throw new Error("Brak identyfikatora zdarzenia")
      }

      const response = await fetch("/api/damages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...damage, eventId }),
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
      const response = await fetch(`/api/damages/${id}`, {
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
    const response = await fetch(`/api/damages/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Nie udało się usunąć szkody")
    }
  }, [])

  return { createDamage, updateDamage, deleteDamage }
}

