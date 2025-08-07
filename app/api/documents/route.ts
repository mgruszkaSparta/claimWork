import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    console.log("Fetching documents with params:", queryString)

    const response = await fetch(`${API_BASE_URL}/api/documents?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("Backend API error:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)

      return NextResponse.json(
        { error: `Backend API error: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Documents fetched successfully:", data.length, "documents")

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch documents", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    console.log("Proxying document upload to backend API")

    const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      console.error("Backend upload error:", response.status, response.statusText)
      const errorText = await response.text()
      console.error("Error response:", errorText)

      return NextResponse.json(
        { error: `Backend upload error: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("Document uploaded successfully via backend")

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json(
      { error: "Failed to upload document", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
