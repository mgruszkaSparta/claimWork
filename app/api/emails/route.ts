import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization") ?? ""
    const response = await fetch(`${API_BASE_URL}/emails`, {
      cache: "no-store",
      headers: { Authorization: auth },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const emails = await response.json()
    return NextResponse.json(emails)
  } catch (error) {
    console.error("Error fetching emails:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch emails" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const auth = request.headers.get("authorization") ?? ""

    const response = await fetch(`${API_BASE_URL}/emails`, {
      method: "POST",
      body: formData,
      headers: { Authorization: auth },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 },
    )
  }
}
