import { type NextRequest, NextResponse } from "next/server"
import { mockRecourses } from "../route"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "EventId is required" }, { status: 400 })
    }

    const total = mockRecourses
      .filter((r) => r.eventId === eventId)
      .reduce((sum, r) => sum + (r.amount ?? 0), 0)

    return NextResponse.json(total)
  } catch (error) {
    console.error("Error fetching total recourse amount:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
