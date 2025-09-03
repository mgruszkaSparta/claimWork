"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Car,
  Home,
  Truck,
  ClipboardList,
  CheckCircle,
} from "lucide-react";
import ClientDropdown from "@/components/client-dropdown";
import { Button } from "@/components/ui/button";
import PolicySearch from "@/components/policy-search";
import type { ClientSelectionEvent } from "@/types/client";

interface ClaimType {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const claimTypes: ClaimType[] = [
  {
    id: "1",
    title: "Szkoda komunikacyjna",
    subtitle: "Szkody związane z pojazdami mechanicznymi",
    icon: Car,
  },
  {
    id: "2",
    title: "Szkoda mienia",
    subtitle: "Szkody osobowe i majątkowe OC",
    icon: Home,
  },
  {
    id: "3",
    title: "Szkoda transportowa",
    subtitle: "Szkody związane z transportem towarów",
    icon: Truck,
  },
];

export default function CreateClaimPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("claimObjectType") || "1";

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
      <div className="w-full max-w-3xl space-y-6">
      <PolicySearch />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-lg text-neutral-900 flex items-center">
              <ClipboardList className="h-5 w-5 text-neutral-600 mr-3" />
              Wybierz klienta
            </h2>
          </div>
          <div className="p-6">
            <ClientDropdown
              selectedClientId={clientId}
              onClientSelected={(e: ClientSelectionEvent) => setClientId(e.clientId)}
            />
          </div>
        </div>

        <section
          id="claim-type-selection"
          className="bg-white rounded-lg shadow-sm border border-neutral-200"
        >
          <div className="p-6 border-b border-neutral-200">
            <h3 className="text-lg text-neutral-900 flex items-center">
              <ClipboardList className="h-5 w-5 text-neutral-600 mr-3" />
              Rodzaj szkody
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              Wybierz typ szkody do zgłoszenia
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {claimTypes.map((t) => {
                const Icon = t.icon;
                const isActive = selected === t.id;
                return (
                  <label key={t.id} className="cursor-pointer group">
                    <input
                      type="radio"
                      name="claim-type"
                      value={t.id}
                      checked={isActive}
                      onChange={() => setSelected(t.id)}
                      className="sr-only"
                    />
                    <div
                      className={`border-2 rounded-lg p-6 text-center transition-all group-hover:shadow-md ${
                        isActive
                          ? "border-neutral-600 bg-neutral-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className="mb-4 flex justify-center">
                        <Icon
                          className={`w-12 h-12 ${
                            isActive
                              ? "text-neutral-600"
                              : "text-neutral-400 group-hover:text-neutral-600"
                          }`}
                        />
                      </div>
                      <h4 className="text-neutral-900 mb-2">{t.title}</h4>
                      {t.subtitle && (
                        <p className="text-sm text-neutral-600">{t.subtitle}</p>
                      )}
                      {isActive && (
                        <div className="mt-4 flex items-center justify-center text-neutral-600">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          <span className="text-sm">Wybrano</span>
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={!clientId}>
            Kontynuuj
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}

