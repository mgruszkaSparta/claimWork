import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200"

export async function POST(request: NextRequest) {
  try {
    console.log("Document upload API called")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const eventId = formData.get("eventId") as string
    const documentType = formData.get("documentType") as string
    const uploadedBy = formData.get("uploadedBy") as string

    console.log("Upload parameters:", {
      fileName: file?.name,
      fileSize: file?.size,
      eventId,
      documentType,
      uploadedBy,
    })

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!eventId) {
      return NextResponse.json({ error: "No eventId provided" }, { status: 400 })
    }

    // Forward the request to the .NET backend
    console.log("Forwarding upload to backend API...")

    const backendFormData = new FormData()
    backendFormData.append("File", file)
    backendFormData.append("EventId", eventId)
    backendFormData.append("DocumentType", documentType || "OTHER")
    backendFormData.append("UploadedBy", uploadedBy || "System")

    const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: "POST",
      body: backendFormData,
    })

    console.log("Backend response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error response:", errorText)

      let errorMessage = `Backend API error: ${response.status} ${response.statusText}`
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorMessage
      } catch {
        // If not JSON, use the raw text
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    const data = await response.json()
    console.log("Upload successful, returning data:", data)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error in upload API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
