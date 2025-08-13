import { z } from "zod"
import { API_BASE_URL } from "../api"

const liquidatorSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
})

export type Liquidator = z.infer<typeof liquidatorSchema>

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    ...options,
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : undefined
  if (!response.ok) {
    const message = (data?.error || data?.message || text || response.statusText) as string
    throw new Error(message)
  }
  return data as T
}

export async function getLiquidators(): Promise<Liquidator[]> {
  const data = await request<unknown>("/liquidators")
  return z.array(liquidatorSchema).parse(data)
}

export { liquidatorSchema }
