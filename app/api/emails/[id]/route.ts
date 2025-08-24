import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const emailId = params.id
    const cookie = request.headers.get("cookie") ?? ""

    const response = await fetch(`${API_BASE_URL}/emails/${emailId}`, {
      cache: "no-store",
      credentials: "include",
      headers: { Cookie: cookie },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const email = await response.json()
    return NextResponse.json(email)
  } catch (error) {
    console.error("Error fetching email:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch email" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const emailId = params.id
    const cookie = request.headers.get("cookie") ?? ""

    const response = await fetch(`${API_BASE_URL}/emails/${emailId}`, {
      method: "DELETE",
      credentials: "include",
      headers: { Cookie: cookie },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error deleting email:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete email" },
      { status: 500 },
    )
  }
}
