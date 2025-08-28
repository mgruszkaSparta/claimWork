import { LeaveRequest } from "@/types/leave";

let leaves: LeaveRequest[] = [
  {
    id: "1",
    employeeId: "e1",
    employeeName: "Jan Kowalski",
    startDate: "2024-07-01",
    endDate: "2024-07-05",
    type: "Wypoczynkowy",
    status: "SUBMITTED",
    submittedAt: "2024-06-01T00:00:00Z",
  },
  {
    id: "2",
    employeeId: "e2",
    employeeName: "Anna Nowak",
    startDate: "2024-07-10",
    endDate: "2024-07-12",
    type: "Na żądanie",
    status: "APPROVED",
    submittedAt: "2024-06-03T00:00:00Z",
    approvedBy: "mgr1",
    approvedAt: "2024-06-04T00:00:00Z",
  },
];

export function getLeaves() {
  return leaves;
}

export function getLeave(id: string) {
  return leaves.find((l) => l.id === id);
}

export function addLeave(request: LeaveRequest) {
  leaves.push(request);
}

export function updateLeave(id: string, data: Partial<LeaveRequest>) {
  const index = leaves.findIndex((l) => l.id === id);
  if (index === -1) return null;
  leaves[index] = { ...leaves[index], ...data };
  return leaves[index];
}

export function removeLeave(id: string) {
  const index = leaves.findIndex((l) => l.id === id);
  if (index === -1) return false;
  leaves.splice(index, 1);
  return true;
}
