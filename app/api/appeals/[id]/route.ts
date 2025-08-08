import { type NextRequest, NextResponse } from "next/server"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

// Mock data - in production this would come from your database
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    console.log("GET /api/appeals/[id] - id:", id)

    // In production, fetch from your backend
    if (process.env.NEXT_PUBLIC_API_URL) {
      const response = await fetch(`${API_BASE_URL}/appeals/${id}`, {
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
    const appeal = mockAppeals.find((a) => a.appealId === id)

    if (!appeal) {
      return NextResponse.json({ error: "Appeal not found" }, { status: 404 })
    }

    return NextResponse.json(appeal)
  } catch (error) {
    console.error("Error in GET /api/appeals/[id]:", error)
    return NextResponse.json({ error: "Failed to fetch appeal" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const formData = await request.formData()
    const data = formData.get("data") as string
    const file = formData.get("file") as File | null

    const appealData = JSON.parse(data)

    console.log("PUT /api/appeals/[id] - id:", id)
    console.log("PUT /api/appeals/[id] - data:", appealData)
    console.log("PUT /api/appeals/[id] - file:", file ? `${file.name} (${file.size} bytes)` : "No file")

    // In production, send to your backend
    if (process.env.NEXT_PUBLIC_API_URL) {
      const backendFormData = new FormData()
      backendFormData.append("data", data)
      if (file) {
        backendFormData.append("file", file)
      }

      const response = await fetch(`${API_BASE_URL}/appeals/${id}`, {
        method: "PUT",
        body: backendFormData,
      })

      if (!response.ok) {
        throw new Error(`Backend request failed: ${response.status}`)
      }

      const result = await response.json()
      return NextResponse.json(result)
    }

    // Mock response for development
    const appealIndex = mockAppeals.findIndex((a) => a.appealId === id)

    if (appealIndex === -1) {
      return NextResponse.json({ error: "Appeal not found" }, { status: 404 })
    }

    const updatedAppeal = {
      ...mockAppeals[appealIndex],
      ...appealData,
      appealId: id,
      documentPath: file ? `/uploads/appeals/${file.name}` : mockAppeals[appealIndex].documentPath,
      documentName: file ? file.name : mockAppeals[appealIndex].documentName,
      alertDays: appealData.responseDate ? 0 : Math.floor(Math.random() * 45),
    }

    mockAppeals[appealIndex] = updatedAppeal

    return NextResponse.json(updatedAppeal)
  } catch (error) {
    console.error("Error in PUT /api/appeals/[id]:", error)
    return NextResponse.json({ error: "Failed to update appeal" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    console.log("DELETE /api/appeals/[id] - id:", id)

    // In production, send to your backend
    if (process.env.NEXT_PUBLIC_API_URL) {
      const response = await fetch(`${API_BASE_URL}/appeals/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Backend request failed: ${response.status}`)
      }

      return NextResponse.json({ message: "Appeal deleted successfully" })
    }

    // Mock response for development
    const appealIndex = mockAppeals.findIndex((a) => a.appealId === id)

    if (appealIndex === -1) {
      return NextResponse.json({ error: "Appeal not found" }, { status: 404 })
    }

    mockAppeals.splice(appealIndex, 1)

    return NextResponse.json({ message: "Appeal deleted successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/appeals/[id]:", error)
    return NextResponse.json({ error: "Failed to delete appeal" }, { status: 500 })
  }
}
