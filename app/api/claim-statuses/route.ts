import { NextResponse } from "next/server"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/dictionaries/claim-statuses`,
      {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

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
      color: item.color,
      isActive: item.isActive,
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
    })
  } catch (error) {
    console.error("Error fetching claim statuses:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch claim statuses",
        data: [],
      },
      { status: 500 },
    )
  }
}
