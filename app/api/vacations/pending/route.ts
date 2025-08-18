import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api";

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/vacations/pending`);
    const data = await response.json().catch(() => []);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Vacation pending GET error", error);
    return NextResponse.json({ error: "Failed to load vacation requests" }, { status: 500 });
  }
}
