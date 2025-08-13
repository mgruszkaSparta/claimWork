import { z } from "zod";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

const repairDetailSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  branchId: z.string().min(1, "Oddział jest wymagany"),
  employeeEmail: z.string().min(1, "Pracownik jest wymagany"),
  replacementVehicleRequired: z.boolean(),
  replacementVehicleInfo: z.string().optional().default(""),
  vehicleTabNumber: z.string().min(1, "Nr taborowy pojazdu jest wymagany"),
  vehicleRegistration: z.string().min(1, "Nr rejestracyjny jest wymagany"),
  damageDateTime: z.string().min(1, "Data i godzina szkody są wymagane"),
  appraiserWaitingDate: z.string().min(1, "Data oczekiwania na rzeczoznawcę jest wymagana"),
  repairStartDate: z.string().min(1, "Data przystąpienia do naprawy jest wymagana"),
  repairEndDate: z.string().min(1, "Data zakończenia naprawy jest wymagana"),
  otherVehiclesAvailable: z.boolean(),
  otherVehiclesInfo: z.string().optional().default(""),
  bodyworkHours: z.number(),
  paintingHours: z.number(),
  assemblyHours: z.number(),
  otherWorkHours: z.number(),
  otherWorkDescription: z.string().optional().default(""),
  damageDescription: z.string().optional().default(""),
  additionalDescription: z.string().optional().default(""),
  status: z.enum(["draft", "in-progress", "completed"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const repairDetailUpsertSchema = repairDetailSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RepairDetail = z.infer<typeof repairDetailSchema>;
export type RepairDetailUpsert = z.infer<typeof repairDetailUpsertSchema>;

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
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

export async function getRepairDetails(eventId: string): Promise<RepairDetail[]> {
  const data = await request<unknown>(`/repair-details?eventId=${eventId}`);
  return z.array(repairDetailSchema).parse(data);
}

export async function createRepairDetail(detail: RepairDetailUpsert): Promise<RepairDetail> {
  const body = repairDetailUpsertSchema.parse(detail);
  const data = await request<unknown>(`/repair-details`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return repairDetailSchema.parse(data);
}

export async function updateRepairDetail(id: string, detail: RepairDetailUpsert): Promise<RepairDetail> {
  const body = repairDetailUpsertSchema.parse(detail);
  const data = await request<unknown>(`/repair-details/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return repairDetailSchema.parse(data);
}

export async function deleteRepairDetail(id: string): Promise<void> {
  await request<void>(`/repair-details/${id}`, { method: "DELETE" });
}

export { repairDetailSchema, repairDetailUpsertSchema };
