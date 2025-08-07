import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const attachmentId = Number.parseInt(params.id)

    // Mock implementation - replace with actual backend API call
    // For now, return a simple text file as a blob
    const mockFileContent = "This is a mock attachment file content"
    const blob = new Blob([mockFileContent], { type: "text/plain" })

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": 'attachment; filename="mock-attachment.txt"',
      },
    })
  } catch (error) {
    console.error("Error downloading attachment:", error)
    return NextResponse.json({ error: "Failed to download attachment" }, { status: 500 })
  }
}
