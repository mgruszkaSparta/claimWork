"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { apiService, type DepartmentDto, type CreateDepartmentDto } from "@/lib/api"

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [name, setName] = useState("")

  const load = async () => {
    const data = await apiService.getDepartments()
    setDepartments(data)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await apiService.createDepartment({ name } as CreateDepartmentDto)
    setName("")
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Departamenty</h1>
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
          {departments.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
