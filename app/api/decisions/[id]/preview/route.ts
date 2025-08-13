import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // TODO: Replace with actual file preview from backend
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/decisions/${id}/preview`)
    //
    // if (!response.ok) {
    //   throw new Error('Failed to preview file')
    // }
    //
    // const blob = await response.blob()
    // const headers = new Headers()
    // headers.set('Content-Type', response.headers.get('Content-Type') || 'application/pdf')
    //
    // return new NextResponse(blob, { headers })

    // Mock file preview for now - same as download but with inline disposition
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
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj

4 0 obj
<<
/Length 120
>>
stream
BT
/F1 12 Tf
50 750 Td
(DECYZJA UBEZPIECZENIOWA) Tj
0 -30 Td
(Numer decyzji: ${id}) Tj
0 -30 Td
(Data wydania: ${new Date().toLocaleDateString("pl-PL")}) Tj
0 -30 Td
(Status: Wypłata) Tj
0 -30 Td
(Kwota: 5000.00 PLN) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000380 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
550
%%EOF`

    const headers = new Headers()
    headers.set("Content-Type", "application/pdf")
    headers.set("Content-Disposition", "inline")

    return new NextResponse(mockPdfContent, { headers })
  } catch (error) {
    console.error("Error previewing file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
