import { API_BASE_URL } from "../api";
import type { DocumentDto } from "../api";

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: "DELETE",
    credentials: "omit",
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
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: "PUT",
    credentials: "omit",
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
