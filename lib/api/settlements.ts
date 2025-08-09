import { z } from "zod";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_BASE_URL ||
  "https://claim-work-backend.azurewebsites.net/api";

const settlementSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  externalEntity: z.string().nullish(),
  transferDate: z.string().nullish(),
  settlementDate: z.string().nullish(),
  settlementAmount: z.number().nullish(),
  currency: z.string().nullish(),
  status: z.string().optional(),
});

const settlementUpsertSchema = z.object({
  eventId: z.string(),
  externalEntity: z.string().optional(),
  transferDate: z.string().optional(),
  settlementDate: z.string().optional(),
  settlementAmount: z.number().optional(),
  currency: z.string().optional(),
  status: z.string().min(1),
});

export type Settlement = z.infer<typeof settlementSchema>;
export type SettlementUpsert = z.infer<typeof settlementUpsertSchema>;

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!response.ok) {
    const message = (data?.error || data?.message || text || response.statusText) as string;
    throw new Error(message);
  }
  return data as T;
}

export async function getSettlements(eventId: string): Promise<Settlement[]> {
  const data = await request<unknown>(`/settlements/event/${eventId}`);
  return z.array(settlementSchema).parse(data);
}

export async function createSettlement(form: FormData): Promise<Settlement> {
  const data = await request<unknown>(`/settlements`, {
    method: "POST",
    body: form,
  });
  return settlementSchema.parse(data);
}

export async function updateSettlement(
  id: string,
  form: FormData,
): Promise<Settlement> {
  const data = await request<unknown>(`/settlements/${id}`, {
    method: "PUT",
    body: form,
  });
  return settlementSchema.parse(data);
}

export async function deleteSettlement(id: string): Promise<void> {
  await request<void>(`/settlements/${id}`, { method: "DELETE" });
}

export { settlementSchema, settlementUpsertSchema };
