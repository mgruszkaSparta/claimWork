import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/recourses/${params.id}/download`,
      {
        headers: {
          authorization: request.headers.get("authorization") ?? "",
        },
      },
    )

    if (!response.ok || !response.body) {
      const errorText = await response.text().catch(() => "")
      return NextResponse.json(
        { error: "Failed to download recourse", details: errorText },
        { status: response.status },
      )
    }

    const headers = new Headers()
    response.headers.forEach((value, key) => headers.set(key, value))

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    })
  } catch (error) {
    console.error("Error downloading recourse file:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
