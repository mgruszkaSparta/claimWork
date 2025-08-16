import { z } from "zod"
import { API_BASE_URL } from "../api"

const recourseSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  isJustified: z.boolean(),
  filingDate: z.string().min(1, "Data zgłoszenia jest wymagana"),
  insuranceCompany: z.string().min(1, "Ubezpieczyciel jest wymagany"),
  obtainDate: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  currencyCode: z.string().optional(),
  documentPath: z.string().nullable().optional(),
  documentName: z.string().nullable().optional(),
  documentDescription: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const recourseUpsertSchema = recourseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  documentPath: true,
  documentName: true,
})

export type Recourse = z.infer<typeof recourseSchema>
export type RecourseUpsert = z.infer<typeof recourseUpsertSchema>

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    ...options,
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : undefined
  if (!response.ok) {
    const message = (data as any)?.error || (data as any)?.message || text || response.statusText
    throw new Error(message)
  }
  return data as T
}

export async function getRecourses(eventId: string): Promise<Recourse[]> {
  const data = await request<unknown>(`/recourses?eventId=${eventId}`)
  return z.array(recourseSchema).parse(data)
}

function buildFormData(data: RecourseUpsert, files: File[] = []) {
  const parsed = recourseUpsertSchema.parse(data)
  const formData = new FormData()
  Object.entries(parsed).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString())
    }
  })
  files.forEach((file) => formData.append("documents", file))
  return formData
}

export async function createRecourse(
  data: RecourseUpsert,
  files: File[] = [],
): Promise<Recourse> {
  const body = buildFormData(data, files)
  const result = await request<unknown>(`/recourses`, { method: "POST", body })
  return recourseSchema.parse(result)
}

export async function updateRecourse(
  id: string,
  data: RecourseUpsert,
  files: File[] = [],
): Promise<Recourse> {
  const body = buildFormData(data, files)
  const result = await request<unknown>(`/recourses/${id}`, { method: "PUT", body })
  return recourseSchema.parse(result)
}

export async function deleteRecourse(id: string): Promise<void> {
  await request<void>(`/recourses/${id}`, { method: "DELETE" })
}

export async function downloadRecourseDocument(id: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/recourses/${id}/download`, {
    method: "GET",
    credentials: "include",
  })
  if (!response.ok) {
    throw new Error("Failed to download document")
  }
  return response.blob()
}

export async function previewRecourseDocument(id: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/recourses/${id}/preview`, {
    method: "GET",
    credentials: "include",
  })
  if (!response.ok) {
    throw new Error("Failed to preview document")
  }
  return response.blob()
}

export { recourseSchema, recourseUpsertSchema }
