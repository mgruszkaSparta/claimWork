interface DictionaryItemDto {
  id: string
  code?: string
  name: string
  description?: string
  color?: string
  symbol?: string
  phone?: string
  email?: string
  address?: string
  department?: string
  sortOrder?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface DictionaryResponseDto {
  items: DictionaryItemDto[]
  [key: string]: unknown
}

class DictionaryService {
  private cache = new Map<string, { data: DictionaryResponseDto; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private async fetchFromAPI(endpoint: string): Promise<DictionaryResponseDto> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/dictionaries/${endpoint}`,
      {
        method: "GET",
        credentials: "include",
      },
    )
    const text = await response.text()
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${text}`)
    }
    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`Malformed dictionary response for ${endpoint}: ${text}`)
    }
    if (
      !data ||
      typeof data !== "object" ||
      !Array.isArray((data as any).items)
    ) {
      throw new Error(`Malformed dictionary response for ${endpoint}`)
    }
    return data as DictionaryResponseDto
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  async getDictionary(type: string): Promise<DictionaryResponseDto> {
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
  async getCaseHandlers(): Promise<DictionaryResponseDto> {
    return this.getDictionary('case-handlers')
  }

  async getCountries(): Promise<DictionaryResponseDto> {
    return this.getDictionary('countries')
  }

  async getCurrencies(): Promise<DictionaryResponseDto> {
    return this.getDictionary('currencies')
  }

  async getInsuranceCompanies(): Promise<DictionaryResponseDto> {
    return this.getDictionary('insurance-companies')
  }

  async getLeasingCompanies(): Promise<DictionaryResponseDto> {
    return this.getDictionary('leasing-companies')
  }

  async getVehicleTypes(): Promise<DictionaryResponseDto> {
    return this.getDictionary('vehicle-types')
  }

  async getClaimStatuses(): Promise<DictionaryResponseDto> {
    return this.getDictionary('claim-statuses')
  }

  async getPriorities(): Promise<DictionaryResponseDto> {
    return this.getDictionary('priorities')
  }

  async getEventStatuses(): Promise<DictionaryResponseDto> {
    return this.getDictionary('event-statuses')
  }

  async getPaymentMethods(): Promise<DictionaryResponseDto> {
    return this.getDictionary('payment-methods')
  }

  async getContractTypes(): Promise<DictionaryResponseDto> {
    return this.getDictionary('contract-types')
  }

  async getDocumentStatuses(): Promise<DictionaryResponseDto> {
    return this.getDictionary('document-statuses')
  }

  async getRiskTypes(): Promise<DictionaryResponseDto> {
    return this.getDictionary('risk-types')
  }

  async getDamageTypesByRisk(riskType?: string): Promise<DictionaryResponseDto> {
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
export type { DictionaryItemDto, DictionaryResponseDto }
