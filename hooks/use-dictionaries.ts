import { useState, useEffect } from 'react'
import { dictionaryService, type DictionaryItem } from '@/lib/dictionary-service'

export function useDictionary(type: string) {
  const [data, setData] = useState<DictionaryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await dictionaryService.getDictionary(type)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [type])

  return { data, loading, error, refetch: () => fetchData() }
}

// Specific hooks for each dictionary type
export function useCaseHandlers() {
  return useDictionary('case-handlers')
}

export function useCountries() {
  return useDictionary('countries')
}

export function useCurrencies() {
  return useDictionary('currencies')
}

export function useInsuranceCompanies() {
  return useDictionary('insurance-companies')
}

export function useLeasingCompanies() {
  return useDictionary('leasing-companies')
}

export function useVehicleTypes() {
  return useDictionary('vehicle-types')
}

export function useClaimStatuses() {
  return useDictionary('claim-statuses')
}

export function useDamageStatuses() {
  return useDictionary('damage-statuses')
}

export function usePriorities() {
  return useDictionary('priorities')
}

export function useEventStatuses() {
  return useDictionary('event-statuses')
}

export function usePaymentMethods() {
  return useDictionary('payment-methods')
}

export function useContractTypes() {
  return useDictionary('contract-types')
}

export function useDocumentStatuses() {
  return useDictionary('document-statuses')
}
