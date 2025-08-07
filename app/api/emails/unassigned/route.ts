import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock implementation - replace with actual backend API call
    const unassignedEmails = [
      {
        id: 3,
        from: "Maria Kowalczyk <maria.kowalczyk@example.com>",
        to: "claims@company.com",
        subject: "Nowa szkoda do przypisania",
        body: "<p>Proszę o przypisanie tej szkody...</p>",
        receivedDate: new Date("2024-01-16T09:15:00"),
        read: false,
        claimId: null,
        attachments: [],
      },
    ]

    return NextResponse.json(unassignedEmails)
  } catch (error) {
    console.error("Error fetching unassigned emails:", error)
    return NextResponse.json({ error: "Failed to fetch unassigned emails" }, { status: 500 })
  }
}
