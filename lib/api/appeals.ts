import { AppealDto, API_BASE_URL } from "../api";

export interface Appeal {
  id: string;
  filingDate: string;
  extensionDate?: string;
  responseDate?: string;
  decisionDate?: string;
  status?: string;
  documentPath?: string;
  documentName?: string;
  documentDescription?: string;
  alertDays?: number;
}

function formatDate(date?: string | null): string | undefined {
  return date ? date.split("T")[0] : undefined;
}

function mapDtoToAppeal(dto: AppealDto): Appeal {
  return {
    id: dto.id,
    filingDate: formatDate(dto.submissionDate) ?? "",
    extensionDate: formatDate(dto.extensionDate),
    responseDate: formatDate(dto.decisionDate),
    status: dto.status,
    documentPath: dto.documentPath,
    documentName: dto.documentName,
    documentDescription: dto.documentDescription,
    alertDays: dto.daysSinceSubmission,
  };
}

const APPEALS_URL = `${API_BASE_URL}/appeals`;

export async function getAppeals(claimId: string): Promise<Appeal[]> {
  const response = await fetch(`${APPEALS_URL}/event/${claimId}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch appeals");
  }
  const data = (await response.json()) as AppealDto[];
  return data.map(mapDtoToAppeal);
}

export async function createAppeal(formData: FormData): Promise<Appeal> {
  const response = await fetch(APPEALS_URL, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to create appeal");
  }
  const dto = (await response.json()) as AppealDto;
  return mapDtoToAppeal(dto);
}

export async function updateAppeal(
  id: string,
  formData: FormData,
): Promise<Appeal> {
  const response = await fetch(`${APPEALS_URL}/${id}`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to update appeal");
  }
  const dto = (await response.json()) as AppealDto;
  return mapDtoToAppeal(dto);
}

export async function deleteAppeal(id: string): Promise<void> {
  const response = await fetch(`${APPEALS_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to delete appeal");
  }
}
