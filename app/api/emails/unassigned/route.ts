import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(_request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/emails/unassigned`, {
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const unassignedEmails = await response.json()
    return NextResponse.json(unassignedEmails)
  } catch (error) {
    console.error("Error fetching unassigned emails:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch unassigned emails",
      },
      { status: 500 },
    )
  }
}
