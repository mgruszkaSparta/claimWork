"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { apiService, type ClientDto, type CreateClientDto } from "@/lib/api"

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientDto[]>([])
  const [formData, setFormData] = useState<CreateClientDto>({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    postalCode: "",
    nip: "",
    regon: "",
    isActive: true,
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  const loadClients = async () => {
    const data = await apiService.getClients()
    setClients(data)
  }

  useEffect(() => {
    loadClients()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await apiService.updateClient(editingId, formData)
    } else {
      await apiService.createClient(formData)
    }
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      city: "",
      postalCode: "",
      nip: "",
      regon: "",
      isActive: true,
    })
    setEditingId(null)
    await loadClients()
    window.dispatchEvent(new Event("clientsUpdated"))
  }

  const handleEdit = (client: ClientDto) => {
    setFormData({
      name: client.name,
      email: client.email,
      phoneNumber: client.phoneNumber,
      address: client.address,
      city: client.city,
      postalCode: client.postalCode,
      nip: client.nip,
      regon: client.regon,
      isActive: client.isActive,
    })
    setEditingId(client.id)
  }

  const handleDelete = async (id: number) => {
    await apiService.deleteClient(id)
    await loadClients()
    window.dispatchEvent(new Event("clientsUpdated"))
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Klienci</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <Label htmlFor="name">Nazwa</Label>
          <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={formData.email ?? ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="phoneNumber">Telefon</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber ?? ""}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="address">Adres</Label>
          <Input id="address" value={formData.address ?? ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Miasto</Label>
            <Input id="city" value={formData.city ?? ""} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="postalCode">Kod pocztowy</Label>
            <Input
              id="postalCode"
              value={formData.postalCode ?? ""}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nip">NIP</Label>
            <Input
              id="nip"
              value={formData.nip ?? ""}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="regon">REGON</Label>
            <Input
              id="regon"
              value={formData.regon ?? ""}
              onChange={(e) => setFormData({ ...formData, regon: e.target.value })}
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button type="submit">{editingId ? "Aktualizuj" : "Dodaj"}</Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null)
                setFormData({
                  name: "",
                  email: "",
                  phoneNumber: "",
                  address: "",
                  city: "",
                  postalCode: "",
                  nip: "",
                  regon: "",
                  isActive: true,
                })
              }}
            >
              Anuluj
            </Button>
          )}
        </div>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nazwa</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{client.name}</TableCell>
              <TableCell>{client.email}</TableCell>
              <TableCell>{client.phoneNumber}</TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(client)}>
                  Edytuj
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(client.id)}>
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
