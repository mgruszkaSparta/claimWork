"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ClientDropdown from "@/components/client-dropdown";
import { Button } from "@/components/ui/button";
import type { ClientSelectionEvent } from "@/types/client";

interface ClaimType {
  id: string;
  title: string;
  subtitle?: string;
  icon: JSX.Element;
}

const claimTypes: ClaimType[] = [
  {
    id: "1",
    title: "Szkoda komunikacyjna",
    subtitle: "Szkody związane z pojazdami",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6">
        <path d="M3 13l2-5a3 3 0 012.8-2h7.4a3 3 0 012.8 2l2 5v5a1 1 0 01-1 1h-1a2 2 0 01-4 0H9a2 2 0 01-4 0H4a1 1 0 01-1-1v-5zm3.3-5.6A1 1 0 017 7h10a1 1 0 01.9.6L19.4 12H4.6l1.7-4.6zM7 18.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zm7 0a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z" />
      </svg>
    ),
  },
  {
    id: "2",
    title: "Szkoda mienia",
    subtitle: "szkoda osobowa OC",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6">
        <path d="M12 3l8 6v11a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1V9l8-6zm0 2.5L6 10v9h2v-6h8v6h2v-9l-6-4.5z" />
      </svg>
    ),
  },
  {
    id: "3",
    title: "Szkoda transportowa",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 text-red-600">
        <rect
          x="3"
          y="7"
          width="18"
          height="10"
          rx="1"
          ry="1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect x="7" y="9" width="2.5" height="6" fill="currentColor" />
        <rect x="11" y="9" width="2.5" height="6" fill="currentColor" />
        <rect x="15" y="9" width="2.5" height="6" fill="currentColor" />
      </svg>
    ),
  },
];

export default function CreateClaimPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("claimObjectType") || "3";

  const [clientId, setClientId] = useState<number | undefined>();
  const [selected, setSelected] = useState(initialType);

  useEffect(() => {
    setSelected(initialType);
  }, [initialType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;
    router.push(`/claims/new?claimObjectType=${selected}&clientId=${clientId}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-lg font-semibold">Wybierz klienta</h2>
        <ClientDropdown
          selectedClientId={clientId}
          onClientSelected={(e: ClientSelectionEvent) => setClientId(e.clientId)}
        />

        <h3 className="text-md font-medium pt-2">Przedmiot szkody</h3>
        <div role="radiogroup" aria-label="Przedmiot szkody" className="grid gap-3">
          {claimTypes.map((t) => {
            const isActive = selected === t.id;
            return (
              <label
                key={t.id}
                tabIndex={0}
                className={`flex items-center space-x-3 border rounded-md p-3 cursor-pointer focus:outline-none ${
                  isActive ? "border-blue-600 bg-blue-50" : "border-gray-200"
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(t.id);
                  }
                }}
              >
                <input
                  type="radio"
                  name="claim"
                  value={t.id}
                  checked={isActive}
                  onChange={() => setSelected(t.id)}
                  className="sr-only"
                />
                <div className="w-6 h-6 flex items-center justify-center">{t.icon}</div>
                <div className="flex flex-col">
                  <span className={`font-medium ${t.id === "3" ? "text-red-600" : ""}`}>{t.title}</span>
                  {t.subtitle && <span className="text-sm text-gray-500">{t.subtitle}</span>}
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={!clientId}>
            Kontynuuj
          </Button>
        </div>
      </form>
    </div>
  );
}

