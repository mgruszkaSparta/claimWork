import { NextRequest } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function apiFetch(
  request: NextRequest,
  endpoint: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = new Headers(init.headers)
  const cookie = request.headers.get("cookie")
  if (cookie) {
    headers.set("cookie", cookie)
  }
  return fetch(url, {
    ...init,
    headers,
  })
}
