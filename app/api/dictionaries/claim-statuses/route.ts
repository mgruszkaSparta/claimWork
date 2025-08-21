import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/dictionaries/claim-statuses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const items = (data.items ?? []).map((item: any) => ({
      ...item,
      id: Number(item.id),
    }))
    return NextResponse.json({ ...data, items })
  } catch (error) {
    console.error('Error fetching claim statuses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch claim statuses' },
      { status: 500 }
    )
  }
}
