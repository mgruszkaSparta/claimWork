import type { VehicleType, VehicleTypeResponse } from "@/types/vehicle-type"
import { API_ENDPOINTS } from "@/lib/constants"

const VEHICLE_TYPES_URL = API_ENDPOINTS.VEHICLE_TYPES

export const vehicleTypeService = {
  async getVehicleTypes(): Promise<VehicleType[]> {
    try {
      const response = await fetch(VEHICLE_TYPES_URL)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: VehicleTypeResponse = await response.json()

      if (data.success && Array.isArray(data.data)) {
        return data.data.filter((type) => type.isActive)
      }

      return []
    } catch (error) {
      console.error("Error fetching vehicle types:", error)
      return []
    }
  },

  async getVehicleTypeById(id: string): Promise<VehicleType | null> {
    try {
      const response = await fetch(`${VEHICLE_TYPES_URL}/${id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data) {
        return data.data
      }

      return null
    } catch (error) {
      console.error("Error fetching vehicle type by ID:", error)
      return null
    }
  },
}
