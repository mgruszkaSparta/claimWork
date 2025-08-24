import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(
  request: NextRequest,
  { params }: { params: { folder: string } },
) {
  try {
    const folder = params.folder
    const cookie = request.headers.get("cookie") ?? ""

    const response = await fetch(`${API_BASE_URL}/emails/folder/${folder}`, {
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
    console.error("Error fetching emails by folder:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch emails by folder",
      },
      { status: 500 },
    )
  }
}
