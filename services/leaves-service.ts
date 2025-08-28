import { LeaveRequest, LeaveStatus } from "@/types/leave";

interface CurrentUser {
  id: string;
  name: string;
  email?: string;
}

const API_BASE = "/api/leaves";

export async function getLeaveRequests(): Promise<LeaveRequest[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) {
    throw new Error("Failed to fetch leave requests");
  }
  return res.json();
}

export async function getLeaveRequestById(id: string): Promise<LeaveRequest> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch leave request");
  }
  return res.json();
}

export async function createLeaveRequest(
  data: Partial<LeaveRequest>,
  user: CurrentUser,
): Promise<LeaveRequest> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": user.id,
      "X-User-Name": user.name,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to create leave request");
  }
  return res.json();
}

export async function updateLeaveRequest(
  id: string,
  data: Partial<LeaveRequest>,
  user: CurrentUser,
): Promise<LeaveRequest> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": user.id,
      "X-User-Name": user.name,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Failed to update leave request");
  }
  return res.json();
}

export async function updateLeaveRequestStatus(
  id: string,
  status: LeaveStatus,
  approvedBy: string,
  user: CurrentUser,
  reason?: string,
): Promise<LeaveRequest> {
  return updateLeaveRequest(
    id,
    { status, approvedBy, rejectionReason: reason },
    user,
  );
}

export async function withdrawLeaveRequest(
  id: string,
  user: CurrentUser,
): Promise<void> {
  await updateLeaveRequest(id, { status: "WITHDRAWN" }, user);
}

export async function deleteLeaveRequest(id: string): Promise<void> {
  await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
}
