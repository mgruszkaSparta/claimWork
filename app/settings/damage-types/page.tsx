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
  type DamageTypeDto,
  type CreateDamageTypeDto,
  type RiskTypeDto,
} from "@/lib/api"

export default function DamageTypesPage() {
  const [damageTypes, setDamageTypes] = useState<DamageTypeDto[]>([])
  const [riskTypes, setRiskTypes] = useState<RiskTypeDto[]>([])
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<keyof DamageTypeDto>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<CreateDamageTypeDto>({
    code: "",
    name: "",
    description: "",
    riskTypeId: "",
    isActive: true,
  })

  const loadDamageTypes = async () => {
    const data = await apiService.getDamageTypes()
    setDamageTypes(data)
  }

  const loadRiskTypes = async () => {
    const data = await apiService.getRiskTypes()
    setRiskTypes(data)
  }

  useEffect(() => {
    loadDamageTypes()
    loadRiskTypes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!formData.code.trim() || !formData.name.trim() || !formData.riskTypeId) {
      setError("Kod, nazwa i typ ryzyka są wymagane")
      return
    }
    try {
      if (editingId !== null) {
        await apiService.updateDamageType(editingId, formData)
      } else {
        await apiService.createDamageType(formData)
      }
      setFormData({
        code: "",
        name: "",
        description: "",
        riskTypeId: "",
        isActive: true,
      })
      setEditingId(null)
      loadDamageTypes()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEdit = (dt: DamageTypeDto) => {
    setFormData({
      code: dt.code,
      name: dt.name,
      description: dt.description ?? "",
      riskTypeId: dt.riskTypeId,
      isActive: dt.isActive,
    })
    setEditingId(dt.id)
  }

  const handleDelete = async (id: number) => {
    setError("")
    try {
      await apiService.deleteDamageType(id)
      loadDamageTypes()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const toggleSort = (column: keyof DamageTypeDto) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const filtered = damageTypes.filter((dt) => {
    const matchesSearch =
      dt.name.toLowerCase().includes(search.toLowerCase()) ||
      dt.code.toLowerCase().includes(search.toLowerCase())
    const matchesActive =
      activeFilter === "all"
        ? true
        : activeFilter === "active"
        ? dt.isActive
        : !dt.isActive
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
      <h1 className="text-2xl font-semibold">Typy szkód</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {error && <p className="text-red-500">{error}</p>}
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
            value={formData.description ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="riskType">Typ ryzyka</Label>
          <Select
            value={formData.riskTypeId}
            onValueChange={(v) => setFormData({ ...formData, riskTypeId: v })}
          >
            <SelectTrigger id="riskType" className="w-full">
              <SelectValue placeholder="Wybierz" />
            </SelectTrigger>
            <SelectContent>
              {riskTypes.map((rt) => (
                <SelectItem key={rt.id} value={rt.id}>
                  {rt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  code: "",
                  name: "",
                  description: "",
                  riskTypeId: "",
                  isActive: true,
                })
              }}
            >
              Anuluj
            </Button>
          )}
        </div>
      </form>

      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Szukaj..."
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
          className="max-w-xs"
        />
        <Select
          value={activeFilter}
          onValueChange={(v) => {
            setPage(1)
            setActiveFilter(v)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="active">Aktywne</SelectItem>
            <SelectItem value="inactive">Nieaktywne</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              onClick={() => toggleSort("code")}
              className="cursor-pointer"
            >
              Kod <ArrowUpDown className="inline h-4 w-4 ml-2" />
            </TableHead>
            <TableHead
              onClick={() => toggleSort("name")}
              className="cursor-pointer"
            >
              Nazwa <ArrowUpDown className="inline h-4 w-4 ml-2" />
            </TableHead>
            <TableHead>Typ ryzyka</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((dt) => (
            <TableRow key={dt.id}>
              <TableCell>{dt.code}</TableCell>
              <TableCell>{dt.name}</TableCell>
              <TableCell>{dt.riskTypeName}</TableCell>
              <TableCell>{dt.isActive ? "Aktywny" : "Nieaktywny"}</TableCell>
              <TableCell className="space-x-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(dt)}>
                  Edytuj
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(dt.id)}
                >
                  Usuń
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }).map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={page === i + 1}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={
                page >= totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

