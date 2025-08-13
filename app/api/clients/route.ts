import { type NextRequest, NextResponse } from "next/server"

interface Client {
  id: number
  name: string
  fullName: string
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const url = new URL(`${API_BASE_URL}/clients`)
    if (search) {
      url.searchParams.set("search", search)
    }

    const res = await fetch(url.toString())
    if (!res.ok) {
      throw new Error("Failed to fetch clients")
    }

    const clients: Client[] = await res.json()

    const paginatedClients = clients.slice(offset, offset + limit)

    const options = paginatedClients.map((client) => ({
      value: client.id.toString(),
      label: client.name,
      fullName: client.fullName,
    }))

    return NextResponse.json({
      options,
      total: clients.length,
      hasMore: offset + limit < clients.length,
    })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, fullName } = body

    if (!name || !fullName) {
      return NextResponse.json(
        { error: "Name and fullName are required" },
        { status: 400 },
      )
    }

    const res = await fetch(`${API_BASE_URL}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, fullName, isActive: true }),
    })

    if (!res.ok) {
      throw new Error("Failed to create client")
    }

    const newClient: Client = await res.json()

    return NextResponse.json({
      value: newClient.id.toString(),
      label: newClient.name,
      fullName: newClient.fullName,
    })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}

