import { type NextRequest, NextResponse } from "next/server"

// Mock data - replace with actual database calls
const mockDecisions = [
  {
    decisionId: 1,
    claimId: "1",
    decisionDate: "2024-01-15T00:00:00Z",
    status: "Wypłata",
    paymentAmount: 5000.0,
    currency: "PLN",
    compensationTitle: "Pojazd - szkoda częściowa",
    documentPath: "/documents/decision-1.pdf",
    documentName: "decision-1.pdf",
    documentDescription: "Decyzja o wypłacie odszkodowania",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // TODO: Replace with actual database call
    // const response = await fetch(`${process.env.API_BASE_URL}/api/decisions/${id}`)
    // const decision = await response.json()

    // Mock data for now
    const mockDecision = mockDecisions.find((d) => d.decisionId === Number.parseInt(id))
    if (!mockDecision) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 })
    }

    return NextResponse.json(mockDecision)
  } catch (error) {
    console.error("Error fetching decision:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const formData = await request.formData()

    const claimId = formData.get("claimId") as string
    const decisionDate = formData.get("decisionDate") as string
    const status = formData.get("status") as string
    const paymentAmount = formData.get("paymentAmount") as string
    const currency = formData.get("currency") as string
    const compensationTitle = formData.get("compensationTitle") as string
    const documentDescription = formData.get("documentDescription") as string
    const document = formData.get("document") as File

    if (!claimId || !decisionDate || !status) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
    }

    // Find existing decision
    const decisionIndex = mockDecisions.findIndex((d) => d.decisionId === Number.parseInt(id))
    if (decisionIndex === -1) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 })
    }

    // Update decision
    const updatedDecision = {
      ...mockDecisions[decisionIndex],
      claimId,
      decisionDate,
      status,
      paymentAmount: paymentAmount ? Number.parseFloat(paymentAmount) : null,
      currency: currency || "PLN",
      compensationTitle: compensationTitle || null,
      documentPath: document ? `/documents/${document.name}` : null,
      documentName: document ? document.name : null,
      documentDescription: documentDescription || null,
      updatedAt: new Date().toISOString(),
    }

    mockDecisions[decisionIndex] = updatedDecision

    return NextResponse.json(updatedDecision)
  } catch (error) {
    console.error("Error updating decision:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Find existing decision
    const decisionIndex = mockDecisions.findIndex((d) => d.decisionId === Number.parseInt(id))
    if (decisionIndex === -1) {
      return NextResponse.json({ error: "Decision not found" }, { status: 404 })
    }

    // Remove decision from array
    mockDecisions.splice(decisionIndex, 1)

    return NextResponse.json({ message: "Decision deleted successfully" })
  } catch (error) {
    console.error("Error deleting decision:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
