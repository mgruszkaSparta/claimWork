import type { DriverInfo, ParticipantInfo, Claim } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

// Handler details for claim handlers
export const handlerDetails: Record<string, { email: string; phone: string }> = {
  "Marcin Małuj": { email: "marcin.maluj@spartabrokers.pl", phone: "600 111 222" },
  "Małgorzata Roczniak": { email: "malgorzata.roczniak@spartabrokers.pl", phone: "600 222 333" },
  "Piotr Raniecki": { email: "piotr.raniecki@spartabrokers.pl", phone: "600 333 355" },
  "Joanna Romanowska": { email: "joanna.romanowska@spartabrokers.pl", phone: "600 444 555" },
  "Paweł Gułaj": { email: "pawel.gulaj@spartabrokers.pl", phone: "600 555 666" },
  "Kamila Szepit": { email: "kamila.szepit@spartabrokers.pl", phone: "600 666 777" },
  "Jacek Kamiński": { email: "jacek.kaminski@spartabrokers.pl", phone: "600 777 888" },
  "Edyta Dyczkowska": { email: "edyta.dyczkowska@spartabrokers.pl", phone: "600 888 999" },
  "Ireneusz Osiński": { email: "ireneusz.osinski@spartabrokers.pl", phone: "600 999 000" },
  "Kinga Tuzimek": { email: "kinga.tuzimek@spartabrokers.pl", phone: "600 000 111" },
}

// Empty driver template
export const emptyDriver: DriverInfo = {
  id: "",
  name: "",
  licenseNumber: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
  country: "PL",
  personalId: "",
  role: "kierowca",
}

// Empty participant template
export const emptyParticipant: Omit<ParticipantInfo, "drivers"> = {
  id: "",
  name: "",
  address: "",
  city: "",
  postalCode: "",
  country: "PL",
  phone: "",
  email: "",
  vehicleRegistration: "",
  vehicleBrand: "",
  vehicleModel: "",
  vehicleVin: "",
  vehicleType: "",
  policyNumber: "",
  policyDealDate: "",
  policyStartDate: "",
  policyEndDate: "",
  insuranceCompany: "",
  firstName: "",
  lastName: "",
  personalId: "",
  inspectionContactName: "",
  inspectionContactPhone: "",
  inspectionContactEmail: "",
}

// Initial claim form data
export const initialClaimFormData: Partial<Claim> = {
  vehicleNumber: "",
  brand: "",
  owner: "",
  insuranceCompany: "",
  insuranceCompanyId: "",
  policyNumber: "",
  claimNumber: "",
  spartaNumber: "",
  status: "NEW",
  damageDate: "",
  totalClaim: 0,
  payout: 0,
  currency: "PLN",
  riskType: "",
  damageType: "",
  liquidator: "",
  client: "",
  clientId: "",
  handler: "",
  handlerId: "",
  handlerEmail: "",
  handlerPhone: "",
  leasingCompany: "",
  leasingCompanyId: "",
  description: "",
  subcontractor: {
    subcontractorName: "",
    subcontractorPolicyNumber: "",
    subcontractorInsurer: "",
    complaintToSubcontractor: false,
    complaintToSubcontractorDate: "",
    claimFromSubcontractorPolicy: false,
    claimFromSubcontractorPolicyDate: "",
    complaintResponse: false,
    complaintResponseDate: "",
  },
  perpetrator: {
    ...emptyParticipant,
    drivers: [{ ...emptyDriver }],
  },
  injuredParty: {
    ...emptyParticipant,
    drivers: [{ ...emptyDriver }],
  },
  otherParticipants: [],
}

// Status options for claims
export const CLAIM_STATUSES = [
  { value: "NEW", label: "Nowa", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "IN_PROGRESS", label: "W trakcie", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "PENDING_REVIEW", label: "Oczekuje na przegląd", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "APPROVED", label: "Zatwierdzona", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "REJECTED", label: "Odrzucona", color: "bg-red-100 text-red-800 border-red-200" },
  { value: "CLOSED", label: "Zamknięta", color: "bg-gray-100 text-gray-800 border-gray-200" },
]

// Priority levels
export const PRIORITIES = [
  { value: "LOW", label: "Niski", color: "bg-gray-100 text-gray-800" },
  { value: "MEDIUM", label: "Średni", color: "bg-yellow-100 text-yellow-800" },
  { value: "HIGH", label: "Wysoki", color: "bg-orange-100 text-orange-800" },
  { value: "URGENT", label: "Pilny", color: "bg-red-100 text-red-800" },
]

// Vehicle types
export const VEHICLE_TYPES = [
  { value: "CAR", label: "Samochód osobowy" },
  { value: "TRUCK", label: "Ciężarówka" },
  { value: "TRACTOR", label: "Ciągnik" },
  { value: "MOTORCYCLE", label: "Motocykl" },
  { value: "BUS", label: "Autobus" },
  { value: "VAN", label: "Van" },
  { value: "TRAILER", label: "Przyczepa" },
]

// Damage types
export const DAMAGE_TYPES = [
  "Kolizja",
  "Wypadek",
  "Kradzież",
  "Wandalizm",
  "Żywioły",
  "Pożar",
  "Grad",
  "Powódź",
  "Uszkodzenie parkingowe",
  "Inne",
] as const

// Currency options
export const CURRENCIES = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "PLN", label: "PLN" },
]

// Countries
export const COUNTRIES = [
  { value: "US", label: "Stany Zjednoczone" },
  { value: "GB", label: "Wielka Brytania" },
  { value: "DE", label: "Niemcy" },
  { value: "FR", label: "Francja" },
  { value: "IT", label: "Włochy" },
  { value: "PL", label: "Polska" },
  { value: "ES", label: "Hiszpania" },
  { value: "NL", label: "Holandia" },
  { value: "BE", label: "Belgia" },
  { value: "AT", label: "Austria" },
  { value: "CH", label: "Szwajcaria" },
  { value: "CZ", label: "Czechy" },
  { value: "SK", label: "Słowacja" },
  { value: "HU", label: "Węgry" },
]

// Insurance companies
export const INSURANCE_COMPANIES = [
  { value: "1", label: "PZU" },
  { value: "2", label: "Warta" },
  { value: "3", label: "Allianz" },
  { value: "4", label: "Generali" },
  { value: "5", label: "AXA" },
  { value: "6", label: "Ergo Hestia" },
  { value: "7", label: "Compensa" },
  { value: "8", label: "Uniqa" },
]

// Leasing companies
export const LEASING_COMPANIES = [
  { value: "1", label: "PKO Leasing" },
  { value: "2", label: "Pekao Leasing" },
  { value: "3", label: "mLeasing" },
  { value: "4", label: "ING Lease" },
  { value: "5", label: "Santander Leasing" },
  { value: "6", label: "BNP Paribas Leasing" },
]

// Risk types
export const RISK_TYPES = [
  { value: "177", label: "AC - Autocasco" },
  { value: "178", label: "OC - Odpowiedzialność Cywilna" },
  { value: "179", label: "NNW - Następstwa Nieszczęśliwych Wypadków" },
  { value: "180", label: "ASSISTANCE - Pomoc drogowa" },
]

// Event statuses
export const EVENT_STATUSES = [
  { value: "OPEN", label: "Otwarte", color: "bg-green-100 text-green-800" },
  { value: "IN_PROGRESS", label: "W trakcie", color: "bg-yellow-100 text-yellow-800" },
  { value: "CLOSED", label: "Zamknięte", color: "bg-gray-100 text-gray-800" },
  { value: "CANCELLED", label: "Anulowane", color: "bg-red-100 text-red-800" },
]

// API endpoints
export const API_ENDPOINTS = {
  EVENTS: `${API_BASE_URL}/claims`,
  DAMAGES: `${API_BASE_URL}/damages`,
  DAMAGES_INIT: `${API_BASE_URL}/damages/init`,
  DOCUMENTS: `${API_BASE_URL}/documents`,
  CLIENTS: `${API_BASE_URL}/clients`,
  RISK_TYPES: `${API_BASE_URL}/dictionaries/risk-types`,
  DAMAGE_TYPES: `${API_BASE_URL}/damage-types`,
  COUNTRIES: `${API_BASE_URL}/countries`,
  CURRENCIES: `${API_BASE_URL}/currencies`,
  INSURANCE_COMPANIES: `${API_BASE_URL}/insurance-companies`,
  LEASING_COMPANIES: `${API_BASE_URL}/leasing-companies`,
  CLAIM_STATUSES: `${API_BASE_URL}/claim-statuses`,
  VEHICLE_TYPES: `${API_BASE_URL}/vehicle-types`,
  PRIORITIES: `${API_BASE_URL}/priorities`,
  EVENT_STATUSES: `${API_BASE_URL}/event-statuses`,
}

// Utility functions
export const getStatusColor = (statusCode: string) => {
  const status = CLAIM_STATUSES.find((s) => s.value === statusCode)
  return status?.color || "bg-gray-100 text-gray-800 border-gray-200"
}

export const getPriorityColor = (priorityCode: string) => {
  const priority = PRIORITIES.find((p) => p.value === priorityCode)
  return priority?.color || "bg-gray-100 text-gray-800"
}

export const getEventStatusColor = (statusCode: string) => {
  const status = EVENT_STATUSES.find((s) => s.value === statusCode)
  return status?.color || "bg-gray-100 text-gray-800"
}

export const generateId = () => Math.random().toString(36).substr(2, 9)

// Helper function to get label by value
export const getLabelByValue = (items: Array<{ value: string; label: string }>, value: string): string => {
  const item = items.find((i) => i.value === value)
  return item?.label || value
}
