import { NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:5200/api"

export async function POST() {
  try {
    const response = await fetch(`${API_BASE_URL}/damages/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: `Backend API error: ${errorText}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Initialize damage API error:", error)
    return NextResponse.json({ error: "Failed to initialize damage" }, { status: 500 })
  }
}
