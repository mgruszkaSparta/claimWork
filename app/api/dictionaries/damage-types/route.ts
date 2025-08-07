import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const riskType = searchParams.get('riskType')
    
    let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5200'}/api/dictionaries/damage-types`
    
    if (riskType) {
      url += `?riskType=${encodeURIComponent(riskType)}`
    }

    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch damage types')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching damage types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch damage types' },
      { status: 500 }
    )
  }
}
