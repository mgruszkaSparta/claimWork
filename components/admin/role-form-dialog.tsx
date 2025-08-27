"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminService } from "@/lib/services/admin-service"
import type { Role } from "@/lib/types/admin"

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null
  onSave: (role: Role) => void
}

const roleColors = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
]

export function RoleFormDialog({ open, onOpenChange, role, onSave }: RoleFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: roleColors[0],
    permissionIds: [] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const permissionsByCategory = adminService.getPermissionsByCategory()
  const isEditing = !!role

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        color: role.color,
        permissionIds: role.permissions.map((permission) => permission.id),
      })
    } else {
      setFormData({
        name: "",
        description: "",
        color: roleColors[0],
        permissionIds: [],
      })
    }
    setErrors({})
  }, [role, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nazwa roli jest wymagana"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Opis roli jest wymagany"
    }

    if (formData.permissionIds.length === 0) {
      newErrors.permissions = "Wybierz przynajmniej jedno uprawnienie"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return

    const allPermissions = Object.values(permissionsByCategory).flat()
    const selectedPermissions = allPermissions.filter((permission) => formData.permissionIds.includes(permission.id))

    const roleData: Role = {
      id: role?.id || `role-${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
      permissions: selectedPermissions,
      isSystem: role?.isSystem || false,
    }

    onSave(roleData)
    onOpenChange(false)
  }

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: checked
        ? [...prev.permissionIds, permissionId]
        : prev.permissionIds.filter((id) => id !== permissionId),
    }))
  }

  const handleCategoryToggle = (category: string, checked: boolean) => {
    const categoryPermissions = permissionsByCategory[category]
    const categoryPermissionIds = categoryPermissions.map((p) => p.id)

    setFormData((prev) => ({
      ...prev,
      permissionIds: checked
        ? [...new Set([...prev.permissionIds, ...categoryPermissionIds])]
        : prev.permissionIds.filter((id) => !categoryPermissionIds.includes(id)),
    }))
  }

  const isCategorySelected = (category: string) => {
    const categoryPermissions = permissionsByCategory[category]
    return categoryPermissions.every((permission) => formData.permissionIds.includes(permission.id))
  }

  const isCategoryPartiallySelected = (category: string) => {
    const categoryPermissions = permissionsByCategory[category]
    const selectedCount = categoryPermissions.filter((permission) =>
      formData.permissionIds.includes(permission.id),
    ).length
    return selectedCount > 0 && selectedCount < categoryPermissions.length
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edytuj rolę" : "Dodaj nową rolę"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Wprowadź zmiany w roli." : "Wypełnij formularz, aby dodać nową rolę do systemu."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa roli</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className={errors.name ? "border-destructive" : ""}
                placeholder="np. Moderator"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis roli</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className={errors.description ? "border-destructive" : ""}
                placeholder="Opisz zakres odpowiedzialności tej roli"
                rows={3}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label>Kolor roli</Label>
              <div className="flex gap-2">
                {roleColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 ${
                      formData.color === color ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <Label>Uprawnienia roli</Label>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Wszystkie</TabsTrigger>
                {Object.keys(permissionsByCategory).map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={isCategorySelected(category)}
                        ref={(el) => {
                          if (el) el.indeterminate = isCategoryPartiallySelected(category)
                        }}
                        onCheckedChange={(checked) => handleCategoryToggle(category, checked as boolean)}
                      />
                      <Label htmlFor={`category-${category}`} className="font-medium cursor-pointer">
                        {category}
                      </Label>
                      <Badge variant="secondary">{permissions.length}</Badge>
                    </div>
                    <div className="ml-6 space-y-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={formData.permissionIds.includes(permission.id)}
                            onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`permission-${permission.id}`} className="cursor-pointer">
                              {permission.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                <TabsContent key={category} value={category} className="space-y-4">
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}-tab`}
                        checked={isCategorySelected(category)}
                        ref={(el) => {
                          if (el) el.indeterminate = isCategoryPartiallySelected(category)
                        }}
                        onCheckedChange={(checked) => handleCategoryToggle(category, checked as boolean)}
                      />
                      <Label htmlFor={`category-${category}-tab`} className="font-medium cursor-pointer">
                        Zaznacz wszystkie w kategorii {category}
                      </Label>
                    </div>
                    <div className="space-y-3">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2 p-2 border rounded">
                          <Checkbox
                            id={`permission-${permission.id}-tab`}
                            checked={formData.permissionIds.includes(permission.id)}
                            onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`permission-${permission.id}-tab`} className="cursor-pointer font-medium">
                              {permission.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>Zasób: {permission.resource}</span>
                              <span>•</span>
                              <span>Akcja: {permission.action}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            {errors.permissions && <p className="text-sm text-destructive">{errors.permissions}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSave}>{isEditing ? "Zapisz zmiany" : "Dodaj rolę"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
