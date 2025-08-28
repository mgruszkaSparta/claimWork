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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { withdrawLeaveRequest, deleteLeaveRequest } from "@/services/leaves-service";
import { showSuccess, showError } from "@/utils/toast";

interface MyLeavesTableProps {
  requests: LeaveRequest[];
}

export function MyLeavesTable({ requests }: MyLeavesTableProps) {
  const queryClient = useQueryClient();
  const [dialogState, setDialogState] = useState<{ type: 'withdraw' | 'delete'; requestId: string | null }>({ type: 'withdraw', requestId: null });

  const handleAction = async () => {
    if (!dialogState.requestId) return;

    try {
      if (dialogState.type === 'withdraw') {
        await withdrawLeaveRequest(dialogState.requestId, {
          id: 'user-1',
          name: 'Anna Kowalska',
        });
        showSuccess("Wniosek został wycofany.");
      } else if (dialogState.type === 'delete') {
        await deleteLeaveRequest(dialogState.requestId);
        showSuccess("Szkic wniosku został usunięty.");
      }
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    } catch (error) {
      showError("Wystąpił błąd podczas wykonywania akcji.");
    } finally {
      setDialogState({ type: 'withdraw', requestId: null });
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
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Typ</TableHead>
              <TableHead>Okres</TableHead>
              <TableHead>Zastępca</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Utworzono</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id} className="odd:bg-white even:bg-muted/50 hover:bg-accent">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Otwórz menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/vacations/leaves/${request.id}`}>Podgląd</Link>
                      </DropdownMenuItem>
                      {(request.status === 'DRAFT' || request.status === 'SUBMITTED') && (
                        <DropdownMenuItem asChild>
                          <Link href={`/vacations/leaves/${request.id}/edit`}>Edytuj</Link>
                        </DropdownMenuItem>
                      )}
                      {request.status === 'SUBMITTED' && (
                        <DropdownMenuItem onClick={() => setDialogState({ type: 'withdraw', requestId: request.id })}>
                          Wycofaj
                        </DropdownMenuItem>
                      )}
                      {request.status === 'DRAFT' && (
                        <DropdownMenuItem className="text-red-600" onClick={() => setDialogState({ type: 'delete', requestId: request.id })}>
                          Usuń
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={!!dialogState.requestId} onOpenChange={() => setDialogState({ type: 'withdraw', requestId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno?</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.type === 'withdraw'
                ? "Czy na pewno chcesz wycofać ten wniosek? Zostanie on oznaczony jako 'Wycofany' i nie będzie dalej procesowany."
                : "Czy na pewno chcesz trwale usunąć ten szkic wniosku? Tej akcji nie można cofnąć."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              {dialogState.type === 'withdraw' ? 'Tak, wycofaj' : 'Tak, usuń'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}