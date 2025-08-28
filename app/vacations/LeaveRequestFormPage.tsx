import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { getLeaveRequestById, createLeaveRequest, updateLeaveRequest } from "@/services/leaves-service";
import { showSuccess, showError } from "@/utils/toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DayDuration, LeavePriority, LeaveStatus, LeaveType, SubstituteAcceptanceStatus } from "@/types/leave";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LeaveAttachments } from "@/components/leaves/LeaveAttachments";
import { LeaveRequestSummary } from "@/components/leaves/LeaveRequestSummary";

export default function LeaveRequestFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const { data: existingRequest, isLoading } = useQuery({
    queryKey: ["leaveRequest", id],
    queryFn: () => getLeaveRequestById(id!),
    enabled: isEditMode,
  });

  const [type, setType] = useState<LeaveType | undefined>(undefined);
  const [priority, setPriority] = useState<LeavePriority>("Normalny");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [firstDayDuration, setFirstDayDuration] = useState<DayDuration>("Cały dzień");
  const [lastDayDuration, setLastDayDuration] = useState<DayDuration>("Cały dzień");
  const [substituteName, setSubstituteName] = useState("");
  const [substituteAcceptanceStatus, setSubstituteAcceptanceStatus] = useState<SubstituteAcceptanceStatus>("Oczekujące");
  const [transferDescription, setTransferDescription] = useState("");
  const [urgentProjects, setUrgentProjects] = useState("");
  const [importantContacts, setImportantContacts] = useState("");

  useEffect(() => {
    if (existingRequest) {
      setType(existingRequest.type);
      setPriority(existingRequest.priority);
      setStartDate(parseISO(existingRequest.startDate));
      setEndDate(parseISO(existingRequest.endDate));
      setFirstDayDuration(existingRequest.firstDayDuration);
      setLastDayDuration(existingRequest.lastDayDuration);
      setSubstituteName(existingRequest.substituteName);
      setSubstituteAcceptanceStatus(existingRequest.substituteAcceptanceStatus);
      setTransferDescription(existingRequest.transferDescription);
      setUrgentProjects(existingRequest.urgentProjects);
      setImportantContacts(existingRequest.importantContacts);
    }
  }, [existingRequest]);

  const handleSave = async (status: LeaveStatus) => {
    if (!type || !startDate || !endDate || !substituteName) {
      showError("Proszę wypełnić wszystkie wymagane pola: Typ urlopu, Daty, Zastępca.");
      return;
    }
    if (startDate > endDate) {
      showError("Data rozpoczęcia nie może być późniejsza niż data zakończenia.");
      return;
    }

    const requestData = {
      employeeId: "user-1",
      employeeName: "Anna Kowalska",
      employeeEmail: "anna.kowalska@example.com",
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      firstDayDuration,
      lastDayDuration,
      substituteId: "user-2", // Placeholder
      substituteName,
      substituteAcceptanceStatus,
      type,
      priority,
      transferDescription,
      urgentProjects,
      importantContacts,
      status,
    };

    try {
      if (isEditMode) {
        await updateLeaveRequest(id!, requestData);
        showSuccess("Wniosek został zaktualizowany.");
      } else {
        await createLeaveRequest(requestData);
        showSuccess(status === 'DRAFT' ? "Szkic został zapisany." : "Wniosek został wysłany do akceptacji.");
      }
      navigate("/leaves/my");
    } catch (error) {
      showError("Wystąpił błąd podczas zapisywania wniosku.");
    }
  };

  if (isLoading && isEditMode) {
    return (
      <div className="container mx-auto p-8 max-w-3xl">
        <Skeleton className="h-10 w-32 mb-4" />
        <Skeleton className="h-[800px] w-full" />
      </div>
    );
  }

  const canSaveAsDraft = !isEditMode || existingRequest?.status === 'DRAFT';

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Powrót
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edycja wniosku urlopowego" : "Nowy wniosek urlopowy"}</CardTitle>
          <CardDescription>
            {isEditMode ? "Zaktualizuj dane i zapisz zmiany." : "Wypełnij poniższe pola, aby złożyć wniosek."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Typ urlopu */}
          <div className="grid gap-4 border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Typ urlopu</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Kategoria urlopu *</Label>
                <Select value={type} onValueChange={(value: LeaveType) => setType(value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Wybierz typ urlopu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wypoczynkowy">Wypoczynkowy</SelectItem>
                    <SelectItem value="Na żądanie">Na żądanie</SelectItem>
                    <SelectItem value="Okolicznościowy">Okolicznościowy</SelectItem>
                    <SelectItem value="Opieka nad dzieckiem">Opieka nad dzieckiem</SelectItem>
                    <SelectItem value="Bezplatny">Urlop bezpłatny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priorytet wniosku</Label>
                <Select value={priority} onValueChange={(value: LeavePriority) => setPriority(value)}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Normalny" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Niski">Niski</SelectItem>
                    <SelectItem value="Normalny">Normalny</SelectItem>
                    <SelectItem value="Wysoki">Wysoki</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <RadioGroup value={type} onValueChange={(value: LeaveType) => setType(value)} className="grid gap-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Wypoczynkowy" id="r1" />
                <Label htmlFor="r1">Urlop wypoczynkowy</Label>
                <p className="text-sm text-muted-foreground ml-auto">Standardowy urlop wypoczynkowy zgodnie z kodeksem pracy</p>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Na żądanie" id="r2" />
                <Label htmlFor="r2">Urlop na żądanie</Label>
                <p className="text-sm text-muted-foreground ml-auto">Urlop wykorzystywany w nagłych sytuacjach, bez wcześniejszego uzgodnienia</p>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Bezplatny" id="r3" />
                <Label htmlFor="r3">Urlop bezpłatny</Label>
                <p className="text-sm text-muted-foreground ml-auto">Urlop bez zachowania prawa do wynagrodzenia</p>
              </div>
            </RadioGroup>
          </div>

          {/* Daty i czas trwania urlopu */}
          <div className="grid gap-4 border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Daty i czas trwania urlopu</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Data rozpoczęcia urlopu *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd.MM.yyyy") : <span>dd.mm.rrrr</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus /></PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">Pierwszy dzień nieobecności</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Data zakończenia urlopu *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd.MM.yyyy") : <span>dd.mm.rrrr</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus /></PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">Ostatni dzień nieobecności</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstDayDuration">Pierwszy dzień - czas trwania</Label>
                <Select value={firstDayDuration} onValueChange={(value: DayDuration) => setFirstDayDuration(value)}>
                  <SelectTrigger id="firstDayDuration">
                    <SelectValue placeholder="Cały dzień" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cały dzień">Cały dzień</SelectItem>
                    <SelectItem value="Pierwsza połowa dnia">Pierwsza połowa dnia</SelectItem>
                    <SelectItem value="Druga połowa dnia">Druga połowa dnia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastDayDuration">Ostatni dzień - czas trwania</Label>
                <Select value={lastDayDuration} onValueChange={(value: DayDuration) => setLastDayDuration(value)}>
                  <SelectTrigger id="lastDayDuration">
                    <SelectValue placeholder="Cały dzień" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cały dzień">Cały dzień</SelectItem>
                    <SelectItem value="Pierwsza połowa dnia">Pierwsza połowa dnia</SelectItem>
                    <SelectItem value="Druga połowa dnia">Druga połowa dnia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between bg-muted p-3 rounded-md mt-2">
              <p className="font-medium">Podsumowanie czasu urlopu</p>
              <div className="flex gap-4 text-sm">
                <span>Łączna liczba dni: 0 dni</span>
                <span>Dni robocze: 0 dni</span>
                <span>Weekend i święta: 0 dni</span>
              </div>
            </div>
          </div>

          {/* Osoba zastępująca i przekazanie obowiązków */}
          <div className="grid gap-4 border rounded-lg p-4">
            <h3 className="text-lg font-semibold">Osoba zastępująca i przekazanie obowiązków</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="substitute">Osoba zastępująca *</Label>
                <Input id="substitute" placeholder="Wybierz osobę zastępującą" value={substituteName} onChange={(e) => setSubstituteName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Status akceptacji zastępstwa</Label>
                <RadioGroup value={substituteAcceptanceStatus} onValueChange={(value: SubstituteAcceptanceStatus) => setSubstituteAcceptanceStatus(value)} className="flex h-9 items-center">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Potwierdzone" id="sa1" />
                    <Label htmlFor="sa1">Potwierdzone</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Oczekujące" id="sa2" />
                    <Label htmlFor="sa2">Oczekujące</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Nie wymagane" id="sa3" />
                    <Label htmlFor="sa3">Nie wymagane</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transferDescription">Opis obowiązków do przekazania</Label>
              <Textarea id="transferDescription" placeholder="Opisz szczegółowo obowiązki, które należy przekazać osobie zastępującej, kluczowe projekty, terminy, kontakty..." value={transferDescription} onChange={(e) => setTransferDescription(e.target.value)} className="min-h-[100px]" />
              <p className="text-xs text-muted-foreground">Szczegółowy opis pomoże osobie zastępującej w sprawnym przejęciu obowiązków</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="urgentProjects">Pilne projekty/zadania</Label>
                <Textarea id="urgentProjects" placeholder="Lista najważniejszych zadań wymagających uwagi w czasie nieobecności" value={urgentProjects} onChange={(e) => setUrgentProjects(e.target.value)} className="min-h-[100px]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="importantContacts">Ważne kontakty</Label>
                <Textarea id="importantContacts" placeholder="Kluczowe kontakty, numery telefonów, adresy email" value={importantContacts} onChange={(e) => setImportantContacts(e.target.value)} className="min-h-[100px]" />
              </div>
            </div>
          </div>

          <LeaveAttachments />

          <LeaveRequestSummary
            leaveType={type}
            startDate={startDate}
            endDate={endDate}
            substituteName={substituteName}
            onSave={handleSave}
            canSaveAsDraft={canSaveAsDraft}
          />
        </CardContent>
      </Card>
    </div>
  );
}