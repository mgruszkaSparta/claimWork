"use client"

import useSWR from "swr"
import { getJson } from "@/lib/api"
import type { Handler } from "@/types/handler"

type DictionaryItemDto = {
  id: string
  name: string
  code?: string
  isActive?: boolean
}

type DictionaryResponseDto = {
  items: DictionaryItemDto[]
  totalCount: number
  category: string
}

const fetchCaseHandlers = async (): Promise<Handler[]> => {
  const data = await getJson<DictionaryResponseDto>("/api/dictionaries/case-handlers")
  return (data.items || []).map((it) => ({
    id: it.id,
    name: it.name,
    code: it.code,
    isActive: it.isActive,
  }))
}

export function useCaseHandlers() {
  const { data, error, isLoading, mutate } = useSWR<Handler[]>(
    "case-handlers",
    fetchCaseHandlers,
    {
      dedupingInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
    },
  )

  return {
    handlers: data ?? [],
    loading: isLoading,
    error: error as Error | undefined,
    refresh: () => mutate(),
  }
}
