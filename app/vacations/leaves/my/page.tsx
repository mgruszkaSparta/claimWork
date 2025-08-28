"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeaveRequests } from "@/services/leaves-service";
import { LeaveRequest, LeaveStatus, LeaveType } from "@/types/leave";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { MyLeavesTable } from "@/components/leaves/MyLeavesTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MyLeavesToolbar } from "@/components/leaves/MyLeavesToolbar";
import { DateRange } from "react-day-picker";
import { parseISO } from "date-fns";

// W symulacji, to ID pochodziłoby z sesji zalogowanego użytkownika
const CURRENT_USER_ID = "user-1";

export default function MyLeavesPage() {
  const { data: requests, isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["leaveRequests"],
    queryFn: getLeaveRequests,
  });

  const [statusFilter, setStatusFilter] = useState<LeaveStatus[]>([]);
  const [typeFilter, setTypeFilter] = useState<LeaveType | "all">("all");
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>(undefined);

  const myRequests = requests?.filter(
    (request) => request.employeeId === CURRENT_USER_ID
  );

  const filteredRequests = myRequests?.filter(request => {
    if (statusFilter.length > 0 && !statusFilter.includes(request.status)) {
      return false;
    }
    if (typeFilter !== 'all' && request.type !== typeFilter) {
      return false;
    }
    if (dateFilter?.from) {
      const requestEndDate = parseISO(request.endDate);
      if (requestEndDate < dateFilter.from) return false;
    }
    if (dateFilter?.to) {
      const requestStartDate = parseISO(request.startDate);
      if (requestStartDate > dateFilter.to) return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Moje urlopy</h1>
          <p className="text-muted-foreground">
            Przeglądaj i zarządzaj swoimi wnioskami urlopowymi.
          </p>
        </div>
        <Button asChild>
          <Link href="/vacations/leaves/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Złóż wniosek
          </Link>
        </Button>
      </div>

      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle>Historia wniosków</CardTitle>
          <CardDescription>Filtruj i przeglądaj swoje wnioski urlopowe.</CardDescription>
          <div className="pt-4">
            <MyLeavesToolbar
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-grow overflow-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredRequests && filteredRequests.length > 0 ? (
            <MyLeavesTable requests={filteredRequests} />
          ) : (
            <div className="text-center py-12 px-6">
              <h3 className="text-lg font-medium">
                {myRequests && myRequests.length > 0 ? "Brak wyników dla wybranych filtrów." : "Nie masz jeszcze wniosków urlopowych."}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {myRequests && myRequests.length > 0 ? "Spróbuj zmienić kryteria wyszukiwania." : "Zacznij planować swój odpoczynek."}
              </p>
              {(!myRequests || myRequests.length === 0) && (
                  <Button asChild>
                    <Link href="/vacations/leaves/new">Złóż pierwszy wniosek</Link>
                  </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}