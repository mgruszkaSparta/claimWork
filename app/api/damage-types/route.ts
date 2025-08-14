import { NextRequest, NextResponse } from 'next/server'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest) {
  const urlObj = new URL(request.url)
  const riskTypeId =
    urlObj.searchParams.get('riskTypeId') || urlObj.searchParams.get('dependsOn')
  const search = urlObj.searchParams.get('search')

  const params = new URLSearchParams()
  if (riskTypeId) {
    params.set('riskTypeId', riskTypeId)
  }
  if (search) {
    params.set('search', search)
  }
  const query = params.toString()
  const url = `${API_BASE_URL}/damage-types${query ? `?${query}` : ''}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to fetch damage types')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching damage types:', error)
    return NextResponse.json([])
  }
}
