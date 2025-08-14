import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const claimObjectTypeId = searchParams.get("claimObjectTypeId") || ""
    const url = `${API_BASE_URL}/risk-types?claimObjectTypeId=${encodeURIComponent(claimObjectTypeId)}`

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in risk-types API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch risk types",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

