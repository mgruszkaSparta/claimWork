import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api";

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization") ?? "";
    const url = `${API_BASE_URL}/dashboard/client`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      cache: "no-store",
    });

    if (response.status === 401) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Backend API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
