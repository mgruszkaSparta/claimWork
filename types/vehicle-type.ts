export interface VehicleType {
  id: string
  code: string
  name: string
  label: string
  value: string
  isActive: boolean
}

export interface VehicleTypeSelectionEvent {
  vehicleTypeId: string
  vehicleTypeName: string
  vehicleTypeCode: string
}

export interface VehicleTypeResponse {
  success: boolean
  data: VehicleType[]
  total: number
  page: number
  limit: number
}
