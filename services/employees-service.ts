import { Employee } from "@/types/employee";

const API_BASE = "/api/employees";

export async function getEmployees(currentUserId: string): Promise<Employee[]> {
  const res = await fetch(API_BASE, {
    headers: { "X-User-Id": currentUserId },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }
  return res.json();
}
