export type LeaveStatus = 'APPROVED' | 'SUBMITTED' | 'REJECTED' | 'DRAFT' | 'WITHDRAWN';
export type LeaveType = 'Wypoczynkowy' | 'Na żądanie' | 'Okolicznościowy' | 'Opieka nad dzieckiem' | 'Bezplatny';
export type LeavePriority = 'Niski' | 'Normalny' | 'Wysoki';
export type DayDuration = 'Cały dzień' | 'Rano' | 'Popołudnie';
export type SubstituteAcceptanceStatus = 'Oczekujące' | 'Zaakceptowane' | 'Odrzucone';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail?: string;
  startDate: string;
  endDate: string;
  firstDayDuration?: DayDuration;
  lastDayDuration?: DayDuration;
  type: LeaveType;
  priority?: LeavePriority;
  substituteId?: string;
  substituteName?: string;
  substituteEmail?: string;
  substituteAcceptanceStatus?: SubstituteAcceptanceStatus;
  transferDescription?: string;
  urgentProjects?: string;
  importantContacts?: string;
  status: LeaveStatus;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}
