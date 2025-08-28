import { useQuery } from "@tanstack/react-query";
import { getLeaveRequests } from "@/services/leaves-service";
import { LeaveRequest } from "@/types/leave";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ManagerLeavesTable } from "@/components/leaves/ManagerLeavesTable";

export default function LeavesPage() {
  const { data: requests, isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ["leaveRequests"],
    queryFn: getLeaveRequests,
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 h-screen flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wnioski urlopowe</h1>
          <p className="text-muted-foreground">
            Przeglądaj i zarządzaj wnioskami urlopowymi pracowników.
          </p>
        </div>
        {/* TODO: Dodać filtry dla menedżera */}
      </div>

      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle>Wszystkie wnioski</CardTitle>
          <CardDescription>Lista wszystkich złożonych wniosków w systemie.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-grow overflow-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <ManagerLeavesTable requests={requests || []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}