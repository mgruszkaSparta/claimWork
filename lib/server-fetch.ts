import { NextRequest } from 'next/server'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!

export async function apiFetch(
  request: NextRequest,
  endpoint: string,
  init: RequestInit = {}
) {
  const url = `${API_BASE_URL}${endpoint}`
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      cookie: request.headers.get('cookie') ?? '',
    },
    credentials: 'include',
  })
}
