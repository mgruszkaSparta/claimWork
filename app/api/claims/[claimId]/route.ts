import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(
  request: NextRequest,
  { params }: { params: { claimId: string } },
) {
  try {
    const { claimId } = params
    console.log(`Fetching claim ${claimId} from backend`)

    const auth = request.headers.get("authorization") ?? ""

    const response = await fetch(`${API_BASE_URL}/claims/${claimId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend API error: ${response.status} - ${errorText}`)
      return NextResponse.json(
        { error: `Backend API error: ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Get claim API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch claim" },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { claimId: string } },
) {
  try {
    const { claimId } = params
    const body = await request.json()
    console.log(`Updating claim ${claimId}:`, body)

    const auth = request.headers.get("authorization") ?? ""

    const response = await fetch(`${API_BASE_URL}/claims/${claimId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend API error: ${response.status} - ${errorText}`)
      return NextResponse.json(
        { error: `Backend API error: ${errorText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Update claim API error:", error)
    return NextResponse.json(
      { error: "Failed to update claim" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { claimId: string } },
) {
  try {
    const auth = request.headers.get("authorization")
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userResp = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: auth,
      },
    })

    if (!userResp.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: userResp.status })
    }

    const user = await userResp.json()
    const roles: string[] = user.roles || []
    const isAdmin = roles.some((r) => r.toLowerCase() === "admin")
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { claimId } = params
    console.log(`Deleting claim ${claimId}`)

    const response = await fetch(`${API_BASE_URL}/claims/${claimId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Backend API error: ${response.status} - ${errorText}`)
      return NextResponse.json(
        { error: `Backend API error: ${errorText}` },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete claim API error:", error)
    return NextResponse.json(
      { error: "Failed to delete claim" },
      { status: 500 },
    )
  }
}

