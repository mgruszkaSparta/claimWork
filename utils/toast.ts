"use client";

import { toast } from "@/hooks/use-toast";

export function showSuccess(message: string) {
  toast({ title: "Sukces", description: message });
}

export function showError(message: string) {
  toast({ title: "Błąd", description: message, variant: "destructive" });
}
