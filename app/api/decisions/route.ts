import { type NextRequest, NextResponse } from "next/server"

// Mock data for development - replace with actual database calls
const mockDecisions = [
  {
    decisionId: 1,
    claimId: "1",
    decisionDate: "2024-01-15T00:00:00Z",
    status: "Wypłata",
    paymentAmount: 5000.0,
    currency: "PLN",
    compensationTitle: "Pojazd - bezsporna",
    documentPath: "/documents/decision-1.pdf",
    documentName: "Decyzja_wypłata_001.pdf",
    documentDescription: "Decyzja o wypłacie odszkodowania",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    decisionId: 2,
    claimId: "1",
    decisionDate: "2024-01-20T00:00:00Z",
    status: "Odmowa",
    paymentAmount: 0,
    currency: "PLN",
    compensationTitle: "Pojazd zastępczy",
    documentPath: "/documents/decision-2.pdf",
    documentName: "Decyzja_odmowa_002.pdf",
    documentDescription: "Odmowa wypłaty za pojazd zastępczy",
    createdAt: "2024-01-20T14:30:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const claimId = searchParams.get("claimId")

    if (!claimId) {
      return NextResponse.json({ error: "ClaimId is required" }, { status: 400 })
    }

    // Filter decisions by claimId
    const decisions = mockDecisions.filter((d) => d.claimId === claimId)

    if (decisions.length === 0) {
      return NextResponse.json(
        { error: "No decisions found" },
        { status: 404 },
      )
    }

    return NextResponse.json(decisions)
  } catch (error) {
    console.error("Error fetching decisions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const claimId = formData.get("claimId") as string
    const decisionDate = formData.get("decisionDate") as string
    const status = formData.get("status") as string
    const paymentAmount = formData.get("paymentAmount") as string
    const currency = formData.get("currency") as string
    const compensationTitle = formData.get("compensationTitle") as string
    const documentDescription = formData.get("documentDescription") as string
    const document = formData.get("document") as File

    // Validate required fields
    if (!claimId || !decisionDate || !status) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
    }

    // Create new decision object
    const newDecision = {
      decisionId: mockDecisions.length + 1,
      claimId,
      decisionDate,
      status,
      paymentAmount: paymentAmount ? Number.parseFloat(paymentAmount) : null,
      currency: currency || "PLN",
      compensationTitle: compensationTitle || null,
      documentPath: document ? `/documents/${document.name}` : null,
      documentName: document ? document.name : null,
      documentDescription: documentDescription || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In a real application, you would:
    // 1. Save the file to storage (filesystem, cloud storage, etc.)
    // 2. Save the decision to database
    // 3. Return the created decision

    mockDecisions.push(newDecision)

    return NextResponse.json(newDecision, { status: 201 })
  } catch (error) {
    console.error("Error creating decision:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
