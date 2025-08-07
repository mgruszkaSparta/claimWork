import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const claimId = searchParams.get("claimId") || searchParams.get("eventId")

    if (!claimId) {
      return NextResponse.json({ error: "ClaimId is required" }, { status: 400 })
    }

    const url = new URL(`${API_BASE_URL}/api/recourses`)
    url.searchParams.set("claimId", claimId)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      console.error("Backend API error:", response.status, response.statusText)
      const message = await response.text()
      return NextResponse.json(
        { error: message || "Failed to fetch recourses" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching recourses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const claimId = formData.get("claimId") as string | null
    const filingDate = formData.get("filingDate") as string | null
    const insuranceCompany = formData.get("insuranceCompany") as string | null

    if (!claimId || !filingDate || !insuranceCompany) {
      return NextResponse.json(
        { error: "ClaimId, filingDate, and insuranceCompany are required" },
        { status: 400 },
      )
    }

    const response = await fetch(`${API_BASE_URL}/api/recourses`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      console.error("Backend API error:", response.status, response.statusText)
      const message = await response.text()
      return NextResponse.json(
        { error: message || "Failed to create recourse" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating recourse:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

