import { NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

if (API_BASE_URL.startsWith("/api")) {
  console.error("API_BASE_URL is misconfigured. It should be an absolute URL to the backend and not begin with '/api'.")
  throw new Error("Invalid API_BASE_URL configuration")
}

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
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Initialize damage API error:", error)
    return NextResponse.json({ error: "Failed to initialize damage" }, { status: 500 })
  }
}
