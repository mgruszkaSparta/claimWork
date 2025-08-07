import { NextResponse } from 'next/server'

// Mock data - replace with actual database calls
const participantTypes = [
  { id: '1', name: 'Poszkodowany' },
  { id: '2', name: 'Sprawca' },
  { id: '3', name: 'Świadek' },
  { id: '4', name: 'Właściciel pojazdu' },
  { id: '5', name: 'Kierowca' },
  { id: '6', name: 'Pasażer' }
]

export async function GET() {
  try {
    return NextResponse.json(participantTypes)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch participant types' },
      { status: 500 }
    )
  }
}
