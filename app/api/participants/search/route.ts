import { NextRequest, NextResponse } from 'next/server'
import { apiFetch } from '@/lib/server-fetch'

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

  const response = await apiFetch(request, `/participants/search?${params.toString()}`)
  const data = await response.json().catch(() => null)
  if (response.status === 404) {
    return NextResponse.json(null, { status: 404 })
  }
  return NextResponse.json(data, { status: response.status })
}
