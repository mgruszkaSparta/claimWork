import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!

export async function GET(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/claims/${params.claimId}/decisions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json(
        { error: "Failed to fetch decisions", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching decisions:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { claimId: string } }) {
  try {
    const formData = await request.formData()

    const response = await fetch(`${API_BASE_URL}/claims/${params.claimId}/decisions`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json(
        { error: "Failed to create decision", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating decision:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
