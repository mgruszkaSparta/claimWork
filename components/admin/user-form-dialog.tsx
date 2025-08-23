"use client"

import { useEffect, useState, FormEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { Role, User } from "@/lib/types/admin"

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  roles: Role[]
  onSave: (user: User & { password?: string }) => void
}

export function UserFormDialog({ open, onOpenChange, user, roles, onSave }: UserFormDialogProps) {
  const isEdit = !!user
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "")
  const [status, setStatus] = useState<User["status"]>("active")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setEmail(user.email)
      setRoleId(user.roles[0]?.id ?? roles[0]?.id ?? "")
      setStatus(user.status)
    } else {
      setFirstName("")
      setLastName("")
      setEmail("")
      setRoleId(roles[0]?.id ?? "")
      setStatus("active")
      setPassword("")
    }
  }, [user, roles])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const role = roles.find((r) => r.id === roleId)
    if (!role) return
    onSave({
      id: user?.id ?? "",
      firstName,
      lastName,
      email,
      roles: [role],
      status,
      createdAt: user?.createdAt ?? new Date(),
      lastLogin: user?.lastLogin,
      avatar: user?.avatar,
      password: isEdit ? undefined : password,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edytuj użytkownika" : "Nowy użytkownik"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="firstName">Imię</Label>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="lastName">Nazwisko</Label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {!isEdit && (
            <div>
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          <div>
            <Label>Rola</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz rolę" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as User["status"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktywny</SelectItem>
                <SelectItem value="inactive">Nieaktywny</SelectItem>
                <SelectItem value="suspended">Zawieszony</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">{isEdit ? "Zapisz" : "Utwórz"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
