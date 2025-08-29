"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { eachDayOfInterval, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { getLeaveRequests } from "@/services/leaves-service";
import { getEmployees } from "@/services/employees-service";
import type { LeaveRequest } from "@/types/leave";
import type { Employee } from "@/types/employee";
import { useAuth } from "@/hooks/use-auth";

export default function VacationCalendar() {
  const { user } = useAuth();
  const { data: requests } = useQuery<LeaveRequest[]>({
    queryKey: ["leaveRequests"],
    queryFn: getLeaveRequests,
  });
  const { data: employees } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: () => getEmployees(),
  });

  const days = useMemo(() => {
    if (!user || !requests || !employees) return [];
    const current = employees.find((e) => e.id === user.id);
    if (!current) return [];
    const relevant = user.roles?.some((r) => r.toLowerCase() === "manager")
      ? requests.filter((r) => {
          const emp = employees.find((e) => e.id === r.employeeId);
          return emp?.departmentId === current.departmentId;
        })
      : requests.filter((r) => r.employeeId === user.id);
    return relevant.flatMap((r) =>
      eachDayOfInterval({
        start: parseISO(r.startDate),
        end: parseISO(r.endDate),
      }),
    );
  }, [user, requests, employees]);

  if (!user) return null;

  return <Calendar mode="multiple" selected={days} className="rounded-md border" />;
}
