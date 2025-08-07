import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const urlObj = new URL(request.url)
  const dependsOn = urlObj.searchParams.get('dependsOn') // This is the RiskId

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5200'}/api/damage-types`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to fetch damage types')
    }

    let data = await response.json()

    // Filter by RiskId if dependsOn parameter is provided
    if (dependsOn) {
      data = data.filter((item: any) => item.riskId.toString() === dependsOn)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching damage types:', error)
    
    // Fallback data based on your database structure
    const fallbackData = [
      // RiskId = 2 (OC SPRAWCY)
      { id: 1, name: "Kolizja z innym pojazdem", description: "Kolizja z innym pojazdem", insuranceTypeId: 1, riskId: 2 },
      { id: 2, name: "Bezkolizyjne zajechanie drogi", description: "Bezkolizyjne zajechanie drogi", insuranceTypeId: 1, riskId: 2 },
      { id: 3, name: "Uszkodzenie parkingowe", description: "Uszkodzenie parkingowe", insuranceTypeId: 1, riskId: 2 },
      { id: 4, name: "Inne", description: "Inne", insuranceTypeId: 1, riskId: 2 },
      
      // RiskId = 6 (OC PPM)
      { id: 5, name: "Inne", description: "Inne", insuranceTypeId: 1, riskId: 6 },
      
      // RiskId = 7 (AC)
      { id: 6, name: "Kolizja z innym pojazdem", description: "Kolizja z innym pojazdem", insuranceTypeId: 1, riskId: 7 },
      { id: 7, name: "Bezkolizyjne zajechanie drogi", description: "Bezkolizyjne zajechanie drogi", insuranceTypeId: 1, riskId: 7 },
      { id: 8, name: "Kolizja z ludźmi/zwierzętami", description: "Kolizja z ludźmi/zwierzętami", insuranceTypeId: 1, riskId: 7 },
      { id: 9, name: "Kolizja z przedmiotem", description: "Kolizja z przedmiotem", insuranceTypeId: 1, riskId: 7 },
      { id: 10, name: "Kradzież części lub wyposażenia", description: "Kradzież części lub wyposażenia", insuranceTypeId: 1, riskId: 7 },
      { id: 11, name: "Uszkodzenie parkingowe", description: "Uszkodzenie parkingowe", insuranceTypeId: 1, riskId: 7 },
      { id: 12, name: "Pożar", description: "Pożar", insuranceTypeId: 1, riskId: 7 },
      { id: 13, name: "Grad", description: "Grad", insuranceTypeId: 1, riskId: 7 },
      { id: 14, name: "Powódź", description: "Powódź", insuranceTypeId: 1, riskId: 7 },
      { id: 15, name: "Wandalizm", description: "Wandalizm", insuranceTypeId: 1, riskId: 7 },
      { id: 16, name: "Uszkodzenie szyb", description: "Uszkodzenie szyb", insuranceTypeId: 1, riskId: 7 },
      
      // RiskId = 6 (OC PPM) - dodatkowe
      { id: 17, name: "Kolizja z innym pojazdem", description: "Kolizja z innym pojazdem", insuranceTypeId: 1, riskId: 6 },
      { id: 18, name: "Bezkolizyjne zajechanie drogi", description: "Bezkolizyjne zajechanie drogi", insuranceTypeId: 1, riskId: 6 },
      { id: 19, name: "Uszkodzenie parkingowe", description: "Uszkodzenie parkingowe", insuranceTypeId: 1, riskId: 6 },
      { id: 20, name: "Inne", description: "Inne", insuranceTypeId: 1, riskId: 6 },
      
      // RiskId = 1 (INNE) - dodatkowe
      { id: 21, name: "Uszkodzenie pojazdem wolnobieżnym", description: "Uszkodzenie pojazdem wolnobieżnym", insuranceTypeId: 1, riskId: 1 },
      { id: 22, name: "Uszkodzenie przez pracownika", description: "Uszkodzenie przez pracownika", insuranceTypeId: 1, riskId: 1 },
      { id: 24, name: "Uszkodzenie na nierówności drogi", description: "Uszkodzenie na nierówności drogi", insuranceTypeId: 1, riskId: 1 },
      { id: 25, name: "Uszkodzenie z winy zarządcy posesji/nieruchomości", description: "Uszkodzenie z winy zarządcy posesji/nieruchomości", insuranceTypeId: 1, riskId: 1 },
      { id: 26, name: "Inne", description: "Inne", insuranceTypeId: 1, riskId: 1 },
      
      // RiskId = 20 (OC W ŻYCIU PRYWATNYM)
      { id: 29, name: "Inne", description: "Inne", insuranceTypeId: 1, riskId: 20 },
      { id: 30, name: "Szkoda wyrządzona przez zwierzęta", description: "Szkoda wyrządzona przez zwierzęta", insuranceTypeId: 1, riskId: 20 },
      
      // RiskId = 22 (OC ROLNIKA)
      { id: 32, name: "Szkoda wyrządzona przez maszyny rolnicze", description: "Szkoda wyrządzona przez maszyny rolnicze", insuranceTypeId: 1, riskId: 22 },
      { id: 33, name: "Uszkodzenie w trakcie naprawy oraz Inne", description: "Uszkodzenie w trakcie naprawy", insuranceTypeId: 1, riskId: 22 },
      
      // RiskId = 1 (INNE) - dodatkowe
      { id: 34, name: "Szkoda wyrządzona przez Ubezpieczonego", description: "Szkoda wyrządzona przez Ubezpieczonego", insuranceTypeId: 1, riskId: 1 },
      { id: 35, name: "Szkoda wyrządzona przez dziecko lub zwierzę", description: "Szkoda wyrządzona przez dziecko lub zwierzę", insuranceTypeId: 1, riskId: 1 },
      
      // RiskId = 7 (AC) - dodatkowe
      { id: 17, name: "Inne", description: "Inne", insuranceTypeId: 1, riskId: 7 }
    ]
    
    // Filter by RiskId if dependsOn parameter is provided
    let filteredData = fallbackData
    if (dependsOn) {
      filteredData = fallbackData.filter(item => item.riskId.toString() === dependsOn)
    }
    
    return NextResponse.json(filteredData)
  }
}
