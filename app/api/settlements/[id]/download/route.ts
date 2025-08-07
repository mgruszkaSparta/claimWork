import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settlements/${params.id}/download`, {
      method: "GET",
    })

    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json({ error: "Failed to download file", details: errorData }, { status: response.status })
    }

    const blob = await response.blob()
    const contentType = response.headers.get("content-type") || "application/octet-stream"
    const contentDisposition = response.headers.get("content-disposition")

    const headers = new Headers()
    headers.set("Content-Type", contentType)
    if (contentDisposition) {
      headers.set("Content-Disposition", contentDisposition)
    }

    return new NextResponse(blob, { headers })
  } catch (error) {
    console.error("Error downloading settlement file:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
