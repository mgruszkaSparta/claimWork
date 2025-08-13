"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  getSettlements,
  createSettlement,
  updateSettlement,
  deleteSettlement,
  settlementUpsertSchema,
  type Settlement,
} from "@/lib/api/settlements"

interface SettlementsSectionProps {
  eventId: string
}

export function SettlementsSection({ eventId }: SettlementsSectionProps) {
  const { toast } = useToast()
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const getInitialForm = () => ({
    externalEntity: "",
    customExternalEntity: "",
    transferDate: "",
    settlementDate: "",
    settlementNumber: "",
    settlementType: "",
    amount: 0,
    settlementAmount: 0,
    currency: "PLN",
    status: "",
    paymentMethod: "",
    notes: "",
    description: "",
  })

  const [formData, setFormData] = useState(getInitialForm())

  useEffect(() => {
    fetchSettlements()
  }, [eventId])

  async function fetchSettlements() {
    try {
      setIsLoading(true)
      const data = await getSettlements(eventId)
      setSettlements(data)
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się pobrać rozliczeń",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setFormData(getInitialForm())
    setEditingId(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const validation = settlementUpsertSchema.safeParse({ ...formData, eventId })
    if (!validation.success) {
      toast({
        title: "Błąd",
        description: validation.error.errors.map((err) => err.message).join(", "),
        variant: "destructive",
      })
      return
    }
    const body = new FormData()
    Object.entries(validation.data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        body.append(key, value.toString())
      }
    })
    if (formData.customExternalEntity) {
      body.append("customExternalEntity", formData.customExternalEntity)
    }
    try {
      const data = validation.data
      const payload = new FormData()
      payload.append("eventId", data.eventId)
      if (data.externalEntity) payload.append("externalEntity", data.externalEntity)
      if (data.transferDate) payload.append("transferDate", data.transferDate)
      if (data.settlementDate) payload.append("settlementDate", data.settlementDate)
      if (data.settlementAmount !== undefined)
        payload.append("settlementAmount", data.settlementAmount.toString())
      if (data.currency) payload.append("currency", data.currency)
      payload.append("status", data.status)
      if (editingId) {

        await updateSettlement(editingId, body)
        toast({ title: "Sukces", description: "Rozliczenie zaktualizowane" })
      } else {
        await createSettlement(body)

        toast({ title: "Sukces", description: "Rozliczenie dodane" })
      }
      resetForm()
      setIsFormVisible(false)
      fetchSettlements()
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się zapisać rozliczenia",
        variant: "destructive",
      })
    }
  }

  function handleEdit(settlement: Settlement) {
    const isCustom = !!settlement.customExternalEntity
    setFormData({
      settlementNumber: settlement.settlementNumber ?? "",
      settlementType: settlement.settlementType ?? "",
      externalEntity: isCustom ? "custom" : settlement.externalEntity ?? "",
      customExternalEntity: settlement.customExternalEntity ?? "",
      transferDate: settlement.transferDate?.slice(0, 10) ?? "",
      settlementDate: settlement.settlementDate?.slice(0, 10) ?? "",
      amount: settlement.amount ?? 0,
      settlementAmount: settlement.settlementAmount ?? 0,
      currency: settlement.currency ?? "PLN",
      status: settlement.status ?? "",
      paymentMethod: settlement.paymentMethod ?? "",
      notes: settlement.notes ?? "",
      description: settlement.description ?? "",
    })
    setEditingId(settlement.id)
    setIsFormVisible(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Czy na pewno chcesz usunąć to rozliczenie?")) return
    try {
      await deleteSettlement(id)
      toast({ title: "Sukces", description: "Rozliczenie usunięte" })
      fetchSettlements()
    } catch (error) {
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się usunąć rozliczenia",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <p>Ładowanie...</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rozliczenia</CardTitle>
      </CardHeader>
      <CardContent>
        {settlements.map((s) => (
          <div key={s.id} className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-medium">
                {s.customExternalEntity ?? s.externalEntity ?? "Brak kontrahenta"}
              </p>
              <p className="text-sm text-muted-foreground">
                {s.settlementAmount ?? 0} {s.currency || "PLN"}
              </p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(s)}>
                Edytuj
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>
                Usuń
              </Button>
            </div>
          </div>
        ))}

        {isFormVisible ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              placeholder="Numer ugody"
              value={formData.settlementNumber}
              onChange={(e) => setFormData({ ...formData, settlementNumber: e.target.value })}
            />
            <Input
              placeholder="Typ ugody"
              value={formData.settlementType}
              onChange={(e) => setFormData({ ...formData, settlementType: e.target.value })}
            />
            <Select
              value={formData.externalEntity}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  externalEntity: value === "none" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Podmiot zewnętrzny" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Wybierz podmiot --</SelectItem>
                <SelectItem value="ClaimXpert360">ClaimXpert360</SelectItem>
                <SelectItem value="custom">Inny podmiot...</SelectItem>
              </SelectContent>
            </Select>
            {formData.externalEntity === "custom" && (
              <Input
                placeholder="Nazwa podmiotu"
                value={formData.customExternalEntity}
                onChange={(e) =>
                  setFormData({ ...formData, customExternalEntity: e.target.value })
                }
              />
            )}
            <Input
              type="date"
              value={formData.transferDate}
              onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
            />
            <Input
              type="date"
              value={formData.settlementDate}
              onChange={(e) => setFormData({ ...formData, settlementDate: e.target.value })}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Kwota"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
              }
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Kwota"
              value={formData.settlementAmount}
              onChange={(e) =>
                setFormData({ ...formData, settlementAmount: parseFloat(e.target.value) || 0 })
              }
            />
            <Input
              placeholder="Waluta"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            />
            <Input
              placeholder="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            />
            <Input
              placeholder="Metoda płatności"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            />
            <Input
              placeholder="Notatki"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
            <Input
              placeholder="Opis"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="space-x-2">
              <Button type="submit">Zapisz</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  resetForm()
                  setIsFormVisible(false)
                }}
              >
                Anuluj
              </Button>
            </div>
          </form>
        ) : (
          <Button onClick={() => setIsFormVisible(true)}>Dodaj rozliczenie</Button>
        )}
      </CardContent>
    </Card>
  )
}

export default SettlementsSection
