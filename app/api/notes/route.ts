import { NextRequest, NextResponse } from 'next/server'
import { apiFetch } from '@/lib/server-fetch'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')
  const category = searchParams.get('category')
  const params = new URLSearchParams()
  if (eventId) params.append('eventId', eventId)
  if (category) params.append('category', category)
  const url = `/notes${params.toString() ? `?${params.toString()}` : ''}`
  const response = await apiFetch(request, url)
  const data = await response.json().catch(() => null)
  return NextResponse.json(data, { status: response.status })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const response = await apiFetch(request, '/notes', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => null)
  return NextResponse.json(data, { status: response.status })
}
