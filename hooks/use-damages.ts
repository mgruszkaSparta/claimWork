"use client"

import { useCallback } from "react"
import { generateId } from "@/lib/constants"

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

  const initDamage = useCallback(
    (damage: Pick<Damage, "description" | "detail">): Damage => ({
      id: generateId(),
      description: damage.description,
      detail: damage.detail,
    }),
    [],
  )

  const createDamage = useCallback(
    async (damage: Omit<Damage, "id" | "eventId">): Promise<Damage> => {
      if (!eventId) {
        throw new Error("Brak identyfikatora zdarzenia")

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


  return { initDamage, createDamage, updateDamage, deleteDamage }

}

