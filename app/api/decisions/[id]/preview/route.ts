import { type NextRequest, NextResponse } from "next/server"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const response = await fetch(`${API_BASE_URL}/decisions/${id}/preview`, {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    })

    if (!response.ok || !response.body) {
      throw new Error("Failed to preview file")
    }

    const headers = new Headers()
    response.headers.forEach((value, key) => {
      headers.set(key, value)
    })

    return new NextResponse(response.body, { status: response.status, headers })
  } catch (error) {
    console.error("Error previewing file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
