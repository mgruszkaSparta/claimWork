import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // TODO: Replace with actual file download from backend
    // const response = await fetch(`${process.env.API_BASE_URL}/api/decisions/${id}/download`)
    //
    // if (!response.ok) {
    //   throw new Error('Failed to download file')
    // }
    //
    // const blob = await response.blob()
    // const headers = new Headers()
    // headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream')
    // headers.set('Content-Disposition', response.headers.get('Content-Disposition') || 'attachment')
    //
    // return new NextResponse(blob, { headers })

    // Mock file download for now
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
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Decyzja nr ${id}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`

    const headers = new Headers()
    headers.set("Content-Type", "application/pdf")
    headers.set("Content-Disposition", `attachment; filename="decision-${id}.pdf"`)

    return new NextResponse(mockPdfContent, { headers })
  } catch (error) {
    console.error("Error downloading file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
