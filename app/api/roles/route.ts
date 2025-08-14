import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    { value: 'user', label: 'Użytkownik' },
    { value: 'admin', label: 'Administrator' },
  ])
}

