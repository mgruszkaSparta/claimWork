
'use client'

import useSWR from 'swr'
import type { DictionaryResponseDto } from '@/lib/dictionary-service'

interface Handler {
  id: string
  name: string
  code?: string
  isActive: boolean
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  return (await response.json()) as T
}

async function fetchCaseHandlers(): Promise<Handler[]> {
  const data = await getJson<DictionaryResponseDto>('/api/dictionaries/case-handlers')
  return data.items.map(({ id, name, code, isActive }) => ({
    id,
    name,
    code,
    isActive,

  }))
}

export function useCaseHandlers() {

  const { data, error, isLoading, mutate } = useSWR(
    'case-handlers',
    fetchCaseHandlers,
    {
      dedupingInterval: 5 * 60_000,

      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
    },
  )


  return { handlers: data ?? [], loading: isLoading, error, refresh: mutate }
}


