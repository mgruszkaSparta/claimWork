import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const recourseId = Number.parseInt(params.id)

    // Mock file content for development
    const mockFileContent = `Mock Recourse Document ${recourseId}
    
This is a mock document for recourse ID: ${recourseId}
Generated on: ${new Date().toISOString()}

This would normally be the actual document content from your file storage system.`

    const blob = new Blob([mockFileContent], { type: "text/plain" })

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "text/plain",
        "Content-Disposition": `inline; filename="recourse-${recourseId}.txt"`,
      },
    })
  } catch (error) {
    console.error("Error previewing recourse file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
