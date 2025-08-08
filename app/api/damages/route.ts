import { NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5200/api"

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/damages`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: `Backend API error: ${response.statusText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Damages API error:", error)
    return NextResponse.json({ error: "Failed to fetch damages" }, { status: 500 })
  }
}
