import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5200/api"

export async function GET() {
  try {
    console.log(`Fetching events from backend: ${API_BASE_URL}/events`)

    const response = await fetch(`${API_BASE_URL}/events`, {
      headers: {
        "Content-Type": "application/json",
      },
      // Add cache control to prevent caching issues
      cache: "no-store",
    })

    console.log(`Backend response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend API error: ${response.status} - ${errorText}`)
      return NextResponse.json({ error: `Backend API error: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    console.log(`Received ${data.length} events from backend`)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Events API error:", error)
    return NextResponse.json({ error: "Failed to fetch events from backend" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Creating new event:", body)

    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend API error: ${response.status} - ${errorText}`)
      return NextResponse.json({ error: `Backend API error: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    console.log("Event created successfully:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Create event API error:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
