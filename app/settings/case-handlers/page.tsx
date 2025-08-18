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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"
import {
  apiService,
  type CaseHandlerDto,
  type CreateCaseHandlerDto,
} from "@/lib/api"

export default function CaseHandlersPage() {
  const [handlers, setHandlers] = useState<CaseHandlerDto[]>([])
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<keyof CaseHandlerDto>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<CreateCaseHandlerDto>({
    name: "",
    code: "",
    email: "",
    phone: "",
    department: "",
    isActive: true,
  })

  const loadHandlers = async () => {
    const data = await apiService.getCaseHandlers()
    setHandlers(data)
  }

  useEffect(() => {
    loadHandlers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!formData.name.trim()) {
      setError("Nazwa jest wymagana")
      return
    }
    try {
      if (editingId !== null) {
        await apiService.updateCaseHandler(editingId, formData)
      } else {
        await apiService.createCaseHandler(formData)
      }
      setFormData({
        name: "",
        code: "",
        email: "",
        phone: "",
        department: "",
        isActive: true,
      })
      setEditingId(null)
      loadHandlers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEdit = (handler: CaseHandlerDto) => {
    setFormData({
      name: handler.name,
      code: handler.code ?? "",
      email: handler.email ?? "",
      phone: handler.phone ?? "",
      department: handler.department ?? "",
      isActive: handler.isActive,
    })
    setEditingId(handler.id)
  }

  const handleDelete = async (id: number) => {
    setError("")
    try {
      await apiService.deleteCaseHandler(id)
      loadHandlers()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const toggleSort = (column: keyof CaseHandlerDto) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const filtered = handlers.filter((h) => {
    const term = search.toLowerCase()
    const matchesSearch =
      h.name.toLowerCase().includes(term) ||
      (h.code && h.code.toLowerCase().includes(term)) ||
      (h.email && h.email.toLowerCase().includes(term)) ||
      (h.phone && h.phone.toLowerCase().includes(term)) ||
      (h.department && h.department.toLowerCase().includes(term))
    const matchesActive =
      activeFilter === "all"
        ? true
        : activeFilter === "active"
        ? h.isActive
        : !h.isActive
    return matchesSearch && matchesActive
  })

  const sorted = [...filtered].sort((a, b) => {
    const aVal = (a[sortBy] ?? "") as string
    const bVal = (b[sortBy] ?? "") as string
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const total = sorted.length
  const totalPages = Math.ceil(total / pageSize)
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Likwidatorzy</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <Label htmlFor="name">Nazwa</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="code">Kod</Label>
          <Input
            id="code"
            value={formData.code ?? ""}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={formData.email ?? ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            value={formData.phone ?? ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="department">Dział</Label>
          <Input
            id="department"
            value={formData.department ?? ""}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isActive: !!checked })
            }
          />
          <Label htmlFor="isActive">Aktywny</Label>
        </div>
        <div className="flex space-x-2">
          <Button type="submit">{editingId !== null ? "Aktualizuj" : "Dodaj"}</Button>
          {editingId !== null && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null)
                setFormData({
                  name: "",
                  code: "",
                  email: "",
                  phone: "",
                  department: "",
                  isActive: true,
                })
              }}
            >
              Anuluj
            </Button>
          )}
        </div>
      </form>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Szukaj"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-xs"
        />
        <Select
          value={activeFilter}
          onValueChange={(v) => {
            setActiveFilter(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtr" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszyscy</SelectItem>
            <SelectItem value="active">Aktywni</SelectItem>
            <SelectItem value="inactive">Nieaktywni</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => toggleSort("name")} className="cursor-pointer">
              Nazwa <ArrowUpDown className="inline h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => toggleSort("code")} className="cursor-pointer">
              Kod <ArrowUpDown className="inline h-4 w-4" />
            </TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Dział</TableHead>
            <TableHead>Aktywny</TableHead>
            <TableHead>Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((h) => (
            <TableRow key={h.id}>
              <TableCell>{h.name}</TableCell>
              <TableCell>{h.code}</TableCell>
              <TableCell>{h.email}</TableCell>
              <TableCell>{h.phone}</TableCell>
              <TableCell>{h.department}</TableCell>
              <TableCell>{h.isActive ? "Tak" : "Nie"}</TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => startEdit(h)}>
                  Edytuj
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(h.id)}>
                  Usuń
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setPage(i + 1)}
                  isActive={page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

