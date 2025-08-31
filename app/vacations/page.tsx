"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import HandlerDropdown from "@/components/handler-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HandlerSelectionEvent } from "@/types/handler";
import { API_BASE_URL } from "@/lib/api";

export default function VacationPage() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [substituteId, setSubstituteId] = useState<string | undefined>();
  const [managerSelection, setManagerSelection] =
    useState<HandlerSelectionEvent | undefined>();
  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);

  const submit = async () => {
    await fetch(`${API_BASE_URL}/vacations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseHandlerId: user?.id,
        substituteId,
        managerIds: managers.map((m) => m.id),
        startDate,
        endDate,
      }),
    });
    setStartDate("");
    setEndDate("");
    setSubstituteId(undefined);
    setManagerSelection(undefined);
    setManagers([]);
  };

  const onSubstitute = (e: HandlerSelectionEvent) => setSubstituteId(e.handlerId);
  const onManager = (e: HandlerSelectionEvent) => setManagerSelection(e);

  const addManager = () => {
    if (
      managerSelection &&
      !managers.some((m) => m.id === managerSelection.handlerId)
    ) {
      setManagers([
        ...managers,
        { id: managerSelection.handlerId, name: managerSelection.handlerName },
      ]);
      setManagerSelection(undefined);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Wniosek urlopowy</h1>
      <div className="space-y-2">
        <label>Data rozpoczęcia</label>
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label>Data zakończenia</label>
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label>Zastępca</label>
        <HandlerDropdown selectedHandlerId={substituteId} onHandlerSelected={onSubstitute} />
      </div>
      <div className="space-y-2">
        <label>Menadżerowie</label>
        <div className="flex items-center gap-2">
          <HandlerDropdown
            key={managers.length}
            selectedHandlerId={managerSelection?.handlerId}
            onHandlerSelected={onManager}
          />
          <Button type="button" variant="secondary" onClick={addManager}>
            Dodaj
          </Button>
        </div>
        <ul className="list-disc list-inside">
          {managers.map((m) => (
            <li key={m.id}>{m.name}</li>
          ))}
        </ul>
      </div>
      <Button onClick={submit}>Zapisz</Button>
    </div>
  );
}
