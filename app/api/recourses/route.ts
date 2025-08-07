import { type NextRequest, NextResponse } from "next/server"

// Mock data for development
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const claimId = searchParams.get("claimId")

    if (!claimId) {
      return NextResponse.json({ error: "ClaimId is required" }, { status: 400 })
    }

    // Filter recourses by claimId
    const filteredRecourses = mockRecourses.filter((r) => r.claimId === claimId)

    return NextResponse.json(filteredRecourses)
  } catch (error) {
    console.error("Error fetching recourses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const claimId = formData.get("claimId") as string
    const isJustified = formData.get("isJustified") === "true"
    const filingDate = formData.get("filingDate") as string
    const insuranceCompany = formData.get("insuranceCompany") as string
    const obtainDate = formData.get("obtainDate") as string
    const amount = formData.get("amount") as string
    const documentDescription = formData.get("documentDescription") as string
    const document = formData.get("document") as File

    // Validate required fields
    if (!claimId || !filingDate || !insuranceCompany) {
      return NextResponse.json({ error: "ClaimId, filingDate, and insuranceCompany are required" }, { status: 400 })
    }

    // Create new recourse
    const newRecourse = {
      recourseId: Math.max(...mockRecourses.map((r) => r.recourseId)) + 1,
      claimId,
      isJustified,
      filingDate: new Date(filingDate).toISOString(),
      insuranceCompany,
      obtainDate: obtainDate ? new Date(obtainDate).toISOString() : null,
      amount: amount ? Number.parseFloat(amount) : null,
      documentPath: document ? `/documents/recourse-${Date.now()}.${document.name.split(".").pop()}` : null,
      documentName: document ? document.name : null,
      documentDescription: documentDescription || null,
      currencyCode: "PLN",
      createdDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
    }

    // Add to mock data
    mockRecourses.push(newRecourse)

    console.log("Created new recourse:", newRecourse)

    return NextResponse.json(newRecourse, { status: 201 })
  } catch (error) {
    console.error("Error creating recourse:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
