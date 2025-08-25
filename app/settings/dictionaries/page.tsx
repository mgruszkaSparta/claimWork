"use client"

import { useState } from "react"
import { useDictionary } from "@/hooks/use-dictionaries"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const dictionaryOptions = [
  { value: "casehandlers", label: "Likwidatorzy" },
  { value: "countries", label: "Kraje" },
  { value: "currencies", label: "Waluty" },
  { value: "insurance-companies", label: "Firmy ubezpieczeniowe" },
  { value: "leasing-companies", label: "Firmy leasingowe" },
  { value: "vehicle-types", label: "Typy pojazdów" },
  { value: "claim-statuses", label: "Statusy zgłoszeń" },
  { value: "priorities", label: "Priorytety" },
  { value: "event-statuses", label: "Statusy zdarzeń" },
  { value: "payment-methods", label: "Metody płatności" },
  { value: "contract-types", label: "Typy umów" },
  { value: "document-statuses", label: "Statusy dokumentów" },
  { value: "risk-types", label: "Typy ryzyka" },
  { value: "damage-types", label: "Typy szkód" },
]

export default function DictionariesPage() {
  const [type, setType] = useState(dictionaryOptions[0].value)
  const { data, createItem, updateItem, deleteItem } = useDictionary(type)
  const [editingId, setEditingId] = useState<string | number | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
  })

  const resetForm = () => {
    setFormData({ code: "", name: "", description: "", isActive: true })
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId !== null) {
      await updateItem(editingId, formData)
    } else {
      await createItem(formData)
    }
    resetForm()
  }

  const startEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      code: item.code ?? "",
      name: item.name ?? "",
      description: item.description ?? "",
      isActive: item.isActive,
    })
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Słowniki</h1>
      <div className="max-w-xs">
        <Label htmlFor="dict">Słownik</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger id="dict">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dictionaryOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <Label htmlFor="code">Kod</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="name">Nazwa</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="description">Opis</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(v) =>
              setFormData({ ...formData, isActive: v === true })
            }
          />
          <Label htmlFor="isActive">Aktywny</Label>
        </div>
        <div className="space-x-2">
          <Button type="submit">{editingId !== null ? "Zapisz" : "Dodaj"}</Button>
          {editingId !== null && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Anuluj
            </Button>
          )}
        </div>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kod</TableHead>
            <TableHead>Nazwa</TableHead>
            <TableHead>Opis</TableHead>
            <TableHead>Aktywny</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.code}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                <Checkbox checked={item.isActive} disabled />
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" onClick={() => startEdit(item)}>
                  Edytuj
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteItem(item.id)}
                >
                  Usuń
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

