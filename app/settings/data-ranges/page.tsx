"use client"

import { useEffect, useState } from "react"
import { apiService, type DataRangeDto, type CreateDataRangeDto, type UserListItemDto, type ClientDto } from "@/lib/api"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

export default function DataRangesPage() {
  const [dataRanges, setDataRanges] = useState<DataRangeDto[]>([])
  const [users, setUsers] = useState<UserListItemDto[]>([])
  const [clients, setClients] = useState<ClientDto[]>([])
  const [form, setForm] = useState<CreateDataRangeDto>({ userId: "", clientId: 0 })

  const load = async () => {
    const ranges = await apiService.getDataRanges()
    setDataRanges(ranges)
    const { items: userItems } = await apiService.getUsers()
    setUsers(userItems)
    const clientsList = await apiService.getClients()
    setClients(clientsList)
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = async () => {
    if (!form.userId || !form.clientId) return
    await apiService.createDataRange(form)
    setForm({ userId: "", clientId: 0 })
    load()
  }

  const handleDelete = async (id: number) => {
    await apiService.deleteDataRange(id)
    load()
  }

  const userName = (id: string) => users.find(u => u.id === id)?.email || id
  const clientName = (id: number) => clients.find(c => c.id === id)?.name || id

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Zakres danych</h1>
      <div className="flex flex-wrap gap-4 items-end">
        <Select value={form.userId} onValueChange={(v) => setForm({ ...form, userId: v })}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Użytkownik" />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={form.clientId ? String(form.clientId) : ""}
          onValueChange={(v) => setForm({ ...form, clientId: Number(v) })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Klient" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAdd}>Dodaj</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Użytkownik</TableHead>
            <TableHead>Klient</TableHead>
            <TableHead>Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataRanges.map((dr) => (
            <TableRow key={dr.id}>
              <TableCell>{userName(dr.userId)}</TableCell>
              <TableCell>{clientName(dr.clientId)}</TableCell>
              <TableCell>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(dr.id)}>
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
