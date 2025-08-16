import { z } from "zod";
import { API_BASE_URL } from "../api";

const settlementSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  externalEntity: z.string().nullish(),
  customExternalEntity: z.string().nullish(),
  transferDate: z.string().nullish(),
  status: z.string().nullish(),
  settlementDate: z.string().nullish(),
  settlementAmount: z.number().nullish(),
  amount: z.number().nullish(),
  currency: z.string().nullish(),
  paymentMethod: z.string().nullish(),
  notes: z.string().nullish(),
  description: z.string().nullish(),
  documentPath: z.string().nullish(),
  documentName: z.string().nullish(),
  documentDescription: z.string().nullish(),
  settlementNumber: z.string().nullish(),
  settlementType: z.string().nullish(),
});

const settlementUpsertSchema = z.object({
  eventId: z.string(),
  settlementNumber: z.string().optional(),
  settlementType: z.string().optional(),
  externalEntity: z.string().optional(),
  transferDate: z.string().optional(),
  settlementDate: z.string().optional(),
  amount: z.number().optional(),
  settlementAmount: z.number().optional(),
  currency: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  description: z.string().optional(),
  documentDescription: z.string().optional(),
  status: z.string().min(1),
});

export type Settlement = z.infer<typeof settlementSchema>;
export type SettlementUpsert = z.infer<typeof settlementUpsertSchema>;

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    ...options,
  });
  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    data = undefined;
  }
  if (!response.ok) {
    const message = ((data as any)?.error || (data as any)?.message || text || response.statusText) as string;
    throw new Error(message);
  }
  return data as T;
}

export async function getSettlements(eventId: string): Promise<Settlement[]> {
  const data = await request<unknown>(`/settlements/event/${eventId}`);
  return z.array(settlementSchema).parse(data);
}

function buildFormData(data: SettlementUpsert, files: File[] = []) {
  const parsed = settlementUpsertSchema.parse(data)
  const form = new FormData()
  Object.entries(parsed).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      form.append(key, value.toString())
    }
  })
  files.forEach((f) => form.append("documents", f))
  return form
}

export async function createSettlement(
  data: SettlementUpsert,
  files: File[] = [],
): Promise<Settlement> {
  const body = buildFormData(data, files)
  const result = await request<unknown>(`/settlements`, {
    method: "POST",
    body,
  })
  return settlementSchema.parse(result)
}

export async function updateSettlement(
  id: string,
  data: SettlementUpsert,
  files: File[] = [],
): Promise<Settlement> {
  const body = buildFormData(data, files)
  const result = await request<unknown>(`/settlements/${id}`, {
    method: "PUT",
    body,
  })
  return settlementSchema.parse(result)
}

export async function deleteSettlement(id: string): Promise<void> {
  await request<void>(`/settlements/${id}`, { method: "DELETE" });
}

export { settlementSchema, settlementUpsertSchema };
