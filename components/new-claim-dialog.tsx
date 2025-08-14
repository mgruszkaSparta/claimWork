"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ClientDropdown from "@/components/client-dropdown"
import { Button } from "@/components/ui/button"
import type { ClientSelectionEvent } from "@/types/client"

interface RiskType {
  value: string
  label: string
}

interface DamageType {
  id: number | string
  name: string
}

interface FormValues {
  riskTypeId: string
  damageTypeId: string
  clientId?: number
}

interface NewClaimDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewClaimDialog({ open, onOpenChange }: NewClaimDialogProps) {
  const router = useRouter()
  const form = useForm<FormValues>({
    defaultValues: { riskTypeId: "", damageTypeId: "", clientId: undefined },
  })

  const riskTypeId = form.watch("riskTypeId")
  const damageTypeId = form.watch("damageTypeId")
  const clientId = form.watch("clientId")

  const {
    data: riskTypes = [],
    isLoading: riskLoading,
  } = useQuery<RiskType[]>({
    queryKey: ["risk-types"],
    queryFn: async () => {
      const res = await fetch("/api/risk-types", { credentials: "include" })
      const data = await res.json()
      return data.options || []
    },
    enabled: open,
  })

  const {
    data: damageTypes = [],
    isLoading: damageLoading,
  } = useQuery<DamageType[]>({
    queryKey: ["damage-types", riskTypeId],
    queryFn: async () => {
      const res = await fetch(`/api/damage-types?riskTypeId=${riskTypeId}`, {
        credentials: "include",
      })
      return res.json()
    },
    enabled: !!riskTypeId,
  })

  useEffect(() => {
    form.setValue("damageTypeId", "")
  }, [riskTypeId, form])

  const handleContinue = () => {
    if (!riskTypeId || !damageTypeId || !clientId) return
    router.push(
      `/claims/new?riskType=${riskTypeId}&damageType=${damageTypeId}&clientId=${clientId}`,
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nowa szkoda</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-2 block">Rodzaj ryzyka</Label>
            <Select
              value={riskTypeId}
              onValueChange={(val) => form.setValue("riskTypeId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz ryzyko" />
              </SelectTrigger>
              <SelectContent>
                {riskLoading ? (
                  <div className="p-2 text-sm text-muted-foreground">Ładowanie...</div>
                ) : riskTypes.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">Brak danych</div>
                ) : (
                  riskTypes.map((rt) => (
                    <SelectItem key={rt.value} value={rt.value}>
                      {rt.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Typ szkody</Label>
            <Select
              value={damageTypeId}
              onValueChange={(val) => form.setValue("damageTypeId", val)}
              disabled={!riskTypeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz typ szkody" />
              </SelectTrigger>
              <SelectContent>
                {damageLoading ? (
                  <div className="p-2 text-sm text-muted-foreground">Ładowanie...</div>
                ) : damageTypes.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">Brak danych</div>
                ) : (
                  damageTypes.map((dt) => (
                    <SelectItem key={dt.id} value={String(dt.id)}>
                      {dt.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Klient</Label>
            <ClientDropdown
              selectedClientId={clientId}
              onClientSelected={(e: ClientSelectionEvent) =>
                form.setValue("clientId", e.clientId)
              }
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleContinue}
              disabled={!riskTypeId || !damageTypeId || !clientId}
            >
              Kontynuuj
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NewClaimDialog
