import { type NextRequest, NextResponse } from "next/server"

// Mock data for risk types
const riskTypes = [
  {
    id: "14",
    name: "OC DZIAŁALNOŚCI",
    code: "OCD",
    description: "Odpowiedzialność cywilna z tytułu prowadzonej działalności",
  },
  { id: "123", name: "OC SPRAWCY", code: "OCS", description: "Odpowiedzialność cywilna sprawcy szkody" },
  { id: "134", name: "MAJĄTKOWE", code: "MAJ", description: "Ubezpieczenie mienia od różnych ryzyk" },
  { id: "244", name: "OCPD", code: "OCPD", description: "Odpowiedzialność cywilna posiadaczy pojazdów mechanicznych" },
  { id: "254", name: "CARGO", code: "CAR", description: "Ubezpieczenie ładunku w transporcie" },
  { id: "263", name: "OC PPM", code: "PPM", description: "Odpowiedzialność cywilna posiadaczy pojazdów mechanicznych" },
  { id: "177", name: "AC", code: "AC", description: "Autocasco - ubezpieczenie pojazdu od szkód własnych" },
  { id: "1857", name: "AC (rozszerzone)", code: "ACR", description: "Autocasco z rozszerzonym zakresem ochrony" },
  { id: "2957", name: "NNW", code: "NNW", description: "Ubezpieczenie od następstw nieszczęśliwych wypadków" },
  { id: "21057", name: "CPM", code: "CPM", description: "Ubezpieczenie sprzętu elektronicznego" },
  { id: "21157", name: "CAR/EAR", code: "CAR", description: "Ubezpieczenie wszystkich ryzyk budowy/montażu" },
  { id: "21257", name: "BI", code: "BI", description: "Ubezpieczenie utraty zysków" },
  { id: "21919", name: "GWARANCJE", code: "GWA", description: "Ubezpieczenie gwarancji i poręczeń" },
  { id: "1204", name: "NAPRAWA WŁASNA", code: "NW", description: "Ubezpieczenie kosztów naprawy własnej" },
  { id: "1224", name: "OC W ŻYCIU PRYWATNYM", code: "OCP", description: "Odpowiedzialność cywilna w życiu prywatnym" },
  { id: "1234", name: "OC ROLNIKA", code: "OCR", description: "Odpowiedzialność cywilna rolnika" },
  { id: "1", name: "INNE", code: "INN", description: "Inne rodzaje ubezpieczeń" },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    console.log("Risk Types API called with:", { search, page, limit })

    // Filter by search term
    let filteredTypes = riskTypes
    if (search) {
      const searchLower = search.toLowerCase()
      filteredTypes = riskTypes.filter(
        (type) =>
          type.name.toLowerCase().includes(searchLower) ||
          type.code.toLowerCase().includes(searchLower) ||
          type.description.toLowerCase().includes(searchLower),
      )
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTypes = filteredTypes.slice(startIndex, endIndex)

    // Format for DependentSelect component
    const options = paginatedTypes.map((type) => ({
      value: type.id,
      label: type.name,
      fullName: `${type.name} (${type.code})`,
      metadata: {
        code: type.code,
        description: type.description,
      },
    }))

    const response = {
      options,
      hasMore: endIndex < filteredTypes.length,
      total: filteredTypes.length,
      page,
      limit,
    }

    console.log("Risk Types API response:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in risk-types API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch risk types",
        details: error instanceof Error ? error.message : "Unknown error",
        options: [],
        hasMore: false,
      },
      { status: 500 },
    )
  }
}
