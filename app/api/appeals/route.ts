import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId") || searchParams.get("claimId")

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 })
    }

    const response = await fetch(`${API_BASE_URL}/appeals/event/${eventId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error in GET /api/appeals:", errorText)
      return NextResponse.json({ error: "Failed to fetch appeals" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/appeals:", error)
    return NextResponse.json({ error: "Failed to fetch appeals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const backendFormData = new FormData()

    const fieldMap: Record<string, string> = {
      claimId: "EventId",
      filingDate: "FilingDate",
      responseDate: "DecisionDate",
      status: "Status",
      documentDescription: "DocumentDescription",
    }

    const toBackendKey = (key: string) => {
      return fieldMap[key] || `${key.charAt(0).toUpperCase()}${key.slice(1)}`
    }

    const documents = formData.getAll("documents")
    documents.forEach((doc) => {
      if (doc instanceof File) {
        backendFormData.append("Documents", doc)
      }
    })

    formData.forEach((value, key) => {
      if (key === "documents") return
      if (key === "claimId" && typeof value === "string") {
        backendFormData.append("EventId", value)
      } else if (key === "extensionDate" && typeof value === "string") {
        backendFormData.append("ExtensionDate", value)
      } else if (typeof value === "string") {
        backendFormData.append(toBackendKey(key), value)
      }
    })

    const response = await fetch(`${API_BASE_URL}/appeals`, {
      method: "POST",
      body: backendFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error in POST /api/appeals:", errorText)
      return NextResponse.json({ error: "Failed to create appeal" }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result, { status: response.status })
  } catch (error) {
    console.error("Error in POST /api/appeals:", error)
    return NextResponse.json({ error: "Failed to create appeal" }, { status: 500 })
  }
}

