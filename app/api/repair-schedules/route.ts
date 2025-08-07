import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5200/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    let url = `${API_BASE_URL}/repair-schedules`
    if (eventId) {
      url += `?eventId=${eventId}`
    }

    console.log(`Fetching repair schedules from backend: ${url}`)

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    console.log(`Backend response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend API error: ${response.status} - ${errorText}`)
      return NextResponse.json({ error: `Backend API error: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    console.log(`Received ${Array.isArray(data) ? data.length : "unknown"} repair schedules from backend`)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Repair schedules API error:", error)
    return NextResponse.json({ error: "Failed to fetch repair schedules from backend" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Creating new repair schedule:", body)

    const response = await fetch(`${API_BASE_URL}/repair-schedules`, {
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
    console.log("Repair schedule created successfully:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Create repair schedule API error:", error)
    return NextResponse.json({ error: "Failed to create repair schedule" }, { status: 500 })
  }
}
