"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiService, type PolicyDto } from "@/lib/api";

export default function PolicySearch() {
  const [policyNumber, setPolicyNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [policies, setPolicies] = useState<PolicyDto[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await apiService.searchPolicies({
        policyNumber: policyNumber || undefined,
        registrationNumber: registrationNumber || undefined,
      });
      setPolicies(results);
    } catch (e) {
      console.error(e);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="p-6 border-b border-neutral-200">
        <h2 className="text-lg text-neutral-900">Wyszukaj polisę</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            placeholder="Numer polisy"
            value={policyNumber}
            onChange={(e) => setPolicyNumber(e.target.value)}
          />
          <Input
            placeholder="Numer rejestracyjny"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={handleSearch} disabled={loading}>
            {loading ? "Szukam..." : "Szukaj"}
          </Button>
        </div>
      </div>
      {policies.length > 0 && (
        <div className="p-6 border-t border-neutral-200">
          <ul className="space-y-2">
            {policies.map((p) => (
              <li key={p.id} className="text-sm">
                {p.policyNumber} - {p.registrationNumber}
                {p.clientName ? ` (${p.clientName})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

