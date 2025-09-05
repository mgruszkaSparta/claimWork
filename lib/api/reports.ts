import { API_BASE_URL } from "../api";
import { authFetch } from "../auth-fetch";

export interface ReportMetadata {
  [entity: string]: string[];
}

export interface ReportRequest {
  entity: string;
  fields: string[];
  filters?: Record<string, string>;
  fromDate?: string;
  toDate?: string;
}

export async function getReportMetadata(): Promise<ReportMetadata> {
  const res = await authFetch(`${API_BASE_URL}/report/metadata`);
  if (!res.ok) {
    throw new Error("Nie udało się pobrać metadanych raportu");
  }
  return res.json();
}

export async function exportReport(request: ReportRequest): Promise<Blob> {
  const res = await authFetch(`${API_BASE_URL}/report/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    throw new Error("Nie udało się wyeksportować raportu");
  }
  return res.blob();
}

export async function getFilterValues(
  entity: string,
  field: string,
): Promise<string[]> {
  const res = await authFetch(
    `${API_BASE_URL}/report/values?entity=${encodeURIComponent(
      entity,
    )}&field=${encodeURIComponent(field)}`,
  );
  if (!res.ok) {
    throw new Error("Nie udało się pobrać wartości filtra");
  }
  return res.json();
}

export async function getReportPreview(
  request: ReportRequest,
): Promise<Record<string, string>[]> {
  const res = await authFetch(`${API_BASE_URL}/report/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    throw new Error("Nie udało się pobrać podglądu raportu");
  }
  return res.json();
}
