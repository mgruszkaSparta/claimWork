"use client"

import { useEffect, useState } from "react"
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { apiService, type RequiredDocumentTypeDto, type CreateRequiredDocumentDto } from "@/lib/api"

export default function RequiredDocumentsPage() {
  const [items, setItems] = useState<RequiredDocumentTypeDto[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<CreateRequiredDocumentDto>({
    name: "",
    description: "",
    category: "",
    claimObjectTypeId: undefined,
    isRequired: true,
    isActive: true,
  })

  const load = async () => {
    const data = await apiService.getRequiredDocuments()
    setItems(data)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await apiService.updateRequiredDocument(editingId, formData)
      } else {
        await apiService.createRequiredDocument(formData)
      }
      setFormData({
        name: "",
        description: "",
        category: "",
        claimObjectTypeId: undefined,
        isRequired: true,
        isActive: true,
      })
      setEditingId(null)
      load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEdit = (item: RequiredDocumentTypeDto) => {
    setFormData({
      name: item.name,
      description: item.description ?? "",
      category: item.category ?? "",
      claimObjectTypeId: item.claimObjectTypeId,
      isRequired: item.isRequired,
      isActive: item.isActive,
    })
    setEditingId(item.id)
  }

  const handleDelete = async (id: number) => {
    await apiService.deleteRequiredDocument(id)
    load()
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Wymagane dokumenty</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <Label htmlFor="name">Nazwa</Label>
          <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="category">Kategoria</Label>
          <Input id="category" value={formData.category ?? ""} onChange={e => setFormData({ ...formData, category: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="description">Opis</Label>
          <Input id="description" value={formData.description ?? ""} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="objectType">Typ obiektu</Label>
          <Select
            value={formData.claimObjectTypeId ? String(formData.claimObjectTypeId) : ""}
            onValueChange={v => setFormData({ ...formData, claimObjectTypeId: v ? Number(v) : undefined })}
          >
            <SelectTrigger id="objectType" className="w-full">
              <SelectValue placeholder="Wybierz" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Komunikacja</SelectItem>
              <SelectItem value="2">Mienie</SelectItem>
              <SelectItem value="3">Transport</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="isRequired" checked={formData.isRequired} onCheckedChange={checked => setFormData({ ...formData, isRequired: !!checked })} />
          <Label htmlFor="isRequired">Wymagany</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="isActive" checked={formData.isActive} onCheckedChange={checked => setFormData({ ...formData, isActive: !!checked })} />
          <Label htmlFor="isActive">Aktywny</Label>
        </div>
        <Button type="submit">{editingId ? "Zaktualizuj" : "Dodaj"}</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nazwa</TableHead>
            <TableHead>Kategoria</TableHead>
            <TableHead>Typ obiektu</TableHead>
            <TableHead>Wymagany</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.claimObjectTypeId}</TableCell>
              <TableCell>{item.isRequired ? "Tak" : "Nie"}</TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" onClick={() => startEdit(item)}>Edytuj</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Usuń</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
