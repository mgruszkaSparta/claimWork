import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5200/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.toString()
    const url = `${API_BASE_URL}/events${query ? `?${query}` : ""}`

    console.log(`Fetching claims from backend: ${url}`)

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend API error: ${response.status} - ${errorText}`)
      return NextResponse.json({ error: `Backend API error: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    const totalCountHeader = response.headers.get("X-Total-Count")
    const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : data.length

    return NextResponse.json({ items: data, totalCount })
  } catch (error) {
    console.error("Claims API error:", error)
    return NextResponse.json({ error: "Failed to fetch claims from backend" }, { status: 500 })
  }
}
