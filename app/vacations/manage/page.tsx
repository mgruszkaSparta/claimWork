"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";

interface VacationRequest {
  id: string;
  caseHandlerId: string;
  substituteId: string;
  managerIds: string[];
  startDate: string;
  endDate: string;
}

export default function VacationManagePage() {
  const [requests, setRequests] = useState<VacationRequest[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/vacations/pending`)
      .then((r) => r.json())
      .then((data) => setRequests(data));
  }, []);

  const act = async (id: string, action: "approve" | "reject") => {
    await fetch(`${API_BASE_URL}/vacations/${id}/${action}`, { method: "PUT" });
    setRequests((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Wnioski urlopowe</h1>
      {requests.map((r) => (
        <div key={r.id} className="p-4 border rounded space-y-2">
          <p>Likwidator: {r.caseHandlerId}</p>
          <p>Od: {new Date(r.startDate).toLocaleDateString()}</p>
          <p>Do: {new Date(r.endDate).toLocaleDateString()}</p>
          <div className="space-x-2">
            <Button size="sm" onClick={() => act(r.id, "approve")}>Akceptuj</Button>
            <Button size="sm" variant="outline" onClick={() => act(r.id, "reject")}>Odrzuć</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
