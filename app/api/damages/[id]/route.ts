import { NextRequest, NextResponse } from 'next/server'
import { apiFetch } from '@/lib/server-fetch'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const response = await apiFetch(request, `/damages/${id}`)
  const data = await response.json().catch(() => null)
  if (response.status === 404) {
    return NextResponse.json({ error: 'Damage not found' }, { status: 404 })
  }
  return NextResponse.json(data, { status: response.status })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const body = await request.json()
  const response = await apiFetch(request, `/damages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => null)
  return NextResponse.json(data, { status: response.status })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const response = await apiFetch(request, `/damages/${id}`, {
    method: 'DELETE',
  })
  const data = await response.json().catch(() => null)
  return NextResponse.json(data, { status: response.status })
}
