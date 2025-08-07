import { type NextRequest, NextResponse } from "next/server"
import { repairDetails } from "@/lib/repair-details-store"
import type { RepairDetail } from "@/lib/repair-details-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const detail = repairDetails.find((d) => d.id === params.id)

    if (!detail) {
      return NextResponse.json({ error: "Repair detail not found" }, { status: 404 })
    }

    return NextResponse.json(detail)
  } catch (error) {
    console.error("Error fetching repair detail:", error)
    return NextResponse.json({ error: "Failed to fetch repair detail" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const index = repairDetails.findIndex((d) => d.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Repair detail not found" }, { status: 404 })
    }

    const updatedDetail: RepairDetail = {
      ...repairDetails[index],
      ...body,
      updatedAt: new Date().toISOString(),
    }

    repairDetails[index] = updatedDetail

    return NextResponse.json(updatedDetail)
  } catch (error) {
    console.error("Error updating repair detail:", error)
    return NextResponse.json({ error: "Failed to update repair detail" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const index = repairDetails.findIndex((d) => d.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Repair detail not found" }, { status: 404 })
    }

    repairDetails.splice(index, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting repair detail:", error)
    return NextResponse.json({ error: "Failed to delete repair detail" }, { status: 500 })
  }
}
