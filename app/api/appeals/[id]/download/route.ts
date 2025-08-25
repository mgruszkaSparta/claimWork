import { type NextRequest, NextResponse } from "next/server"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    console.log("GET /api/appeals/[id]/download - id:", id)

    // In production, fetch file from your backend
    if (process.env.NEXT_PUBLIC_API_URL) {
      const response = await fetch(`${API_BASE_URL}/appeals/${id}/download`, {
        method: "GET",
        headers: { authorization: request.headers.get("authorization") ?? "" },
      })

      if (!response.ok) {
        throw new Error(`Backend request failed: ${response.status}`)
      }

      const blob = await response.blob()
      const contentType = response.headers.get("content-type") || "application/octet-stream"
      const contentDisposition = response.headers.get("content-disposition") || 'attachment; filename="document.pdf"'

      return new NextResponse(blob, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": contentDisposition,
        },
      })
    }

    // Mock response for development - generate a sample PDF
    const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

5 0 obj
<<
/Length 100
>>
stream
BT
/F1 12 Tf
100 700 Td
(Przykładowe odwołanie - ID: ${id}) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000125 00000 n 
0000000280 00000 n 
0000000348 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
500
%%EOF`

    const buffer = Buffer.from(mockPdfContent, "utf-8")

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="odwolanie_${id}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error in GET /api/appeals/[id]/download:", error)
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
  }
}
