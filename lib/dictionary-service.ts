interface DictionaryItem {
  id: string
  code?: string
  name: string
  description?: string
  color?: string
  symbol?: string
  phone?: string
  email?: string
  address?: string
  sortOrder?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

class DictionaryService {
  private cache = new Map<string, { data: DictionaryItem[]; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private async fetchFromAPI(endpoint: string): Promise<DictionaryItem[]> {
    const response = await fetch(`/api/dictionaries/${endpoint}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}`)
    }
    return response.json()
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  async getDictionary(type: string): Promise<DictionaryItem[]> {
    const cached = this.cache.get(type)
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data
    }

    try {
      const data = await this.fetchFromAPI(type)
      this.cache.set(type, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error(`Error fetching dictionary ${type}:`, error)
      // Return cached data if available, even if expired
      if (cached) {
        return cached.data
      }
      throw error
    }
  }

  // Specific methods for each dictionary type
  async getCaseHandlers(): Promise<DictionaryItem[]> {
    return this.getDictionary('case-handlers')
  }

  async getCountries(): Promise<DictionaryItem[]> {
    return this.getDictionary('countries')
  }

  async getCurrencies(): Promise<DictionaryItem[]> {
    return this.getDictionary('currencies')
  }

  async getInsuranceCompanies(): Promise<DictionaryItem[]> {
    return this.getDictionary('insurance-companies')
  }

  async getLeasingCompanies(): Promise<DictionaryItem[]> {
    return this.getDictionary('leasing-companies')
  }

  async getVehicleTypes(): Promise<DictionaryItem[]> {
    return this.getDictionary('vehicle-types')
  }

  async getClaimStatuses(): Promise<DictionaryItem[]> {
    return this.getDictionary('claim-statuses')
  }

  async getDamageStatuses(): Promise<DictionaryItem[]> {
    return this.getDictionary('damage-statuses')
  }

  async getPriorities(): Promise<DictionaryItem[]> {
    return this.getDictionary('priorities')
  }

  async getEventStatuses(): Promise<DictionaryItem[]> {
    return this.getDictionary('event-statuses')
  }

  async getPaymentMethods(): Promise<DictionaryItem[]> {
    return this.getDictionary('payment-methods')
  }

  async getContractTypes(): Promise<DictionaryItem[]> {
    return this.getDictionary('contract-types')
  }

  async getDocumentStatuses(): Promise<DictionaryItem[]> {
    return this.getDictionary('document-statuses')
  }

  async getRiskTypes(): Promise<DictionaryItem[]> {
    return this.getDictionary('risk-types')
  }

  async getDamageTypesByRisk(riskType?: string): Promise<DictionaryItem[]> {
    const cacheKey = riskType ? `damage-types-${riskType}` : 'damage-types'
    const cached = this.cache.get(cacheKey)
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data
    }

    try {
      const endpoint = riskType ? `damage-types?riskType=${encodeURIComponent(riskType)}` : 'damage-types'
      const data = await this.fetchFromAPI(endpoint)
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error(`Error fetching damage types for risk ${riskType}:`, error)
      if (cached) {
        return cached.data
      }
      throw error
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  clearCacheForType(type: string): void {
    this.cache.delete(type)
  }
}

export const dictionaryService = new DictionaryService()
export type { DictionaryItem }
