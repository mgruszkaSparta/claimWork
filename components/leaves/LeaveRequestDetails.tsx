import { useState } from "react";
import { LeaveRequest } from "@/types/leave";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { updateLeaveRequestStatus } from "@/services/leaves-service";
import { showSuccess, showError } from "@/utils/toast";
import { RejectReasonDialog } from "./RejectReasonDialog";

interface LeaveRequestDetailsProps {
  request: LeaveRequest;
  onStatusChange: () => void;
  onBack?: () => void;
}

export function LeaveRequestDetails({ request, onStatusChange, onBack }: LeaveRequestDetailsProps) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const currentUser = { id: 'user-1', name: 'Anna Kowalska' };

  const handleApprove = async () => {
    try {
      await updateLeaveRequestStatus(request.id, 'APPROVED', "Admin User", currentUser);
      showSuccess("Wniosek został zatwierdzony pomyślnie!");
      onStatusChange();
    } catch (error) {
      showError("Wystąpił błąd podczas zatwierdzania wniosku.");
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await updateLeaveRequestStatus(request.id, 'REJECTED', "Admin User", currentUser, reason);
      showSuccess("Wniosek został odrzucony pomyślnie!");
      onStatusChange();
    } catch (error) {
      showError("Wystąpił błąd podczas odrzucania wniosku.");
    } finally {
      setIsRejectDialogOpen(false);
    }
  };

  const getStatusBadgeVariant = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'APPROVED': return 'default';
      case 'SUBMITTED': return 'secondary';
      case 'REJECTED': return 'destructive';
      default: return 'outline';
    }
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
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center p-2">
          {onBack && (
            <Button variant="ghost" size="icon" className="mr-2" onClick={onBack}>
              <XCircle size={16} />
            </Button>
          )}
          <h2 className="text-xl font-bold ml-2">Szczegóły Wniosku</h2>
        </div>
        <Separator />
        <div className="p-4 flex-grow overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Wniosek od {request.employeeName}
                <Badge variant={getStatusBadgeVariant(request.status)}>
                  {getStatusLabel(request.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  Złożono: {format(parseISO(request.submittedAt), "PPpp")}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Pracownik:</p>
                <p>{request.employeeName} ({request.employeeEmail})</p>
              </div>
              <div>
                <p className="text-sm font-medium">Okres urlopu:</p>
                <p>{format(parseISO(request.startDate), 'dd.MM.yyyy')} - {format(parseISO(request.endDate), 'dd.MM.yyyy')}</p>
                <p className="text-xs text-muted-foreground">
                  Pierwszy dzień: {request.firstDayDuration}, Ostatni dzień: {request.lastDayDuration}
                </p>
              </div>
               <div>
                <p className="text-sm font-medium">Typ wniosku:</p>
                <p>{request.type} (Priorytet: {request.priority})</p>
              </div>
              <div>
                <p className="text-sm font-medium">Zastępca:</p>
                <p>
                  {request.substituteName}
                  {request.substituteEmail && ` (${request.substituteEmail})`}
                  {` (Status akceptacji: ${request.substituteAcceptanceStatus})`}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Opis obowiązków do przekazania:</p>
                <p className="whitespace-pre-wrap">{request.transferDescription || "Brak"}</p>
              </div>
              {request.urgentProjects && (
                <div>
                  <p className="text-sm font-medium">Pilne projekty/zadania:</p>
                  <p className="whitespace-pre-wrap">{request.urgentProjects}</p>
                </div>
              )}
              {request.importantContacts && (
                <div>
                  <p className="text-sm font-medium">Ważne kontakty:</p>
                  <p className="whitespace-pre-wrap">{request.importantContacts}</p>
                </div>
              )}
              {request.status !== 'SUBMITTED' && request.status !== 'DRAFT' && (
                <div>
                  <p className="text-sm font-medium">Decyzja:</p>
                  <p>
                    {getStatusLabel(request.status)} przez {request.approvedBy} dnia {request.approvedAt ? format(parseISO(request.approvedAt), "PPpp") : 'N/A'}
                  </p>
                  {request.status === 'REJECTED' && request.rejectionReason && (
                     <p className="text-sm text-destructive mt-1">Powód odrzucenia: {request.rejectionReason}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Separator />
        {request.status === 'SUBMITTED' && (
          <div className="p-4 flex gap-2 justify-end">
            <Button variant="destructive" onClick={() => setIsRejectDialogOpen(true)}>
              <XCircle className="mr-2 h-4 w-4" />
              Odrzuć
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Zatwierdź
            </Button>
          </div>
        )}
      </div>
      <RejectReasonDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
        onConfirm={handleReject}
      />
    </>
  );
}