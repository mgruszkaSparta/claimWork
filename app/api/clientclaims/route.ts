import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    const response = await fetch(`${API_BASE_URL}/clientclaims/event/${eventId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error:", errorText)
      return NextResponse.json(
        { error: "Failed to fetch client claims", details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching client claims:", error)
    return NextResponse.json({ error: "Failed to fetch client claims" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const eventId = formData.get("eventId") as string
    const claimDate = formData.get("claimDate") as string
    // Support both camelCase and PascalCase to ensure compatibility with different clients
    const claimType = (formData.get("claimType") || formData.get("ClaimType")) as string
    const claimAmount = Number.parseFloat(formData.get("claimAmount") as string)
    const currency = (formData.get("currency") as string) || "PLN"
    const status = formData.get("status") as string
    const description = formData.get("description") as string
    const documentDescription = formData.get("documentDescription") as string
    const documents = formData
      .getAll("documents")
      .filter((d): d is File => d instanceof File)
    const singleDocument = formData.get("document")
    if (singleDocument instanceof File) {
      documents.push(singleDocument)
    }

    if (!eventId || !claimDate || !claimType || !claimAmount || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const backendFormData = new FormData()
    backendFormData.append("EventId", eventId)
    backendFormData.append("ClaimDate", claimDate)
    backendFormData.append("ClaimType", claimType)
    backendFormData.append("ClaimAmount", claimAmount.toString())
    backendFormData.append("Currency", currency)
    backendFormData.append("Status", status)
    if (description) backendFormData.append("Description", description)
    if (documentDescription) backendFormData.append("DocumentDescription", documentDescription)
    documents.forEach((doc) => backendFormData.append("Document", doc))

    const response = await fetch(`${API_BASE_URL}/clientclaims`, {
      method: "POST",
      body: backendFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error creating client claim:", errorText)
      return NextResponse.json({ error: "Failed to create client claim", details: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating client claim:", error)
    return NextResponse.json({ error: "Failed to create client claim" }, { status: 500 })
  }
}
