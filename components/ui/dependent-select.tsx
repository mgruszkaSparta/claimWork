"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle } from 'lucide-react'

interface Option {
  id: string
  name: string
  code?: string
  [key: string]: any
}

interface DependentSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  apiUrl: string
  dependsOn?: string
  disabled?: boolean
  className?: string
}

export function DependentSelect({
  value,
  onValueChange,
  placeholder = "Wybierz opcję...",
  apiUrl,
  dependsOn,
  disabled = false,
  className,
}: DependentSelectProps) {
  const [options, setOptions] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOptions = async () => {
      if (!apiUrl) return

      setLoading(true)
      setError(null)

      try {
        const url = dependsOn ? `${apiUrl}?dependsOn=${dependsOn}` : apiUrl
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Handle different response formats
        let optionsArray: Option[] = []
        if (Array.isArray(data)) {
          optionsArray = data
        } else if (data.data && Array.isArray(data.data)) {
          optionsArray = data.data
        } else if (data.items && Array.isArray(data.items)) {
          optionsArray = data.items
        } else {
          console.warn("Unexpected API response format:", data)
          optionsArray = []
        }

        optionsArray = optionsArray.filter(
          (opt, idx, arr) => arr.findIndex((o) => o.id === opt.id) === idx
        )

        setOptions(optionsArray)
      } catch (err) {
        console.error("Error fetching options:", err)
        setError(err instanceof Error ? err.message : "Błąd podczas ładowania opcji")
        setOptions([])
      } finally {
        setLoading(false)
      }
    }

    // Resetuj opcje gdy dependsOn się zmienia
    if (dependsOn) {
      setOptions([])
      fetchOptions()
    } else if (!dependsOn && apiUrl) {
      fetchOptions()
    }
  }, [apiUrl, dependsOn])

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || loading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {loading && (
          <div className="flex items-center justify-center py-2 px-3 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Ładowanie...
          </div>
        )}

        {error && (
          <div className="flex items-center py-2 px-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        {!loading && !error && options.length === 0 && dependsOn && (
          <div className="py-2 px-3 text-sm text-gray-500">Brak dostępnych opcji dla wybranego ryzyka</div>
        )}

        {!loading && !error && options.length === 0 && !dependsOn && (
          <div className="py-2 px-3 text-sm text-gray-500">Najpierw wybierz ryzyko szkody</div>
        )}

        {!loading &&
          !error &&
          options.length > 0 &&
          options.map((option) => (
            <SelectItem key={option.id} value={option.code ?? option.id}>
              {option.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  )
}
