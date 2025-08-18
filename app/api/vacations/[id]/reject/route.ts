import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/vacations/${params.id}/reject`, {
      method: "PUT",
    });
    return NextResponse.json({}, { status: response.status });
  } catch (error) {
    console.error("Vacation reject error", error);
    return NextResponse.json({ error: "Failed to reject vacation" }, { status: 500 });
  }
}
