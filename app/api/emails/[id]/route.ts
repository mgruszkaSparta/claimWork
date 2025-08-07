import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const emailId = Number.parseInt(params.id)

    // Mock implementation - replace with actual backend API call
    const email = {
      id: emailId,
      from: "Jan Kowalski <jan.kowalski@example.com>",
      to: "claims@company.com",
      subject: "Zgłoszenie szkody - polisa ABC123",
      body: "<p>Dzień dobry,</p><p>Zgłaszam szkodę komunikacyjną...</p>",
      receivedDate: new Date("2024-01-15T10:30:00"),
      read: false,
      claimId: null,
      attachments: [],
    }

    return NextResponse.json(email)
  } catch (error) {
    console.error("Error fetching email:", error)
    return NextResponse.json({ error: "Failed to fetch email" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const emailId = Number.parseInt(params.id)

    // Mock implementation - replace with actual backend API call
    console.log("Deleting email:", emailId)

    return NextResponse.json({ success: true, message: "Email deleted successfully" })
  } catch (error) {
    console.error("Error deleting email:", error)
    return NextResponse.json({ error: "Failed to delete email" }, { status: 500 })
  }
}
