"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "@/hooks/use-debounce"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, AlertCircle } from "lucide-react"

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
  riskTypeId?: number
  disabled?: boolean
  className?: string
}

export function DependentSelect({
  value,
  onValueChange,
  placeholder = "Wybierz opcję...",
  apiUrl,
  riskTypeId,
  disabled = false,
  className,
}: DependentSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 300)

  const fetchOptions = async (): Promise<Option[]> => {
    let url = apiUrl
    const params = new URLSearchParams()
    if (riskTypeId !== undefined) {
      params.set("riskTypeId", String(riskTypeId))
    }
    if (debouncedSearch) {
      params.set("search", debouncedSearch)
    }
    const query = params.toString()
    if (query) {
      url += `?${query}`
    }

    const response = await fetch(url, {
      method: "GET",
      credentials: "omit",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    let optionsArray: Option[] = []
    if (Array.isArray(data)) {
      optionsArray = data
    } else if (data.data && Array.isArray(data.data)) {
      optionsArray = data.data
    } else if (data.items && Array.isArray(data.items)) {
      optionsArray = data.items
    }
    return optionsArray.filter(
      (opt, idx, arr) => arr.findIndex((o) => o.id === opt.id) === idx,
    )
  }

  const {
    data: options = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dependent-select", apiUrl, riskTypeId, debouncedSearch],
    queryFn: fetchOptions,
    enabled: riskTypeId !== undefined && (open || !!value),
  })

  useEffect(() => {
    setSearchTerm("")
  }, [riskTypeId])

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || riskTypeId === undefined}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input
            placeholder="Szukaj..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isLoading && (
          <div className="flex items-center justify-center py-2 px-3 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Ładowanie...
          </div>
        )}
        {isError && (
          <div className="flex items-center py-2 px-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            Błąd podczas ładowania opcji
          </div>
        )}
        {!isLoading && !isError && options.length === 0 && (
          <div className="py-2 px-3 text-sm text-gray-500">Brak danych</div>
        )}
        {!isLoading &&
          !isError &&
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
