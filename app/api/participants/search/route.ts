import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5200/api'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const taxId = searchParams.get('taxId')
  const numberId = searchParams.get('numberId')
  const countryId = searchParams.get('countryId')
  const searchCriteria = searchParams.get('searchCriteria')

  const params = new URLSearchParams()
  if (taxId) params.set('taxId', taxId)
  if (numberId) params.set('numberId', numberId)
  if (countryId) params.set('countryId', countryId)
  if (searchCriteria) params.set('searchCriteria', searchCriteria)

  try {
    const res = await fetch(
      `${API_BASE_URL}/participants/search?${params.toString()}`,
    )

    if (res.status === 404) {
      return NextResponse.json(null)
    }

    if (!res.ok) {
      throw new Error('Failed to fetch participant')
    }

    const participant = await res.json()
    return NextResponse.json(participant)
  } catch (error) {
    console.error('Error searching participant:', error)
    return NextResponse.json(
      { error: 'Failed to search participant' },
      { status: 500 },
    )
  }
}
