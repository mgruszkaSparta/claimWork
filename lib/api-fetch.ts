import { NextRequest } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5200/api"

export async function apiFetch(
  request: NextRequest,
  endpoint: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = new Headers(init.headers)
  const auth = request.headers.get("authorization")
  if (auth) {
    headers.set("authorization", auth)
  }
  return fetch(url, {
    ...init,
    headers,
  })
}
