"use client"

import { useCallback } from "react"
import { API_ENDPOINTS, generateId } from "@/lib/constants"
import { authFetch } from "@/lib/auth-fetch"
import { DamageLevel } from "@/components/damage-diagram"

const severityToLevel = (severity?: string): DamageLevel => {
  switch (severity?.toLowerCase()) {
    case "light":
      return DamageLevel.LIGHT
    case "medium":
      return DamageLevel.MEDIUM
    case "heavy":
      return DamageLevel.HEAVY
    default:
      return DamageLevel.NONE
  }
}

const levelToSeverity = (level?: DamageLevel): string | undefined => {
  switch (level) {
    case DamageLevel.LIGHT:
      return "light"
    case DamageLevel.MEDIUM:
      return "medium"
    case DamageLevel.HEAVY:
      return "heavy"
    default:
      return undefined
  }
}

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
  level?: DamageLevel
}

export interface DamageInit {
  id: string
}

export function createDamageDraft(params: Partial<Damage> = {}): Damage {
  return {
    description: "",
    isSaved: false,
    level: DamageLevel.LIGHT,
    ...params,
  }
}

export function useDamages(eventId?: string) {
  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const initDamage = useCallback(async (): Promise<DamageInit> => {
    const response = await authFetch(API_ENDPOINTS.DAMAGES_INIT, {
      method: "POST",

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

      const response = await authFetch(
        `${API_ENDPOINTS.DAMAGES}/event/${targetId}`,

        { method: "GET" },

      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Nie udało się pobrać szkód")
      }

      const data = await response.json()
      return data.map((d: any) => ({
        ...d,
        level: severityToLevel(d.severity),
      }))
    },
    [eventId],
  )

  const createDamage = useCallback(
    async (damage: Omit<Damage, "id" | "eventId">): Promise<void> => {
      if (!eventId) {
        throw new Error("Brak identyfikatora zdarzenia")
      }

      const { level, ...rest } = damage
      const response = await authFetch(API_ENDPOINTS.DAMAGES, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          ...rest,
          severity: levelToSeverity(level),
          id: damage.id || generateId(),
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
      const { level, ...rest } = damage
      const response = await authFetch(`${API_ENDPOINTS.DAMAGES}/${id}`, {
        method: "PUT",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          ...rest,
          ...(level !== undefined ? { severity: levelToSeverity(level) } : {}),
          eventId,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Nie udało się zaktualizować szkody")
      }
    },
    [eventId],
  )

  const deleteDamage = useCallback(async (id: string): Promise<void> => {
    const response = await authFetch(`${API_ENDPOINTS.DAMAGES}/${id}`, {
      method: "DELETE",

    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Nie udało się usunąć szkody")
    }
  }, [])

  return { createDamage, updateDamage, deleteDamage, initDamage, fetchDamages }

}

