import { NextRequest, NextResponse } from 'next/server'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const claimObjectTypeId = searchParams.get('claimObjectTypeId') || '1' // Default to communication claims

    const url = `${API_BASE_URL}/risk-types?claimObjectTypeId=${claimObjectTypeId}`

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch risk types')
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching risk types:', error)
    
    // Fallback data based on your database structure
    const allRiskTypes = [
      // claimObjectTypeId = 1 (Szkody komunikacyjne)
      { id: 1, riskId: 4, name: "OC DZIAŁALNOŚCI", description: "OC DZIAŁALNOŚCI", claimObjectTypeId: 1 },
      { id: 2, riskId: 2, name: "OC SPRAWCY", description: "OC SPRAWCY", claimObjectTypeId: 1 },
      { id: 6, riskId: 6, name: "OC PPM", description: "OC PPM", claimObjectTypeId: 1 },
      { id: 7, riskId: 7, name: "AC", description: "AC", claimObjectTypeId: 1 },
      { id: 19, riskId: 19, name: "NAPRAWA WŁASNA", description: "NAPRAWA WŁASNA", claimObjectTypeId: 1 },
      { id: 20, riskId: 20, name: "OC W ŻYCIU PRYWATNYM", description: "OC W ŻYCIU PRYWATNYM", claimObjectTypeId: 1 },
      { id: 22, riskId: 22, name: "OC ROLNIKA", description: "OC ROLNIKA", claimObjectTypeId: 1 },
      { id: 23, riskId: 1, name: "INNE", description: "INNE", claimObjectTypeId: 1 },
      
      // claimObjectTypeId = 2 (Szkody mienia)
      { id: 3, riskId: 4, name: "MAJĄTKOWE", description: "MAJĄTKOWE", claimObjectTypeId: 2 },
      { id: 4, riskId: 4, name: "OCPD", description: "OCPD", claimObjectTypeId: 2 },
      { id: 5, riskId: 4, name: "CARGO", description: "CARGO", claimObjectTypeId: 2 },
      { id: 8, riskId: 57, name: "NNW", description: "NNW", claimObjectTypeId: 2 },
      { id: 9, riskId: 57, name: "CPM", description: "CPM", claimObjectTypeId: 2 },
      { id: 10, riskId: 57, name: "CAR/EAR", description: "CAR/EAR", claimObjectTypeId: 2 },
      { id: 11, riskId: 57, name: "BI", description: "BI", claimObjectTypeId: 2 },
      { id: 12, riskId: 57, name: "GWARANCJIE", description: "GWARANCJIE", claimObjectTypeId: 2 }
    ]
    
    const { searchParams } = new URL(request.url)
    const claimObjectTypeId = searchParams.get('claimObjectTypeId') || '1'
    const filteredData = allRiskTypes.filter(item => item.claimObjectTypeId.toString() === claimObjectTypeId)
    
    return NextResponse.json(filteredData)
  }
}
