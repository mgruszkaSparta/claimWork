import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function POST(request: NextRequest) {
  try {
    const { emailId, claimId } = await request.json()

    const response = await fetch(`${API_BASE_URL}/emails/assign-to-claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailId, claimId }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error assigning email to claim:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to assign email to claim",
      },
      { status: 500 },
    )
  }
}
