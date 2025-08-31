"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { apiService, type EmployeeRoleDto, type CreateEmployeeRoleDto } from "@/lib/api"

export default function EmployeeRolesPage() {
  const [roles, setRoles] = useState<EmployeeRoleDto[]>([])
  const [name, setName] = useState("")

  const load = async () => {
    const data = await apiService.getEmployeeRoles()
    setRoles(data)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await apiService.createEmployeeRole({ name } as CreateEmployeeRoleDto)
    setName("")
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Role pracowników</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nazwa" />
        <Button type="submit">Dodaj</Button>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nazwa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
