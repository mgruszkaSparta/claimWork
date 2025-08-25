import { API_BASE_URL } from "../api";

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
  const res = await fetch(`${API_BASE_URL}/report/metadata`, {
    credentials: "omit",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch report metadata");
  }
  return res.json();
}

export async function exportReport(request: ReportRequest): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/report/export`, {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    throw new Error("Failed to export report");
  }
  return res.blob();
}

export async function getFilterValues(
  entity: string,
  field: string,
): Promise<string[]> {
  const res = await fetch(
    `${API_BASE_URL}/report/values?entity=${encodeURIComponent(
      entity,
    )}&field=${encodeURIComponent(field)}`,
    { credentials: "omit" },
  );
  if (!res.ok) {
    throw new Error("Failed to fetch filter values");
  }
  return res.json();
}
