import type { VehicleType, VehicleTypeResponse } from "@/types/vehicle-type"
import { API_BASE_URL } from "./api"

const VEHICLE_TYPES_URL = `${API_BASE_URL}/dictionaries/vehicle-types`

export const vehicleTypeService = {
  async getVehicleTypes(search?: string): Promise<VehicleType[]> {
    try {
      const params = new URLSearchParams()
      if (search) {
        params.append("search", search)
      }

      const url = `${VEHICLE_TYPES_URL}${
        params.toString() ? `?${params.toString()}` : ""
      }`
      console.log("Fetching vehicle types from:", url)

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      })


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

      const response = await fetch(`${VEHICLE_TYPES_URL}/${id}`, {
        method: "GET",
        credentials: "include",
      })

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
