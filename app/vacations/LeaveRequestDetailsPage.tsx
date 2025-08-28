import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLeaveRequestById } from "@/services/leaves-service";
import { LeaveRequestDetails } from "@/components/leaves/LeaveRequestDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function LeaveRequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: request, isLoading, isError } = useQuery({
    queryKey: ["leaveRequest", id],
    queryFn: () => getLeaveRequestById(id!),
    enabled: !!id,
  });

  const handleStatusChange = () => {
    queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    queryClient.invalidateQueries({ queryKey: ["leaveRequest", id] });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <Skeleton className="h-12 w-1/2 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Nie znaleziono wniosku</h2>
        <p className="text-muted-foreground mb-4">Wniosek, którego szukasz, nie istnieje lub został usunięty.</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
       <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Powrót do listy
      </Button>
      <LeaveRequestDetails request={request} onStatusChange={handleStatusChange} />
    </div>
  );
}