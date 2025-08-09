import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest) {
  try {
      const { searchParams } = new URL(request.url)
      const eventId = searchParams.get("eventId") || searchParams.get("claimId")

      if (!eventId) {
        return NextResponse.json({ error: "EventId is required" }, { status: 400 })
      }

      const url = `${API_BASE_URL}/decisions?eventId=${eventId}`


    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json(
        { error: "Failed to fetch decisions", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error("Error fetching decisions:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const eventId = (formData.get("eventId") as string | null) || (formData.get("claimId") as string | null)
    if (eventId) {
      formData.set("eventId", eventId)
      formData.delete("claimId")
    }

    const response = await fetch(`${API_BASE_URL}/decisions`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json(
        { error: "Failed to create decision", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating decision:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

