import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LeaveRequest } from "@/types/leave";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { updateLeaveRequestStatus } from "@/services/leaves-service";
import { showSuccess, showError } from "@/utils/toast";
import { RejectReasonDialog } from "./RejectReasonDialog";

interface ManagerLeavesTableProps {
  requests: LeaveRequest[];
}

export function ManagerLeavesTable({ requests }: ManagerLeavesTableProps) {
  const queryClient = useQueryClient();
  const [rejectDialogState, setRejectDialogState] = useState<{ requestId: string | null }>({ requestId: null });
  const currentUser = { id: 'user-1', name: 'Anna Kowalska' };

  const handleApprove = async (requestId: string) => {
    try {
      await updateLeaveRequestStatus(requestId, 'APPROVED', "Admin User", currentUser);
      showSuccess("Wniosek został zatwierdzony.");
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    } catch (error) {
      showError("Wystąpił błąd podczas zatwierdzania wniosku.");
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectDialogState.requestId) return;
    try {
      await updateLeaveRequestStatus(
        rejectDialogState.requestId,
        'REJECTED',
        "Admin User",
        currentUser,
        reason,
      );
      showSuccess("Wniosek został odrzucony.");
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    } catch (error) {
      showError("Wystąpił błąd podczas odrzucania wniosku.");
    } finally {
      setRejectDialogState({ requestId: null });
    }
  };

  const getStatusBadgeVariant = (status: LeaveRequest['status']) => {
    const variants: Record<LeaveRequest['status'], "default" | "secondary" | "destructive" | "outline"> = {
      APPROVED: 'default',
      SUBMITTED: 'secondary',
      REJECTED: 'destructive',
      DRAFT: 'outline',
      WITHDRAWN: 'outline',
    };
    return variants[status];
  };

  const getStatusLabel = (status: LeaveRequest['status']) => {
    const labels: Record<LeaveRequest['status'], string> = {
      APPROVED: 'Zatwierdzony',
      SUBMITTED: 'Złożony',
      REJECTED: 'Odrzucony',
      DRAFT: 'Szkic',
      WITHDRAWN: 'Wycofany',
    };
    return labels[status];
  };

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Pracownik</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Okres</TableHead>
              <TableHead>Zastępca</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Złożono</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id} className="odd:bg-white even:bg-muted/50 hover:bg-accent">
                <TableCell className="font-medium">{request.employeeName}</TableCell>
                <TableCell>{request.type}</TableCell>
                <TableCell>
                  {format(parseISO(request.startDate), 'dd.MM.yyyy')} - {format(parseISO(request.endDate), 'dd.MM.yyyy')}
                </TableCell>
                <TableCell>{request.substituteName}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(request.status)}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </TableCell>
                <TableCell>{format(parseISO(request.submittedAt), 'dd.MM.yyyy')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="ghost" size="icon" className="hover:bg-blue-100 dark:hover:bg-blue-900/50">
                          <Link href={`/vacations/leaves/${request.id}`}>
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Podgląd</p></TooltipContent>
                    </Tooltip>
                    {request.status === 'SUBMITTED' && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-green-100 dark:hover:bg-green-900/50" onClick={() => handleApprove(request.id)}>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Zatwierdź</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-red-100 dark:hover:bg-red-900/50" onClick={() => setRejectDialogState({ requestId: request.id })}>
                              <XCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Odrzuć</p></TooltipContent>
                        </Tooltip>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <RejectReasonDialog
        open={!!rejectDialogState.requestId}
        onOpenChange={(open) => !open && setRejectDialogState({ requestId: null })}
        onConfirm={handleReject}
      />
    </TooltipProvider>
  );
}
