import { NextRequest, NextResponse } from 'next/server'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const claimObjectTypeId = searchParams.get('claimObjectTypeId') || '1' // Default to communication claims

    const url = `${API_BASE_URL}/dictionaries/risk-types?claimObjectTypeId=${claimObjectTypeId}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to fetch risk types')
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching risk types:', error)
    return NextResponse.json({ error: 'Failed to fetch risk types' }, { status: 500 })
  }
}
