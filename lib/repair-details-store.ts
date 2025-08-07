export interface RepairDetail {
  id: string
  eventId: string
  branchId: string
  employeeEmail: string
  replacementVehicleRequired: boolean
  replacementVehicleInfo: string
  vehicleTabNumber: string
  vehicleRegistration: string
  damageDateTime: string
  appraiserWaitingDate: string
  repairStartDate: string
  repairEndDate: string
  otherVehiclesAvailable: boolean
  otherVehiclesInfo: string
  bodyworkHours: number
  paintingHours: number
  assemblyHours: number
  otherWorkHours: number
  otherWorkDescription: string
  damageDescription: string
  additionalDescription: string
  status: "draft" | "in-progress" | "completed"
  createdAt: string
  updatedAt: string
}

// In-memory storage for demo purposes. This will be shared across API routes.
export const repairDetails: RepairDetail[] = []
