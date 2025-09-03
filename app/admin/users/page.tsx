"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, MoreHorizontal, Edit, Trash2, UserCheck, UserX, Ban, ArrowUpDown, Filter, X } from "lucide-react"
import { adminService } from "@/lib/services/admin-service"
import type { User, UserFilters, Role } from "@/lib/types/admin"
import { UserFormDialog } from "@/components/admin/user-form-dialog"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<UserFilters["sortBy"]>("name")
  const [sortOrder, setSortOrder] = useState<UserFilters["sortOrder"]>("asc")
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    adminService.getRoles().then(setRoles)
  }, [])

  const filters: UserFilters = useMemo(() => {
    const baseFilters: UserFilters = {
      sortBy,
      sortOrder,
    }

    if (searchTerm) baseFilters.search = searchTerm
    if (statusFilter !== "all") baseFilters.status = statusFilter as User["status"]
    if (roleFilter !== "all") baseFilters.roleId = roleFilter

    return baseFilters
  }, [searchTerm, statusFilter, roleFilter, sortBy, sortOrder])

  useEffect(() => {
    adminService.getUsers(filters).then(setUsers)
  }, [filters])

  const handleSort = (field: UserFilters["sortBy"]) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const refreshUsers = () => {
    adminService.getUsers(filters).then(setUsers)
  }

  const handleStatusChange = async (userId: string, newStatus: User["status"]) => {
    await adminService.updateUser(userId, { status: newStatus })
    refreshUsers()
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Czy na pewno chcesz usunąć tego użytkownika?")) {
      await adminService.deleteUser(userId)
      refreshUsers()
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setUserDialogOpen(true)
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setUserDialogOpen(true)
  }

  const handleSaveUser = async (userData: User & { password?: string }) => {
    if (selectedUser) {
      await adminService.updateUser(userData.id, userData)
    } else if (userData.password) {
      await adminService.createUser({ ...userData, password: userData.password })
    }
    setUserDialogOpen(false)
    refreshUsers()
  }

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktywny</Badge>
      case "inactive":
        return <Badge variant="secondary">Nieaktywny</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Zawieszony</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Zarządzanie użytkownikami</h2>
          <p className="text-muted-foreground">Przeglądaj i zarządzaj użytkownikami systemu</p>
        </div>
        <Button className="gap-2" onClick={handleAddUser}>
          <Plus className="h-4 w-4" />
          Dodaj użytkownika
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtry i wyszukiwanie
          </CardTitle>
          {(searchTerm || statusFilter !== "all" || roleFilter !== "all") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setRoleFilter("all")
              }}
              aria-label="Wyczyść filtry"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Szukaj użytkowników..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie statusy</SelectItem>
                <SelectItem value="active">Aktywny</SelectItem>
                <SelectItem value="inactive">Nieaktywny</SelectItem>
                <SelectItem value="suspended">Zawieszony</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Rola" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie role</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Użytkownicy ({users.length})</CardTitle>
          <CardDescription>Lista wszystkich użytkowników w systemie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Użytkownik</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("email")}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      Email
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("createdAt")}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      Data rejestracji
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("lastLogin")}
                      className="h-auto p-0 font-medium hover:bg-transparent"
                    >
                      Ostatnie logowanie
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[70px]">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nie znaleziono użytkowników.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.avatar || "/placeholder.svg"}
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                            <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role.id} variant="outline" style={{ borderColor: role.color }}>
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.lastLogin ? formatDate(user.lastLogin) : "Nigdy"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Otwórz menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Akcje</DropdownMenuLabel>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edytuj
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status !== "active" && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleStatusChange(user.id, "active")}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Aktywuj
                              </DropdownMenuItem>
                            )}
                            {user.status !== "inactive" && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleStatusChange(user.id, "inactive")}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Dezaktywuj
                              </DropdownMenuItem>
                            )}
                            {user.status !== "suspended" && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleStatusChange(user.id, "suspended")}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Zawieś
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Usuń
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <UserFormDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        user={selectedUser}
        roles={roles}
        onSave={handleSaveUser}
      />
    </div>
  )
}
