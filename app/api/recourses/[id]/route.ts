import { type NextRequest, NextResponse } from "next/server"

// Mock data for development (same as in route.ts)
const mockRecourses = [
  {
    recourseId: 1,
    claimId: "1",
    isJustified: true,
    filingDate: "2024-01-15T00:00:00Z",
    insuranceCompany: "PZU SA",
    obtainDate: "2024-02-20T00:00:00Z",
    amount: 15000.0,
    documentPath: "/documents/recourse-1.pdf",
    documentName: "Pismo w sprawie regresu PZU.pdf",
    documentDescription: "Oficjalne pismo w sprawie regresu od PZU SA",
    currencyCode: "PLN",
    createdDate: "2024-01-15T10:30:00Z",
    modifiedDate: "2024-02-20T14:15:00Z",
  },
  {
    recourseId: 2,
    claimId: "1",
    isJustified: false,
    filingDate: "2024-01-20T00:00:00Z",
    insuranceCompany: "Warta SA",
    obtainDate: null,
    amount: null,
    documentPath: "/documents/recourse-2.pdf",
    documentName: "Odrzucenie regresu Warta.pdf",
    documentDescription: "Pismo o odrzuceniu wniosku o regres",
    currencyCode: "PLN",
    createdDate: "2024-01-20T09:15:00Z",
    modifiedDate: "2024-01-20T09:15:00Z",
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recourseId = Number.parseInt(params.id)
    const recourse = mockRecourses.find((r) => r.recourseId === recourseId)

    if (!recourse) {
      return NextResponse.json({ error: "Recourse not found" }, { status: 404 })
    }

    return NextResponse.json(recourse)
  } catch (error) {
    console.error("Error fetching recourse:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recourseId = Number.parseInt(params.id)
    const recourseIndex = mockRecourses.findIndex((r) => r.recourseId === recourseId)

    if (recourseIndex === -1) {
      return NextResponse.json({ error: "Recourse not found" }, { status: 404 })
    }

    const formData = await request.formData()

    const isJustified = formData.get("isJustified") === "true"
    const filingDate = formData.get("filingDate") as string
    const insuranceCompany = formData.get("insuranceCompany") as string
    const obtainDate = formData.get("obtainDate") as string
    const amount = formData.get("amount") as string
    const documentDescription = formData.get("documentDescription") as string
    const document = formData.get("document") as File

    // Update the recourse
    const updatedRecourse = {
      ...mockRecourses[recourseIndex],
      isJustified,
      filingDate: new Date(filingDate).toISOString(),
      insuranceCompany,
      obtainDate: obtainDate ? new Date(obtainDate).toISOString() : null,
      amount: amount ? Number.parseFloat(amount) : null,
      documentDescription: documentDescription || null,
      modifiedDate: new Date().toISOString(),
    }

    // Update document if new file provided
    if (document) {
      updatedRecourse.documentPath = `/documents/recourse-${Date.now()}.${document.name.split(".").pop()}`
      updatedRecourse.documentName = document.name
    }

    mockRecourses[recourseIndex] = updatedRecourse

    console.log("Updated recourse:", updatedRecourse)

    return NextResponse.json(updatedRecourse)
  } catch (error) {
    console.error("Error updating recourse:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recourseId = Number.parseInt(params.id)
    const recourseIndex = mockRecourses.findIndex((r) => r.recourseId === recourseId)

    if (recourseIndex === -1) {
      return NextResponse.json({ error: "Recourse not found" }, { status: 404 })
    }

    // Remove the recourse
    const deletedRecourse = mockRecourses.splice(recourseIndex, 1)[0]

    console.log("Deleted recourse:", deletedRecourse)

    return NextResponse.json({ message: "Recourse deleted successfully" })
  } catch (error) {
    console.error("Error deleting recourse:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
