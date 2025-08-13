import { NextRequest, NextResponse } from 'next/server'
import { apiFetch } from '@/lib/server-fetch'

export async function POST(request: NextRequest) {
  const response = await apiFetch(request, '/damages/init', { method: 'POST' })
  const data = await response.json().catch(() => null)
  return NextResponse.json(data, { status: response.status })
}
