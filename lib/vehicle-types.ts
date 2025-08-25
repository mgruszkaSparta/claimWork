import type { VehicleType } from "@/types/vehicle-type"
import { API_BASE_URL } from "./api"
import { authFetch } from "./auth-fetch"

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


      const response = await authFetch(url, {
        method: "GET",

      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
            ? data.items
            : []

      return items
        .filter((type: any) => type.isActive)
        .map((type: any) => ({
          id: type.id,
          code: type.code,
          name: type.name,
          label: type.label ?? type.name,
          value: type.value ?? type.code,
          isActive: type.isActive,
        }))
    } catch (error) {
      console.error("Error fetching vehicle types:", error)
      return []
    }
  },

  async getVehicleTypeById(id: string): Promise<VehicleType | null> {
    try {

      const response = await authFetch(`${VEHICLE_TYPES_URL}/${id}`, {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const item = data?.data || data?.item || data

      if (item) {
        return {
          id: item.id,
          code: item.code,
          name: item.name,
          label: item.label ?? item.name,
          value: item.value ?? item.code,
          isActive: item.isActive,
        }
      }

      return null
    } catch (error) {
      console.error("Error fetching vehicle type by ID:", error)
      return null
    }
  },
}
