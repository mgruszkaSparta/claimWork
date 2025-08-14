import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const emailId = params.id

    const response = await fetch(`${API_BASE_URL}/emails/${emailId}/read`, {
      method: "POST",
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error marking email as read:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to mark email as read" },
      { status: 500 },
    )
  }
}
