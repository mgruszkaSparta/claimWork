import { API_BASE_URL } from "./api"

function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

export async function authFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = getToken()
  const headers = new Headers(init.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  return fetch(input.startsWith("http") ? input : `${API_BASE_URL}${input}`, {
    ...init,
    credentials: "omit",
    headers,
  })
}
