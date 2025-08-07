import { NextResponse } from "next/server"

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5200"

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dictionaries/contract-types`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Transform the data to match frontend expectations
    const transformedData = data.map((item: any) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      label: item.name,
      value: item.code,
      isActive: item.isActive,
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
    })
  } catch (error) {
    console.error("Error fetching contract types:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch contract types",
        data: [],
      },
      { status: 500 },
    )
  }
}
