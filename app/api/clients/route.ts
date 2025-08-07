import { type NextRequest, NextResponse } from "next/server"

// Client interface based on the database structure
interface Client {
  id: string
  name: string
  fullName: string
  isActive: boolean
  createdAt: Date
}

// Mock client data - replace with actual database query
const mockClients: Client[] = [
  {
    id: "1000",
    name: "JPM GLOBAL OZIEWICZ STOBIŃKI WODZYŃSKI SP.JAWNA",
    fullName: "JPM GLOBAL OZIEWICZ STOBIŃKI WODZYŃSKI SP.JAWNA",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "1001",
    name: "KUROWSKI SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ",
    fullName: "KUROWSKI SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "1002",
    name: '"MATRAK" M.A. ŁYCZKOWSCY SPÓŁKA JAWNA',
    fullName: '"MATRAK" M.A. ŁYCZKOWSCY SPÓŁKA JAWNA',
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "1003",
    name: "HTS LOGISTIC Sylwester Prus",
    fullName: "HTS LOGISTIC Sylwester Prus",
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "1004",
    name: "WORLDTRANS SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ",
    fullName: "WORLDTRANS SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ",
    isActive: true,
    createdAt: new Date(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // TODO: Replace with actual database query
    // Example with your existing database context:
    // const clients = await db.clients.findMany({
    //   where: search ? {
    //     OR: [
    //       { name: { contains: search, mode: 'insensitive' } },
    //       { fullName: { contains: search, mode: 'insensitive' } }
    //     ]
    //   } : {},
    //   take: limit,
    //   skip: offset,
    //   orderBy: { name: 'asc' }
    // })

    let filteredClients = mockClients

    // Filter by search term if provided
    if (search) {
      filteredClients = mockClients.filter(
        (client) =>
          client.name.toLowerCase().includes(search.toLowerCase()) ||
          client.fullName.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Apply pagination
    const paginatedClients = filteredClients.slice(offset, offset + limit)

    // Transform to the format expected by SearchableSelect
    const options = paginatedClients.map((client) => ({
      value: client.id,
      label: client.name,
      fullName: client.fullName,
    }))

    return NextResponse.json({
      options,
      total: filteredClients.length,
      hasMore: offset + limit < filteredClients.length,
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
      return NextResponse.json({ error: "Name and fullName are required" }, { status: 400 })
    }

    // TODO: Add client to database
    // const newClient = await db.clients.create({
    //   data: {
    //     name,
    //     fullName,
    //     isActive: true
    //   }
    // })

    const newClient = {
      id: Date.now().toString(),
      name,
      fullName,
      isActive: true,
      createdAt: new Date(),
    }

    return NextResponse.json({
      value: newClient.id,
      label: newClient.name,
      fullName: newClient.fullName,
    })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
