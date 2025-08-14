"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { ArrowUpDown } from "lucide-react"
import { apiService, type UserListItemDto } from "@/lib/api"

export default function UsersPage() {
  const { user } = useAuth()
  const canManage = user?.roles?.includes("admin")

  const [users, setUsers] = useState<UserListItemDto[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [role, setRole] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [total, setTotal] = useState(0)
  const [sortBy, setSortBy] = useState<keyof UserListItemDto>("lastName")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const loadUsers = async () => {
    const { items, totalCount } = await apiService.getUsers({
      search,
      role,
      status,
      page,
      pageSize,
      sortBy,
      sortOrder,
    })
    setUsers(items)
    setTotal(totalCount)
  }

  useEffect(() => {
    loadUsers()
  }, [search, role, status, page, sortBy, sortOrder])

  const toggleSelectAll = (checked: boolean) => {
    setSelected(checked ? users.map((u) => u.id) : [])
  }

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id),
    )
  }

  const toggleSort = (column: keyof UserListItemDto) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleBulk = async (
    action: "activate" | "deactivate" | "assignRole" | "delete",
    roleValue?: string,
  ) => {
    await apiService.bulkUpdateUsers({
      action,
      userIds: selected,
      role: roleValue,
    })
    setSelected([])
    loadUsers()
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Użytkownicy</h1>

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
          value={role ?? ""}
          onValueChange={(v) => {
            setPage(1)
            setRole(v || undefined)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rola" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Wszystkie role</SelectItem>
            <SelectItem value="user">Użytkownik</SelectItem>
            <SelectItem value="admin">Administrator</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status ?? ""}
          onValueChange={(v) => {
            setPage(1)
            setStatus(v || undefined)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Wszystkie statusy</SelectItem>
            <SelectItem value="active">Aktywny</SelectItem>
            <SelectItem value="inactive">Nieaktywny</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {canManage && selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleBulk("activate")}>Aktywuj</Button>
          <Button onClick={() => handleBulk("deactivate")}>Dezaktywuj</Button>
          <Select onValueChange={(v) => handleBulk("assignRole", v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Przypisz rolę" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Użytkownik</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="destructive" onClick={() => handleBulk("delete")}>
            Usuń
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">
              <Checkbox
                checked={selected.length === users.length && users.length > 0}
                onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                aria-label="Zaznacz wszystkie"
              />
            </TableHead>
            <TableHead
              onClick={() => toggleSort("firstName")}
              className="cursor-pointer"
            >
              Imię
              <ArrowUpDown className="inline h-4 w-4 ml-2" />
            </TableHead>
            <TableHead
              onClick={() => toggleSort("lastName")}
              className="cursor-pointer"
            >
              Nazwisko
              <ArrowUpDown className="inline h-4 w-4 ml-2" />
            </TableHead>
            <TableHead
              onClick={() => toggleSort("email")}
              className="cursor-pointer"
            >
              Email
              <ArrowUpDown className="inline h-4 w-4 ml-2" />
            </TableHead>
            <TableHead
              onClick={() => toggleSort("role")}
              className="cursor-pointer"
            >
              Rola
              <ArrowUpDown className="inline h-4 w-4 ml-2" />
            </TableHead>
            <TableHead
              onClick={() => toggleSort("status")}
              className="cursor-pointer"
            >
              Status
              <ArrowUpDown className="inline h-4 w-4 ml-2" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow
              key={u.id}
              data-state={selected.includes(u.id) ? "selected" : undefined}
            >
              <TableCell>
                <Checkbox
                  checked={selected.includes(u.id)}
                  onCheckedChange={(checked) => toggleSelect(u.id, !!checked)}
                />
              </TableCell>
              <TableCell>{u.firstName}</TableCell>
              <TableCell>{u.lastName}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                {u.status === "active" ? "Aktywny" : "Nieaktywny"}
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
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

