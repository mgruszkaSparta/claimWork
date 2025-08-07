import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // TODO: Get client claim from database and return file
    // This is a mock implementation
    const mockPdfContent = Buffer.from("Mock PDF content for client claim " + id)

    return new NextResponse(mockPdfContent, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="client-claim-${id}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error downloading client claim document:", error)
    return NextResponse.json({ error: "Failed to download document" }, { status: 500 })
  }
}
