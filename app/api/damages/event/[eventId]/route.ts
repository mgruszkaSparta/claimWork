import { NextRequest, NextResponse } from 'next/server'
import { apiFetch } from '@/lib/server-fetch'

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const { eventId } = params
  const response = await apiFetch(request, `/damages/event/${eventId}`)
  const data = await response.json().catch(() => null)
  return NextResponse.json(data, { status: response.status })
}
