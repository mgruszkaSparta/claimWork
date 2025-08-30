"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { apiService, type EmployeeDto, type CreateEmployeeDto, type DepartmentDto, type EmployeeRoleDto } from "@/lib/api"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeDto[]>([])
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [roles, setRoles] = useState<EmployeeRoleDto[]>([])
  const [form, setForm] = useState<CreateEmployeeDto>({
    firstName: "",
    lastName: "",
    email: "",
    departmentId: undefined,
    roleId: undefined,
  })

  const load = async () => {
    const [emps, deps, rls] = await Promise.all([
      apiService.getEmployees(),
      apiService.getDepartments(),
      apiService.getEmployeeRoles(),
    ])
    setEmployees(emps)
    setDepartments(deps)
    setRoles(rls)
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim()) return
    await apiService.createEmployee(form)
    setForm({ firstName: "", lastName: "", email: "", departmentId: undefined, roleId: undefined })
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Pracownicy</h1>
      <form onSubmit={handleSubmit} className="grid gap-2 max-w-xl">
        <div>
          <Label>Imię</Label>
          <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </div>
        <div>
          <Label>Nazwisko</Label>
          <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label>Departament</Label>
          <Select
            value={form.departmentId?.toString() ?? ""}
            onValueChange={(v) => setForm({ ...form, departmentId: v ? parseInt(v, 10) : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id.toString()}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Rola</Label>
          <Select
            value={form.roleId?.toString() ?? ""}
            onValueChange={(v) => setForm({ ...form, roleId: v ? parseInt(v, 10) : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id.toString()}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="mt-2">Dodaj</Button>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imię</TableHead>
            <TableHead>Nazwisko</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Departament</TableHead>
            <TableHead>Rola</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{e.firstName}</TableCell>
              <TableCell>{e.lastName}</TableCell>
              <TableCell>{e.email}</TableCell>
              <TableCell>{e.department?.name ?? ""}</TableCell>
              <TableCell>{e.role?.name ?? ""}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
