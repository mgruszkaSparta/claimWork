import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock implementation - replace with actual backend API call
    const emails = [
      {
        id: 1,
        from: "Jan Kowalski <jan.kowalski@example.com>",
        to: "claims@company.com",
        subject: "Zgłoszenie szkody - polisa ABC123",
        body: "<p>Dzień dobry,</p><p>Zgłaszam szkodę komunikacyjną...</p>",
        receivedDate: new Date("2024-01-15T10:30:00"),
        read: false,
        claimId: null,
        attachments: [
          {
            id: 1,
            fileName: "zdjecie_szkody.jpg",
            contentType: "image/jpeg",
            size: 1024000,
          },
        ],
      },
      {
        id: 2,
        from: "Anna Nowak <anna.nowak@example.com>",
        to: "claims@company.com",
        subject: "Dokumenty do szkody XYZ789",
        body: "<p>W załączeniu przesyłam dokumenty...</p>",
        receivedDate: new Date("2024-01-14T14:20:00"),
        read: true,
        claimId: "CLAIM-001",
        attachments: [],
      },
    ]

    return NextResponse.json(emails)
  } catch (error) {
    console.error("Error fetching emails:", error)
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const to = formData.get("to") as string
    const subject = formData.get("subject") as string
    const body = formData.get("body") as string
    const attachments = formData.getAll("attachments") as File[]

    // Mock implementation - replace with actual email sending logic
    console.log("Sending email:", { to, subject, body, attachments: attachments.length })

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({ success: true, message: "Email sent successfully" })
  } catch (error) {
    console.error("Error sending email:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
