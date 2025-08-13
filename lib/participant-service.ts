import { api } from './api'

export interface ParticipantType {
  id: string
  name: string
}

export interface Country {
  id: string
  displayName: string
}

export interface LegalPersonality {
  id: string
  name: string
}

export interface ClaimParticipant {
  id?: string
  participantTypeIds: string[]
  legalPersonalityId: string
  name?: string
  firstName?: string
  surname?: string
  taxId?: string
  croId?: string
  personalId?: string
  citizenshipId?: string
  countryId?: string
  city?: string
  postalCode?: string
  street?: string
  houseNumber?: string
  flatNumber?: string
  phone?: string
  email?: string
  onlyEmailCorrespondence: boolean
  description?: string
}

export enum LegalPersonalityEnum {
  NaturalPerson = '1',
  LegalPerson = '2',
  NaturalPersonCivil = '3'
}

export enum SearchCriteriaEnum {
  TaxId = 'TaxId',
  CrnId = 'CrnId',
  PersonalId = 'PersonalId'
}

export class ParticipantService {
  static async getParticipantTypes(): Promise<ParticipantType[]> {
    const response = await api.get('/participant-types')
    return response.data
  }

  static async getCountries(): Promise<Country[]> {
    const response = await api.get('/countries')
    return response.data
  }

  static async getLegalPersonalities(): Promise<LegalPersonality[]> {
    const response = await api.get('/legal-personalities')
    return response.data
  }

  static async getParticipantByTaxId(
    taxId: string,
    customerGroupId: string,
    countryId: string,
    searchCriteria: SearchCriteriaEnum
  ): Promise<ClaimParticipant | null> {
    try {
      const response = await api.get(
        `/participants/search?taxId=${taxId}&customerGroupId=${customerGroupId}&countryId=${countryId}&searchCriteria=${searchCriteria}`
      )
      return response.data
    } catch (error) {
      return null
    }
  }

  static async getParticipantByNumberId(
    numberId: string,
    countryId: string,
    searchCriteria: SearchCriteriaEnum
  ): Promise<ClaimParticipant | null> {
    try {
      const response = await api.get(
        `/participants/search-by-number?numberId=${numberId}&countryId=${countryId}&searchCriteria=${searchCriteria}`
      )
      return response.data
    } catch (error) {
      return null
    }
  }
}
