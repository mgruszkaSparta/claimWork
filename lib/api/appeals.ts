import { AppealDto } from "../api";
import { API_BASE } from "../api-base";

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
}

export interface AppealPayload {
  filingDate: string;
  extensionDate?: string;
  responseDate?: string;
  decisionDate?: string;
  status?: string;
  documentDescription?: string;
  document?: File;
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
  };
}

function ensureRequiredDates(data: { filingDate?: string }) {
  if (!data.filingDate) {
    throw new Error("filingDate is required");
  }
}

export async function getAppeals(claimId: string): Promise<Appeal[]> {
  const response = await fetch(`${API_BASE}/appeals/event/${claimId}`, {
    method: "GET",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch appeals");
  }
  const data = (await response.json()) as AppealDto[];
  return data.map(mapDtoToAppeal);
}

export async function createAppeal(
  claimId: string,
  appeal: AppealPayload,
): Promise<Appeal> {
  ensureRequiredDates(appeal);
  const formData = new FormData();
  formData.append("EventId", claimId);
  formData.append("FilingDate", appeal.filingDate);

  if (appeal.extensionDate) {
    formData.append("ExtensionDate", appeal.extensionDate);
  }
  const decisionDate = appeal.decisionDate ?? appeal.responseDate;
  if (decisionDate) {
    formData.append("DecisionDate", decisionDate);
  }
  if (appeal.status) {
    formData.append("Status", appeal.status);
  }
  if (appeal.documentDescription) {
    formData.append("DocumentDescription", appeal.documentDescription);
  }
  if (appeal.document) {
    formData.append("Document", appeal.document);
  }
  const response = await fetch(`${API_BASE}/appeals`, {
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
  appeal: AppealPayload,
): Promise<Appeal> {
  ensureRequiredDates(appeal);
  const formData = new FormData();
  formData.append("FilingDate", appeal.filingDate);

  if (appeal.extensionDate) {
    formData.append("ExtensionDate", appeal.extensionDate);
  }
  const decisionDateUpdate = appeal.decisionDate ?? appeal.responseDate;
  if (decisionDateUpdate) {
    formData.append("DecisionDate", decisionDateUpdate);
  }
  if (appeal.status) {
    formData.append("Status", appeal.status);
  }
  if (appeal.documentDescription) {
    formData.append("DocumentDescription", appeal.documentDescription);
  }
  if (appeal.document) {
    formData.append("Document", appeal.document);
  }
  const response = await fetch(`${API_BASE}/appeals/${id}`, {
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
  const response = await fetch(`${API_BASE}/appeals/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to delete appeal");
  }
}
