"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ClientDropdown from "@/components/client-dropdown"
import { Button } from "@/components/ui/button"
import type { ClientSelectionEvent } from "@/types/client"
import { useToast } from "@/hooks/use-toast"

interface RiskType {
  value: string
  label: string
}

interface DamageType {
  id: number | string
  name: string
}

interface NewClaimDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewClaimDialog({ open, onOpenChange }: NewClaimDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [riskTypes, setRiskTypes] = useState<RiskType[]>([])
  const [damageTypes, setDamageTypes] = useState<DamageType[]>([])
  const [selectedRisk, setSelectedRisk] = useState("")
  const [selectedDamage, setSelectedDamage] = useState("")
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>()

  useEffect(() => {
    if (!open) return
    const loadRiskTypes = async () => {
      try {
        const res = await fetch("/api/risk-types", { credentials: "include" })
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        const options = data.map((item: any) => ({ value: item.id, label: item.name }))
        setRiskTypes(options)
      } catch (e) {
        console.error(e)
        toast({
          title: "Uwaga",
          description: "Nie udało się załadować ryzyk.",
          variant: "destructive",
        })
      }
    }
    loadRiskTypes()
  }, [open])

  useEffect(() => {
    if (!selectedRisk) {
      setDamageTypes([])
      setSelectedDamage("")
      return
    }
    const loadDamageTypes = async () => {
      try {
        const res = await fetch(`/api/damage-types?dependsOn=${selectedRisk}`, {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setDamageTypes(data)
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadDamageTypes()
  }, [selectedRisk])

  const handleContinue = () => {
    if (!selectedRisk || !selectedDamage || !selectedClientId) return
    router.push(`/claims/new?riskType=${selectedRisk}&damageType=${selectedDamage}&clientId=${selectedClientId}`)
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
            <Select value={selectedRisk} onValueChange={(val) => setSelectedRisk(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz ryzyko" />
              </SelectTrigger>
              <SelectContent>
                {riskTypes.map((rt) => (
                  <SelectItem key={rt.value} value={rt.value}>
                    {rt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Typ szkody</Label>
            <Select
              value={selectedDamage}
              onValueChange={(val) => setSelectedDamage(val)}
              disabled={!selectedRisk}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz typ szkody" />
              </SelectTrigger>
              <SelectContent>
                {damageTypes.map((dt) => (
                  <SelectItem key={dt.id} value={String(dt.id)}>
                    {dt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-2 block">Klient</Label>
            <ClientDropdown
              selectedClientId={selectedClientId}
              onClientSelected={(e: ClientSelectionEvent) => setSelectedClientId(e.clientId)}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleContinue} disabled={!selectedRisk || !selectedDamage || !selectedClientId}>
              Kontynuuj
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NewClaimDialog
