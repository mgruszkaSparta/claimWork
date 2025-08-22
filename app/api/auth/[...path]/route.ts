import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function handler(req: NextRequest, { params }: { params: { path?: string[] } }) {
  const path = params.path?.join("/") ?? "";
  const url = `${API_BASE_URL}/Auth/${path}`;

  const init: RequestInit = {
    method: req.method,
    headers: {
      ...(req.headers.get("content-type") ? { "Content-Type": req.headers.get("content-type") as string } : {}),
      cookie: req.headers.get("cookie") || "",
    },
    credentials: "include",
    body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer(),
  };

  const res = await fetch(url, init);
  const buffer = await res.arrayBuffer();
  const response = new NextResponse(buffer, {
    status: res.status,
  });

  res.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      response.headers.set("set-cookie", value);
    } else {
      response.headers.set(key, value);
    }
  });

  return response;
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH, handler as OPTIONS };
