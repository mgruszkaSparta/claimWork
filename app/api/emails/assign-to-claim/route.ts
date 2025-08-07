import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { emailId, claimId } = await request.json()

    // Mock implementation - replace with actual backend API call
    console.log("Assigning email to claim:", { emailId, claimId })

    return NextResponse.json({ success: true, message: "Email assigned to claim successfully" })
  } catch (error) {
    console.error("Error assigning email to claim:", error)
    return NextResponse.json({ error: "Failed to assign email to claim" }, { status: 500 })
  }
}
