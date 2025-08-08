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
  isSaved?: boolean
}

export function useDamages(eventId?: string) {
  const initDamage = useCallback(async (): Promise<string> => {
    if (!eventId) {
      throw new Error("Brak identyfikatora zdarzenia")
    }

    const response = await fetch("/api/damages/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Nie udało się zainicjować szkody")
    }

    const data = await response.json()
    return data.id
  }, [eventId])

  const saveDamage = useCallback(
    async (damage: Damage): Promise<void> => {
      if (!damage.id) {
        throw new Error("Brak identyfikatora szkody")
      }

      const response = await fetch("/api/damages/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...damage, eventId: damage.eventId || eventId }),
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

  const deleteDamage = useCallback(
    async (id: string, saved = true): Promise<void> => {
      if (!saved) return
      const response = await fetch(`/api/damages/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Nie udało się usunąć szkody")
      }
    },
    [],
  )

  return { initDamage, saveDamage, updateDamage, deleteDamage }
}

