import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // TODO: Get client claim from database and return file for preview
    // This is a mock implementation
    const mockPdfContent = Buffer.from("Mock PDF content for client claim preview " + id)

    return new NextResponse(mockPdfContent, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
      },
    })
  } catch (error) {
    console.error("Error previewing client claim document:", error)
    return NextResponse.json({ error: "Failed to preview document" }, { status: 500 })
  }
}
