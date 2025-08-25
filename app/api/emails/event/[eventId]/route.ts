import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } },
) {
  try {
    const cookie = request.headers.get("cookie") ?? ""
    const folder = request.nextUrl.searchParams.get("folder")
    if (!folder) {
      return NextResponse.json(
        { error: "Folder query parameter is required" },
        { status: 400 },
      )
    }
    const url = new URL(`${API_BASE_URL}/emails/event/${params.eventId}`)
    url.searchParams.set("folder", folder)
    const response = await fetch(url.toString(), {
      cache: "no-store",
      credentials: "include",
      headers: { Cookie: cookie },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const emails = await response.json()
    return NextResponse.json(emails)
  } catch (error) {
    console.error("Error fetching emails by event:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch emails by event",
      },
      { status: 500 },
    )
  }
}
