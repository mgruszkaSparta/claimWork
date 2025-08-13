import { NextRequest, NextResponse } from 'next/server'
import { apiFetch } from '@/lib/server-fetch'

export async function GET(request: NextRequest) {
  const response = await apiFetch(request, '/dictionaries/risk-types')
  const data = await response.json().catch(() => null)
  return NextResponse.json(data, { status: response.status })
}
