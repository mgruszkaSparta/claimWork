import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    // TODO: Replace with actual database query
    const mockClientClaims = [
      {
        id: "1",
        eventId: eventId,
        claimDate: "2024-01-15",
        claimType: "Pojazd - szkoda częściowa",
        claimAmount: 15000.0,
        currency: "PLN",
        status: "W trakcie analizy",
        description: "Szkoda w zderzaku przednim i masce",
        documentPath: "/documents/client-claims/claim-1.pdf",
        documentName: "wycena-szkody.pdf",
        documentDescription: "Wycena kosztów naprawy",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        eventId: eventId,
        claimDate: "2024-01-16",
        claimType: "Pojazd zastępczy",
        claimAmount: 800.0,
        currency: "PLN",
        status: "Zaakceptowane",
        description: "Koszt wynajmu pojazdu zastępczego na 4 dni",
        documentPath: "/documents/client-claims/claim-2.pdf",
        documentName: "faktura-wynajem.pdf",
        documentDescription: "Faktura za wynajem pojazdu zastępczego",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    return NextResponse.json(mockClientClaims)
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
    const claimType = formData.get("claimType") as string
    const claimAmount = Number.parseFloat(formData.get("claimAmount") as string)
    const currency = (formData.get("currency") as string) || "PLN"
    const status = formData.get("status") as string
    const description = formData.get("description") as string
    const documentDescription = formData.get("documentDescription") as string
    const document = formData.get("document") as File

    if (!eventId || !claimDate || !claimType || !claimAmount || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // TODO: Save to database and handle file upload
    const newClientClaim = {
      id: Date.now().toString(),
      eventId,
      claimDate,
      claimType,
      claimAmount,
      currency,
      status,
      description,
      documentPath: document ? `/documents/client-claims/${document.name}` : null,
      documentName: document?.name || null,
      documentDescription: documentDescription || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(newClientClaim, { status: 201 })
  } catch (error) {
    console.error("Error creating client claim:", error)
    return NextResponse.json({ error: "Failed to create client claim" }, { status: 500 })
  }
}
