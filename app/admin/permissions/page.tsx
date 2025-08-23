"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Lock, Users, Shield, Settings } from "lucide-react"
import { adminService } from "@/lib/services/admin-service"
import type { Role } from "@/lib/types/admin"

export default function PermissionsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const permissionsByCategory = adminService.getPermissionsByCategory()
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    adminService.getRoles().then(setRoles).catch(() => setRoles([]))
  }, [])

  const filteredPermissionsByCategory = Object.entries(permissionsByCategory).reduce(
    (acc, [category, permissions]) => {
      if (searchTerm) {
        const filtered = permissions.filter(
          (permission) =>
            permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permission.description.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        if (filtered.length > 0) {
          acc[category] = filtered
        }
      } else {
        acc[category] = permissions
      }
      return acc
    },
    {} as Record<string, (typeof permissionsByCategory)[string]>,
  )

  const getRolesWithPermission = (permissionId: string) => {
    return roles.filter((role) =>
      role.permissions?.some((permission) => permission.id === permissionId),
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Użytkownicy":
        return Users
      case "Role":
        return Shield
      case "System":
        return Settings
      default:
        return Lock
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Użytkownicy":
        return "text-blue-600"
      case "Role":
        return "text-purple-600"
      case "System":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Zarządzanie uprawnieniami</h2>
        <p className="text-muted-foreground">Przeglądaj uprawnienia systemu i ich przypisania do ról</p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Wyszukiwanie uprawnień
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Szukaj uprawnień..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Permissions by Category */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Wszystkie</TabsTrigger>
          {Object.keys(permissionsByCategory).map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {Object.entries(filteredPermissionsByCategory).map(([category, permissions]) => {
            const IconComponent = getCategoryIcon(category)
            const colorClass = getCategoryColor(category)

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 ${colorClass}`} />
                    {category}
                    <Badge variant="secondary">{permissions.length}</Badge>
                  </CardTitle>
                  <CardDescription>Uprawnienia związane z kategorią {category.toLowerCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {permissions.map((permission) => {
                      const rolesWithPermission = getRolesWithPermission(permission.id)

                      return (
                        <div key={permission.id} className="border rounded-lg p-4 space-y-3">
                          <div>
                            <h4 className="font-medium text-foreground">{permission.name}</h4>
                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Zasób: {permission.resource}</span>
                            <span>•</span>
                            <span>Akcja: {permission.action}</span>
                          </div>
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-muted-foreground">Przypisane do ról:</span>
                            <div className="flex flex-wrap gap-1">
                              {rolesWithPermission.length === 0 ? (
                                <Badge variant="outline" className="text-xs">
                                  Brak przypisań
                                </Badge>
                              ) : (
                                rolesWithPermission.map((role) => (
                                  <Badge
                                    key={role.id}
                                    variant="outline"
                                    className="text-xs"
                                    style={{ borderColor: role.color }}
                                  >
                                    {role.name}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {Object.entries(permissionsByCategory).map(([category, permissions]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(getCategoryIcon(category), {
                    className: `h-5 w-5 ${getCategoryColor(category)}`,
                  })}
                  {category}
                  <Badge variant="secondary">{permissions.length}</Badge>
                </CardTitle>
                <CardDescription>Uprawnienia związane z kategorią {category.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {permissions
                    .filter(
                      (permission) =>
                        !searchTerm ||
                        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        permission.description.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                    .map((permission) => {
                      const rolesWithPermission = getRolesWithPermission(permission.id)

                      return (
                        <div key={permission.id} className="border rounded-lg p-4 space-y-3">
                          <div>
                            <h4 className="font-medium text-foreground">{permission.name}</h4>
                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Zasób: {permission.resource}</span>
                            <span>•</span>
                            <span>Akcja: {permission.action}</span>
                          </div>
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-muted-foreground">Przypisane do ról:</span>
                            <div className="flex flex-wrap gap-1">
                              {rolesWithPermission.length === 0 ? (
                                <Badge variant="outline" className="text-xs">
                                  Brak przypisań
                                </Badge>
                              ) : (
                                rolesWithPermission.map((role) => (
                                  <Badge
                                    key={role.id}
                                    variant="outline"
                                    className="text-xs"
                                    style={{ borderColor: role.color }}
                                  >
                                    {role.name}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
