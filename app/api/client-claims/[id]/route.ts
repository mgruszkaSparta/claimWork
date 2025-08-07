import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // TODO: Replace with actual database query
    const mockClientClaim = {
      id,
      eventId: "event-123",
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
    }

    return NextResponse.json(mockClientClaim)
  } catch (error) {
    console.error("Error fetching client claim:", error)
    return NextResponse.json({ error: "Failed to fetch client claim" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const formData = await request.formData()

    const claimDate = formData.get("claimDate") as string
    const claimType = formData.get("claimType") as string
    const claimAmount = Number.parseFloat(formData.get("claimAmount") as string)
    const currency = (formData.get("currency") as string) || "PLN"
    const status = formData.get("status") as string
    const description = formData.get("description") as string
    const documentDescription = formData.get("documentDescription") as string
    const document = formData.get("document") as File

    if (!claimDate || !claimType || !claimAmount || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // TODO: Update in database and handle file upload
    const updatedClientClaim = {
      id,
      eventId: "event-123",
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

    return NextResponse.json(updatedClientClaim)
  } catch (error) {
    console.error("Error updating client claim:", error)
    return NextResponse.json({ error: "Failed to update client claim" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // TODO: Delete from database and remove associated files
    console.log(`Deleting client claim ${id}`)

    return NextResponse.json({ message: "Client claim deleted successfully" })
  } catch (error) {
    console.error("Error deleting client claim:", error)
    return NextResponse.json({ error: "Failed to delete client claim" }, { status: 500 })
  }
}
