import { z } from "zod";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_BASE_URL ||
  "https://claim-work-backend.azurewebsites.net/api";

export const decisionSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  decisionDate: z.string(),
  status: z.string().optional(),
  amount: z.number().nullable().optional(),
  currency: z.string().optional(),
  compensationTitle: z.string().optional(),
  documentDescription: z.string().nullish(),
  documentName: z.string().nullish(),
  documentPath: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Decision = z.infer<typeof decisionSchema>;

export const decisionUpsertSchema = decisionSchema.pick({
  decisionDate: true,
  status: true,
  amount: true,
  currency: true,
  compensationTitle: true,
  documentDescription: true,
});

export type DecisionUpsert = z.infer<typeof decisionUpsertSchema> & {
  document?: File;
};

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    ...options,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!response.ok) {
    const message = data?.error || data?.message || text || response.statusText;
    throw new Error(message);
  }
  return data as T;
}

export async function getDecisions(claimId: string): Promise<Decision[]> {
  const data = await request<unknown>(`/claims/${claimId}/decisions`);
  return z.array(decisionSchema).parse(data);
}

export async function createDecision(
  claimId: string,
  payload: DecisionUpsert
): Promise<Decision> {
  const body = new FormData();
  const parsed = decisionUpsertSchema.parse(payload);
  body.append("decisionDate", new Date(parsed.decisionDate).toISOString());
  if (parsed.status) body.append("status", parsed.status);
  if (parsed.amount !== undefined && parsed.amount !== null)
    body.append("amount", String(parsed.amount));
  if (parsed.currency) body.append("currency", parsed.currency);
  if (parsed.compensationTitle)
    body.append("compensationTitle", parsed.compensationTitle);
  if (parsed.documentDescription)
    body.append("documentDescription", parsed.documentDescription);
  if (payload.document) body.append("document", payload.document);

  const data = await request<unknown>(`/claims/${claimId}/decisions`, {
    method: "POST",
    body,
  });
  return decisionSchema.parse(data);
}

export async function updateDecision(
  claimId: string,
  id: string,
  payload: DecisionUpsert
): Promise<Decision> {
  const body = new FormData();
  const parsed = decisionUpsertSchema.parse(payload);
  body.append("decisionDate", new Date(parsed.decisionDate).toISOString());
  if (parsed.status) body.append("status", parsed.status);
  if (parsed.amount !== undefined && parsed.amount !== null)
    body.append("amount", String(parsed.amount));
  if (parsed.currency) body.append("currency", parsed.currency);
  if (parsed.compensationTitle)
    body.append("compensationTitle", parsed.compensationTitle);
  if (parsed.documentDescription)
    body.append("documentDescription", parsed.documentDescription);
  if (payload.document) body.append("document", payload.document);

  const data = await request<unknown>(`/claims/${claimId}/decisions/${id}`, {
    method: "PUT",
    body,
  });
  return decisionSchema.parse(data);
}

export async function deleteDecision(
  claimId: string,
  id: string
): Promise<void> {
  await request<void>(`/claims/${claimId}/decisions/${id}`, {
    method: "DELETE",
  });
}

