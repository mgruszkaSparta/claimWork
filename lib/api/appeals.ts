import { AppealDto, API_BASE_URL, DocumentDto } from "../api";

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
  documentId?: string;
  documents?: DocumentDto[];
}

export interface AppealUpsert {
  eventId?: string;
  filingDate: string;
  extensionDate?: string;
  decisionDate?: string;
  status?: string;
  documentDescription?: string;
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
    documentId: dto.documentId,
    documents: dto.documents,
  };
}

const APPEALS_URL = `${API_BASE_URL}/appeals`;

function buildFormData(data: AppealUpsert, documents: File[] = []) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });
  documents.forEach((file) => formData.append("documents", file));
  return formData;
}

export async function getAppeals(claimId: string): Promise<Appeal[]> {
  const response = await fetch(`${APPEALS_URL}/event/${claimId}`, {
    method: "GET",
    credentials: "omit",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch appeals");
  }
  const data = (await response.json()) as AppealDto[];
  return data.map(mapDtoToAppeal);
}

export async function createAppeal(
  data: AppealUpsert,
  documents: File[] = [],
): Promise<Appeal> {
  const body = buildFormData(data, documents);
  const response = await fetch(APPEALS_URL, {
    method: "POST",
    credentials: "omit",
    body,
  });
  if (!response.ok) {
    throw new Error("Failed to create appeal");
  }
  const dto = (await response.json()) as AppealDto;
  return mapDtoToAppeal(dto);
}

export async function updateAppeal(
  id: string,
  data: AppealUpsert,
  documents: File[] = [],
): Promise<Appeal> {
  const body = buildFormData(data, documents);
  const response = await fetch(`${APPEALS_URL}/${id}`, {
    method: "PUT",
    credentials: "omit",
    body,
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
    credentials: "omit",
  });
  if (!response.ok) {
    throw new Error("Failed to delete appeal");
  }
}

