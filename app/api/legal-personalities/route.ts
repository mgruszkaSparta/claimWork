import { NextResponse } from 'next/server'

// Mock data - replace with actual database calls
const legalPersonalities = [
  { id: '1', name: 'Osoba fizyczna' },
  { id: '2', name: 'Osoba prawna' },
  { id: '3', name: 'Osoba fizyczna prowadząca działalność gospodarczą' }
]

export async function GET() {
  try {
    return NextResponse.json(legalPersonalities)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch legal personalities' },
      { status: 500 }
    )
  }
}
