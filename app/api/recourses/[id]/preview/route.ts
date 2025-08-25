import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/recourses/${params.id}/preview`,
      {
        headers: {
          authorization: request.headers.get("authorization") ?? "",
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: "Failed to preview recourse", details: errorText },
        { status: response.status },
      )
    }

    const headers = new Headers()
    headers.set(
      "Content-Type",
      response.headers.get("content-type") || "application/octet-stream",
    )
    headers.set(
      "Content-Disposition",
      response.headers.get("content-disposition") || "inline",
    )

    return new NextResponse(response.body, { headers })
  } catch (error) {
    console.error("Error previewing recourse file:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
