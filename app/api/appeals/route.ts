import { type NextRequest, NextResponse } from "next/server"

// Mock data for development
const mockAppeals = [
  {
    appealId: 1,
    claimId: "1",
    filingDate: "2024-01-15",
    extensionDate: "2024-02-15",
    responseDate: null,
    status: "W toku",
    documentPath: "/uploads/appeals/odwolanie_1.pdf",
    documentName: "Odwołanie od decyzji TUZ.pdf",
    documentDescription: "Odwołanie od decyzji z dnia 10.01.2024",
    alertDays: 25,
  },
  {
    appealId: 2,
    claimId: "1",
    filingDate: "2024-02-10",
    extensionDate: null,
    responseDate: "2024-03-15",
    status: "Zamknięte",
    documentPath: "/uploads/appeals/odwolanie_2.pdf",
    documentName: "Reklamacja TUZ.pdf",
    documentDescription: "Reklamacja dotycząca wysokości odszkodowania",
    alertDays: 0,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    console.log("GET /api/appeals - eventId:", eventId)

    // In production, fetch from your backend
    if (process.env.NEXT_PUBLIC_API_URL) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appeals?eventId=${eventId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Backend request failed: ${response.status}`)
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    // Mock response for development
    const filteredAppeals = mockAppeals.filter((appeal) => appeal.claimId === eventId)

    return NextResponse.json(filteredAppeals)
  } catch (error) {
    console.error("Error in GET /api/appeals:", error)
    return NextResponse.json({ error: "Failed to fetch appeals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const data = formData.get("data") as string
    const file = formData.get("file") as File | null

    const appealData = JSON.parse(data)

    console.log("POST /api/appeals - data:", appealData)
    console.log("POST /api/appeals - file:", file ? `${file.name} (${file.size} bytes)` : "No file")

    // In production, send to your backend
    if (process.env.NEXT_PUBLIC_API_URL) {
      const backendFormData = new FormData()
      backendFormData.append("data", data)
      if (file) {
        backendFormData.append("file", file)
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appeals`, {
        method: "POST",
        body: backendFormData,
      })

      if (!response.ok) {
        throw new Error(`Backend request failed: ${response.status}`)
      }

      const result = await response.json()
      return NextResponse.json(result)
    }

    // Mock response for development
    const newAppeal = {
      appealId: Math.max(...mockAppeals.map((a) => a.appealId)) + 1,
      ...appealData,
      documentPath: file ? `/uploads/appeals/${file.name}` : null,
      documentName: file ? file.name : null,
      alertDays: appealData.responseDate ? 0 : Math.floor(Math.random() * 45),
    }

    mockAppeals.push(newAppeal)

    return NextResponse.json(newAppeal, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/appeals:", error)
    return NextResponse.json({ error: "Failed to create appeal" }, { status: 500 })
  }
}
