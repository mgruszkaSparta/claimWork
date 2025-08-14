import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    const url = new URL(`${API_BASE_URL}/claims`)
    url.searchParams.set("page", "1")
    url.searchParams.set("pageSize", "50")
    if (search) {
      url.searchParams.set("search", search)
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()
    const items = Array.isArray(data) ? data : data.items || []

    const options = items.map((claim: any) => ({
      value: claim.id?.toString(),
      label: claim.claimNumber || claim.id?.toString(),
    }))

    return NextResponse.json(options)
  } catch (error) {
    console.error("Error fetching claim options:", error)
    return NextResponse.json(
      { error: "Failed to fetch claim options" },
      { status: 500 },
    )
  }
}
