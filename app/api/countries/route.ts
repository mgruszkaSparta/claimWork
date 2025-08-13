import { NextRequest, NextResponse } from "next/server"
import { apiFetch } from "@/lib/api-fetch"

export async function GET(request: NextRequest) {
  try {
    const response = await apiFetch(request, `/dictionaries/countries`, {
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
    console.error("Error fetching countries:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch countries",
        data: [],
      },
      { status: 500 },
    )
  }
}
