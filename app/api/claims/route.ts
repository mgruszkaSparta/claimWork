import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5200/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.toString()
    const url = `${API_BASE_URL}/claims${query ? `?${query}` : ""}`

    console.log(`Fetching claims from backend: ${url}`)

    // Retrieve auth token from cookies (adjust cookie name as needed)
    const token = request.cookies.get("token")?.value

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // Include cookies for session-based authentication
      credentials: "include",
      cache: "no-store",
    })

    if (response.status === 401) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

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
