
'use client'

import useSWR from 'swr'
import type { DictionaryResponseDto } from '@/lib/dictionary-service'
import { getJson } from '@/lib/api'

interface Handler {
  id: string
  name: string
  code?: string
  isActive: boolean
}

async function fetchCaseHandlers(): Promise<Handler[]> {
  const data = await getJson<DictionaryResponseDto>('/dictionaries/casehandlers')
  return data.items.map(({ id, name, code, isActive }) => ({
    id,
    name,
    code,
    isActive,

  }))
}

export function useCaseHandlers() {

  const { data, error, isLoading, mutate } = useSWR(
    'casehandlers',
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


