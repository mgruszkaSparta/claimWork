import type { DriverInfo } from "@/types"

export interface DriverFormProps {
  driverData: DriverInfo
  onDriverChange: (field: keyof DriverInfo, value: any) => void
  onRemove: () => void
  isRemovable: boolean
}
