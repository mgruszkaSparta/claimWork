import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const attachmentId = params.id
    const auth = request.headers.get("authorization") ?? ""

    const response = await fetch(`${API_BASE_URL}/emails/attachment/${attachmentId}`, {
      headers: { Authorization: auth },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return new NextResponse(errorBody, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("content-type") || "text/plain",
        },
      })
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream"
    const contentDisposition = response.headers.get("content-disposition") || "attachment"

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    })
  } catch (error) {
    console.error("Error downloading attachment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
