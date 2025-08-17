import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const response = await fetch(`${API_BASE_URL}/clientclaims/${id}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error fetching client claim:", errorText)
      return NextResponse.json(
        { error: "Failed to fetch client claim", details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching client claim:", error)
    return NextResponse.json({ error: "Failed to fetch client claim" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const formData = await request.formData()

    const claimDate = formData.get("claimDate") as string
    // Handle both claimType and ClaimType keys from the incoming form data
    const claimType = (formData.get("claimType") || formData.get("ClaimType")) as string
    const claimAmount = Number.parseFloat(formData.get("claimAmount") as string)
    const currency = (formData.get("currency") as string) || "PLN"
    const status = formData.get("status") as string
    const description = formData.get("description") as string
    const documentDescription = formData.get("documentDescription") as string
    const document = formData.get("document") as File

    if (!claimDate || !claimType || !claimAmount || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const backendFormData = new FormData()
    backendFormData.append("ClaimDate", claimDate)
    backendFormData.append("ClaimType", claimType)
    backendFormData.append("ClaimAmount", claimAmount.toString())
    backendFormData.append("Currency", currency)
    backendFormData.append("Status", status)
    if (description) backendFormData.append("Description", description)
    if (documentDescription) backendFormData.append("DocumentDescription", documentDescription)
    if (document) backendFormData.append("Document", document)

    const response = await fetch(`${API_BASE_URL}/clientclaims/${id}`, {
      method: "PUT",
      body: backendFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error updating client claim:", errorText)
      return NextResponse.json(
        { error: "Failed to update client claim", details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating client claim:", error)
    return NextResponse.json({ error: "Failed to update client claim" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const response = await fetch(`${API_BASE_URL}/clientclaims/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error deleting client claim:", errorText)
      return NextResponse.json(
        { error: "Failed to delete client claim", details: errorText },
        { status: response.status },
      )
    }

    return NextResponse.json({ message: "Client claim deleted successfully" }, { status: response.status })
  } catch (error) {
    console.error("Error deleting client claim:", error)
    return NextResponse.json({ error: "Failed to delete client claim" }, { status: 500 })
  }
}
