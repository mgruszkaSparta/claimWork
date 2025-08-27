import { useState } from "react";
import { CircleCheck, Save, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LeaveType, LeaveStatus } from "@/types/leave";
import { format } from "date-fns";

interface LeaveRequestSummaryProps {
  leaveType: LeaveType | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
  substituteName: string;
  onSave: (status: LeaveStatus) => void;
  canSaveAsDraft: boolean;
}

export function LeaveRequestSummary({
  leaveType,
  startDate,
  endDate,
  substituteName,
  onSave,
  canSaveAsDraft,
}: LeaveRequestSummaryProps) {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [informedSubstitute, setInformedSubstitute] = useState(false);
  const [agreedPolicy, setAgreedPolicy] = useState(false);

  const canSubmit = agreedTerms && informedSubstitute && agreedPolicy;

  return (
    <div className="grid gap-4 border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Podsumowanie i wysłanie wniosku</h3>
        <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
          <CircleCheck className="text-neutral-400 h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <h3 className="font-medium mb-3">Szczegóły wniosku</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Typ urlopu:</span> <span>{leaveType || "Nie wybrano"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Data rozpoczęcia:</span> <span>{startDate ? format(startDate, "dd.MM.yyyy") : "Nie wybrano"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Data zakończenia:</span> <span>{endDate ? format(endDate, "dd.MM.yyyy") : "Nie wybrano"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Liczba dni:</span> <span>0 dni</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Osoba zastępująca:</span> <span>{substituteName || "Nie wybrano"}</span></div>
          </div>
        </div>
        
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <h3 className="font-medium mb-3">Stan urlopów po akceptacji</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Urlop wypoczynkowy pozostały:</span> <span>18 dni</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Urlop na żądanie pozostały:</span> <span>3 dni</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Całkowity wykorzystany:</span> <span>8 dni</span></div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms-agreement" checked={agreedTerms} onCheckedChange={(checked) => setAgreedTerms(Boolean(checked))} />
          <Label htmlFor="terms-agreement" className="text-sm font-normal">Oświadczam, że wszystkie podane informacje są prawdziwe i aktualne</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="replacement-informed" checked={informedSubstitute} onCheckedChange={(checked) => setInformedSubstitute(Boolean(checked))} />
          <Label htmlFor="replacement-informed" className="text-sm font-normal">Potwierdzam poinformowanie osoby zastępującej o przejęciu obowiązków</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="company-policy" checked={agreedPolicy} onCheckedChange={(checked) => setAgreedPolicy(Boolean(checked))} />
          <Label htmlFor="company-policy" className="text-sm font-normal">Zapoznałem się z regulaminem urlopowym firmy i zobowiązuję się go przestrzegać</Label>
        </div>
      </div>
      
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => onSave('DRAFT')} disabled={!canSaveAsDraft}>
            <Save className="mr-2 h-4 w-4" />
            Zapisz jako szkic
          </Button>
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Podgląd
          </Button>
        </div>
        <Button onClick={() => onSave('SUBMITTED')} disabled={!canSubmit}>
          <Send className="mr-2 h-4 w-4" />
          Wyślij wniosek
        </Button>
      </div>
    </div>
  );
}