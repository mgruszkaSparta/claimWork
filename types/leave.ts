export type LeaveType =
  | "Wypoczynkowy"
  | "Na żądanie"
  | "Okolicznościowy"
  | "Opieka nad dzieckiem";

export type LeaveStatus =
  | "APPROVED"
  | "SUBMITTED"
  | "REJECTED"
  | "DRAFT"
  | "WITHDRAWN";

export interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeEmail: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  substituteName: string;
  substituteAcceptanceStatus?: string;
  submittedAt: string;
  status: LeaveStatus;
  firstDayDuration?: string;
  lastDayDuration?: string;
  priority?: string;
  transferDescription?: string;
  urgentProjects?: string;
  importantContacts?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}
