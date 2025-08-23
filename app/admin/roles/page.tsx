"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Users, Filter } from "lucide-react"
import { adminService } from "@/lib/services/admin-service"
import type { Role, User } from "@/lib/types/admin"
import { RoleFormDialog } from "@/components/admin/role-form-dialog"

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [systemFilter, setSystemFilter] = useState<string>("all")
  const [sortOrder] = useState<'asc' | 'desc'>("asc")
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const [roles, setRoles] = useState<Role[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    adminService.getRoles().then(setRoles)
    adminService.getUsers().then(setUsers)
  }, [])

  const filteredRoles = useMemo(() => {
    let result = [...roles]

    if (searchTerm) {
      result = result.filter((role) => role.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (systemFilter !== "all") {
      const isSystem = systemFilter === "system"
      result = result.filter((role) => (role.isSystem ?? false) === isSystem)
    }

    result.sort((a, b) => {
      const compare = a.name.localeCompare(b.name)
      return sortOrder === "asc" ? compare : -compare
    })

    return result
  }, [roles, searchTerm, systemFilter, sortOrder])

  const getUserCountForRole = (roleId: string) => {
    return users.filter((user) => user.roles.some((role) => role.id === roleId)).length
  }

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    if (role?.isSystem) {
      alert("Nie można usunąć roli systemowej!")
      return
    }

    if (confirm("Czy na pewno chcesz usunąć tę rolę?")) {
      // W rzeczywistej aplikacji tutaj byłoby usuwanie roli
      alert("Rola została usunięta")
    }
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setRoleDialogOpen(true)
  }

  const handleAddRole = () => {
    setSelectedRole(null)
    setRoleDialogOpen(true)
  }

  const handleSaveRole = (roleData: Role) => {
    if (selectedRole) {
      adminService.updateRole(roleData.id, roleData)
    } else {
      // W rzeczywistej aplikacji tutaj byłoby dodawanie nowej roli
      console.log("Dodawanie nowej roli:", roleData)
    }
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Zarządzanie rolami</h2>
          <p className="text-muted-foreground">Przeglądaj i zarządzaj rolami użytkowników</p>
        </div>
        <Button className="gap-2" onClick={handleAddRole}>
          <Plus className="h-4 w-4" />
          Dodaj rolę
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtry i wyszukiwanie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Szukaj ról..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={systemFilter} onValueChange={setSystemFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Typ roli" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie role</SelectItem>
                <SelectItem value="system">Role systemowe</SelectItem>
                <SelectItem value="custom">Role niestandardowe</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Roles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex items-center justify-center h-24">
              <p className="text-muted-foreground">Nie znaleziono ról.</p>
            </CardContent>
          </Card>
        ) : (
          filteredRoles.map((role) => (
            <Card key={role.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: role.color }} />
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    {role.isSystem && (
                      <Badge variant="secondary" className="text-xs">
                        Systemowa
                      </Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Otwórz menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Akcje</DropdownMenuLabel>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditRole(role)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edytuj
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        Przypisz użytkowników
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!role.isSystem && (
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Usuń
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="text-sm">{role.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Użytkownicy:</span>
                  <Badge variant="outline">{getUserCountForRole(role.id)}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Uprawnienia:</span>
                  <Badge variant="outline">{role.permissions.length}</Badge>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Główne uprawnienia:</span>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <Badge key={permission.id} variant="secondary" className="text-xs">
                        {permission.name}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{role.permissions.length - 3} więcej
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Role Form Dialog */}
      <RoleFormDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        role={selectedRole}
        onSave={handleSaveRole}
      />
    </div>
  )
}
