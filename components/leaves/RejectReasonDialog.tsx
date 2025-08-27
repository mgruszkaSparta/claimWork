import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RejectReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

export function RejectReasonDialog({ open, onOpenChange, onConfirm }: RejectReasonDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Odrzucenie wniosku</AlertDialogTitle>
          <AlertDialogDescription>
            Proszę podać powód odrzucenia wniosku urlopowego. Ta informacja zostanie przekazana pracownikowi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-2 py-4">
          <Label htmlFor="rejection-reason">Powód odrzucenia</Label>
          <Textarea
            id="rejection-reason"
            placeholder="np. Brak możliwości zapewnienia zastępstwa w tym terminie."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={!reason.trim()}>
            Potwierdź odrzucenie
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}