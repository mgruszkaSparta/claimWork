import { API_BASE_URL } from "../api";
import type { DocumentDto } from "../api";
import { authFetch } from "../auth-fetch";

export async function deleteDocument(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/documents/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to delete document");
  }
}

export async function renameDocument(
  id: string,
  originalFileName: string,
): Promise<DocumentDto> {
  const res = await authFetch(`${API_BASE_URL}/documents/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ originalFileName }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to rename document");
  }
  return (await res.json()) as DocumentDto;
}

export async function notifyClient(id: string): Promise<void> {
  const res = await authFetch(`${API_BASE_URL}/documents/${id}/notify-client`, {
    method: "POST",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to notify client");
  }
}
