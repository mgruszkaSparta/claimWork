import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/documents/${params.id}/download`, {
      method: "GET",
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Backend API error: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    // Get the file data and headers from the backend
    const fileData = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "application/octet-stream"
    const contentDisposition = response.headers.get("content-disposition")

    // Create response with the file data
    const fileResponse = new NextResponse(fileData)
    fileResponse.headers.set("Content-Type", contentType)

    if (contentDisposition) {
      fileResponse.headers.set("Content-Disposition", contentDisposition)
    }

    return fileResponse
  } catch (error) {
    console.error("Error downloading document:", error)
    return NextResponse.json(
      { error: "Failed to download document", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
