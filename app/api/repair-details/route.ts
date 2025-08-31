import { type NextRequest, NextResponse } from "next/server"
import { repairDetails } from "@/lib/repair-details-store"
import type { RepairDetail } from "@/lib/repair-details-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId") || searchParams.get("claimId")

    let filteredDetails = repairDetails

    if (eventId) {
      filteredDetails = repairDetails.filter((detail) => detail.eventId === eventId)
    }

    return NextResponse.json(filteredDetails)
  } catch (error) {
    console.error("Error fetching repair details:", error)
    return NextResponse.json({ error: "Failed to fetch repair details" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const eventId = body.eventId || body.claimId

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 },
      )
    }

    const newRepairDetail: RepairDetail = {
      id: Math.random().toString(36).substr(2, 9),
      eventId,
      branchId: body.branchId || "",
      employeeEmail: body.employeeEmail || "",
      replacementVehicleRequired: body.replacementVehicleRequired || false,
      replacementVehicleInfo: body.replacementVehicleInfo || "",
      vehicleTabNumber: body.vehicleTabNumber,
      vehicleRegistration: body.vehicleRegistration,
      damageDateTime: body.damageDateTime || "",
      appraiserWaitingDate: body.appraiserWaitingDate || "",
      repairStartDate: body.repairStartDate || "",
      repairEndDate: body.repairEndDate || "",
      otherVehiclesAvailable: body.otherVehiclesAvailable || false,
      otherVehiclesInfo: body.otherVehiclesInfo || "",
      bodyworkHours: body.bodyworkHours || 0,
      paintingHours: body.paintingHours || 0,
      assemblyHours: body.assemblyHours || 0,
      otherWorkHours: body.otherWorkHours || 0,
      otherWorkDescription: body.otherWorkDescription || "",
      damageDescription: body.damageDescription || "",
      additionalDescription: body.additionalDescription || "",
      status: body.status || "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    repairDetails.push(newRepairDetail)

    return NextResponse.json(newRepairDetail, { status: 201 })
  } catch (error) {
    console.error("Error creating repair detail:", error)
    return NextResponse.json({ error: "Failed to create repair detail" }, { status: 500 })
  }
}
