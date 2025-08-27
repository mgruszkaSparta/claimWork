import { LeaveRequest } from "@/types/leave";
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface LeaveRequestListProps {
  requests: LeaveRequest[];
  selectedRequestId: string | null;
  onSelectRequest: (id: string) => void;
}

export function LeaveRequestList({ requests, selectedRequestId, onSelectRequest }: LeaveRequestListProps) {
  const getStatusBadgeVariant = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'default'; // Green in many designs
      case 'SUBMITTED':
        return 'secondary'; // Blue/Gray
      case 'REJECTED':
        return 'destructive'; // Red
      case 'DRAFT':
      case 'WITHDRAWN':
      default:
        return 'outline'; // Gray
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
    <div className="flex flex-col gap-2 p-2">
      {requests.length === 0 ? (
        <div className="text-center text-muted-foreground p-4">Brak wniosków urlopowych.</div>
      ) : (
        requests.map((request) => (
          <button
            key={request.id}
            onClick={() => onSelectRequest(request.id)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              selectedRequestId === request.id && "bg-muted"
            )}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{request.employeeName}</div>
                <Badge variant={getStatusBadgeVariant(request.status)}>
                  {getStatusLabel(request.status)}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {format(parseISO(request.startDate), 'dd.MM.yyyy')} - {format(parseISO(request.endDate), 'dd.MM.yyyy')}
              </div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {request.type} - {request.transferDescription}
            </div>
          </button>
        ))
      )}
    </div>
  );
}