import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const url = `${API_BASE_URL}/dictionaries/leasing-companies`

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()

    // Filter by search term if provided
    let filteredData = data
    if (search) {
      filteredData = data.filter(
        (item: any) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          (item.fullName && item.fullName.toLowerCase().includes(search.toLowerCase())),
      )
    }

    // Transform to the format expected by SearchableSelect
    const options = filteredData.map((item: any) => ({
      value: item.id.toString(),
      label: item.name,
      fullName: item.fullName,
    }))

    return NextResponse.json(options)
  } catch (error) {
    console.error("Error fetching leasing companies:", error)
    return NextResponse.json({ error: "Failed to fetch leasing companies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/dictionaries/leasing-companies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      value: data.id.toString(),
      label: data.name,
      fullName: data.fullName,
    })
  } catch (error) {
    console.error("Error creating leasing company:", error)
    return NextResponse.json({ error: "Failed to create leasing company" }, { status: 500 })
  }
}
