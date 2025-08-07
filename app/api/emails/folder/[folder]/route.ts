import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { folder: string } }) {
  try {
    const folder = params.folder

    // Mock implementation - replace with actual backend API call
    let emails = []

    if (folder === "Inbox") {
      emails = [
        {
          id: 1,
          from: "Jan Kowalski <jan.kowalski@example.com>",
          to: "claims@company.com",
          subject: "Zgłoszenie szkody - polisa ABC123",
          body: "<p>Dzień dobry,</p><p>Zgłaszam szkodę komunikacyjną...</p>",
          receivedDate: new Date("2024-01-15T10:30:00"),
          read: false,
          claimId: "CLAIM-001",
          attachments: [],
        },
      ]
    } else if (folder === "Sent") {
      emails = [
        {
          id: 2,
          from: "claims@company.com",
          to: "jan.kowalski@example.com",
          subject: "Re: Zgłoszenie szkody - polisa ABC123",
          body: "<p>Dziękujemy za zgłoszenie...</p>",
          receivedDate: new Date("2024-01-15T11:00:00"),
          read: true,
          claimId: "CLAIM-001",
          attachments: [],
        },
      ]
    }

    return NextResponse.json(emails)
  } catch (error) {
    console.error("Error fetching emails by folder:", error)
    return NextResponse.json({ error: "Failed to fetch emails by folder" }, { status: 500 })
  }
}
