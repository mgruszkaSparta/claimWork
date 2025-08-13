import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const response = await fetch(`${API_BASE_URL}/client-claims/${id}/preview`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error previewing client claim document:", errorText)
      return NextResponse.json(
        { error: "Failed to preview document", details: errorText },
        { status: response.status },
      )
    }

    const headers = new Headers()
    headers.set(
      "Content-Type",
      response.headers.get("Content-Type") || "application/pdf",
    )
    headers.set(
      "Content-Disposition",
      response.headers.get("Content-Disposition") || "inline",
    )

    return new NextResponse(response.body, { headers })
  } catch (error) {
    console.error("Error previewing client claim document:", error)
    return NextResponse.json({ error: "Failed to preview document" }, { status: 500 })
  }
}
