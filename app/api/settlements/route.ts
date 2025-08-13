import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"
const RETRY_COUNT = Number(process.env.FETCH_RETRY_COUNT || "1")

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = RETRY_COUNT,
): Promise<Response> {
  let lastError: unknown
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options)
      console.log(
        `Fetch attempt ${attempt} to ${url} returned status ${response.status}`,
      )
      return response
    } catch (error) {
      console.error(`Fetch attempt ${attempt} failed:`, error)
      lastError = error
    }
  }

  throw lastError
}

export async function GET(request: NextRequest) {
  if (!API_BASE_URL) {
    console.error("API_BASE_URL is not configured")
    return NextResponse.json(
      { error: "Backend URL is not configured" },
      { status: 500 },
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId") || searchParams.get("claimId")

    let url = `${API_BASE_URL}/settlements`
    if (eventId) {
      url += `?eventId=${eventId}`
    }

    const response = await fetchWithRetry(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Backend error:", errorData)
      return NextResponse.json(
        { error: "Failed to fetch settlements", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching settlements:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  if (!API_BASE_URL) {
    console.error("API_BASE_URL is not configured")
    return NextResponse.json(
      { error: "Backend URL is not configured" },
      { status: 500 },
    )
  }

  try {
    const formData = await request.formData()

    const eventId = (formData.get("eventId") as string | null) || (formData.get("claimId") as string | null)
    if (eventId) {
      formData.set("eventId", eventId)
      formData.delete("claimId")
    }

    const response = await fetchWithRetry(`${API_BASE_URL}/settlements`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Backend error:", errorData)
      return NextResponse.json(
        { error: "Failed to create settlement", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating settlement:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
