import type { VehicleType, VehicleTypeResponse } from "@/types/vehicle-type"

const API_BASE_URL = "/api/dictionaries/vehicle-types"

export const vehicleTypeService = {
  async getVehicleTypes(search?: string): Promise<VehicleType[]> {
    try {
      const params = new URLSearchParams()
      if (search) {
        params.append("search", search)
      }

      const url = `${API_BASE_URL}${params.toString() ? `?${params.toString()}` : ""}`
      console.log("Fetching vehicle types from:", url)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: VehicleTypeResponse = await response.json()
      console.log("Vehicle types response:", data)

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
      const response = await fetch(`${API_BASE_URL}/${id}`)

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
