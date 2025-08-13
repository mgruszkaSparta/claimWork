import { NextRequest, NextResponse } from 'next/server'
import { apiFetch } from '@/lib/server-fetch'

export async function GET(request: NextRequest) {
  const response = await apiFetch(request, '/dictionaries/leasing-companies')
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status })
  }
  const transformedData = (data ?? []).map((item: any) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    label: item.name,
    value: item.code,
    isActive: item.isActive,
  }))
  return NextResponse.json({ success: true, data: transformedData })
}
