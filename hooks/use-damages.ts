"use client"

import { useState, useCallback } from "react"
import type { DamageDto, DamageUpsertDto } from "@/lib/api"

export function useDamages() {
  const [damages, setDamages] = useState<DamageDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDamages = useCallback(async (eventId: string) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/damages/event/${eventId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: DamageDto[] = await res.json()
      setDamages(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch damages"
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const createDamage = useCallback(async (payload: DamageUpsertDto) => {
    setError(null)
    const res = await fetch(`/api/damages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || "Failed to create damage")
    }
    const data: DamageDto = await res.json()
    setDamages((prev) => [...prev, data])
    return data
  }, [])

  const updateDamage = useCallback(async (id: string, payload: DamageUpsertDto) => {
    setError(null)
    const res = await fetch(`/api/damages/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || "Failed to update damage")
    }
    setDamages((prev) =>
      prev.map((d) =>
        (d.id?.toString() ?? "") === id ? { ...d, ...payload } : d,
      ),
    )
  }, [])

  return { damages, loading, error, fetchDamages, createDamage, updateDamage }
}

