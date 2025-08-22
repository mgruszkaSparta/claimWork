"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Car, Home } from "lucide-react";
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
    icon: <Car className="w-12 h-12" />, 
  },
  {
    id: "2",
    title: "Szkoda mienia",
    subtitle: "szkoda osobowa OC",
    icon: <Home className="w-12 h-12" />, 
  },
  {
    id: "3",
    title: "Szkoda transportowa",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="w-12 h-12 text-red-600">
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
        <h2 className="text-sm font-semibold">Wybierz klienta</h2>
        <ClientDropdown
          selectedClientId={clientId}
          onClientSelected={(e: ClientSelectionEvent) => setClientId(e.clientId)}
        />

        <h3 className="text-sm font-semibold pt-2">Przedmiot szkody</h3>
        <div
          role="radiogroup"
          aria-label="Przedmiot szkody"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {claimTypes.map((t) => {
            const isActive = selected === t.id;
            return (
              <label
                key={t.id}
                tabIndex={0}
                className={`cursor-pointer focus:outline-none ${isActive ? "" : ""}`}
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
                <div
                  className={`border rounded-md flex flex-col items-center justify-center p-6 h-full transition-colors ${
                    isActive ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-center">{t.icon}</div>
                  <span className={`font-medium text-center ${t.id === "3" ? "text-red-600" : ""}`}>{t.title}</span>
                  {t.subtitle && (
                    <span className="text-sm text-gray-500 text-center">{t.subtitle}</span>
                  )}
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

