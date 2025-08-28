import { API_BASE_URL } from "@/lib/api";
import { LeaveStatus } from "@/types/leave";

const BASE_URL = `${API_BASE_URL}/leaves`;

export async function withdrawLeaveRequest(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}/withdraw`, { method: "PUT" });
  if (!res.ok) {
    throw new Error("Failed to withdraw leave request");
  }
}

export async function deleteLeaveRequest(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error("Failed to delete leave request");
  }
}

export async function updateLeaveRequestStatus(
  id: string,
  status: LeaveStatus,
  approvedBy: string,
  rejectionReason?: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, approvedBy, rejectionReason }),
  });

  if (!res.ok) {
    throw new Error("Failed to update leave request status");
  }
}
