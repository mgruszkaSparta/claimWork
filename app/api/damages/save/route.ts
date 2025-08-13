import { NextRequest, NextResponse } from 'next/server'
import { apiFetch } from '@/lib/server-fetch'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const response = await apiFetch(request, '/damages', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => null)
  return NextResponse.json(data, { status: response.status })
}
