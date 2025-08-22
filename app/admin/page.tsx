"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Shield, UserCheck, UserX, Activity, Clock, AlertTriangle } from "lucide-react"
import { apiService, type AdminSettings, type UserListItemDto } from "@/lib/api"
import Link from "next/link"

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserListItemDto[]>([])
  const [roles, setRoles] = useState<string[]>([])
  const [adminInfo, setAdminInfo] = useState<AdminSettings | null>(null)
  const [newUser, setNewUser] = useState({ userName: "", email: "", password: "" })

  useEffect(() => {
    apiService.getAdminSettings().then(setAdminInfo).catch((err) => {
      console.error("Failed to load admin settings", err)
    })
    apiService
      .getUsers()
      .then(({ items }) => {
        setUsers(items)
        setRoles(Array.from(new Set(items.map((u) => u.role).filter(Boolean))) as string[])
      })
      .catch((err) => console.error("Failed to load users", err))
  }, [])

  const handleAddUser = async () => {
    try {
      await apiService.createUser(newUser)
      setNewUser({ userName: "", email: "", password: "" })
      const { items } = await apiService.getUsers()
      setUsers(items)
      setRoles(Array.from(new Set(items.map((u) => u.role).filter(Boolean))) as string[])
    } catch (err) {
      console.error("Failed to add user", err)
    }
  }

  const activeUsers = users.filter((user) => user.status === "active").length
  const inactiveUsers = users.filter((user) => user.status === "inactive").length
  const suspendedUsers = users.filter((user) => user.status === "suspended").length
  const totalUsers = users.length

  const recentUsers = users
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const stats = [
    {
      title: "Wszyscy użytkownicy",
      value: totalUsers,
      description: "Łączna liczba użytkowników",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Aktywni użytkownicy",
      value: activeUsers,
      description: "Użytkownicy z aktywnym statusem",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Nieaktywni użytkownicy",
      value: inactiveUsers,
      description: "Użytkownicy nieaktywni",
      icon: UserX,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Zdefiniowane role",
      value: roles.length,
      description: "Dostępne role w systemie",
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const getStatusBadge = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Przegląd systemu zarządzania użytkownikami i rolami</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Najnowsi użytkownicy
            </CardTitle>
            <CardDescription>Ostatnio zarejestrowani użytkownicy w systemie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(user.status)}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/admin/users">Zobacz wszystkich użytkowników</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Status systemu
            </CardTitle>
            <CardDescription>Aktualny stan systemu administracji</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status serwera</span>
                <Badge
                  className={
                    adminInfo
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {adminInfo ? "Online" : "Offline"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Czas serwera</span>
                <span className="text-sm text-foreground">
                  {adminInfo
                    ? new Date(adminInfo.serverTime).toLocaleString()
                    : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Wersja systemu</span>
                <span className="text-sm text-foreground">
                  {adminInfo?.version ?? "-"}
                </span>
              </div>
              {suspendedUsers > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">
                    {suspendedUsers} użytkownik{suspendedUsers > 1 ? "ów" : ""} zawieszony
                    {suspendedUsers > 1 ? "ch" : ""}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/admin/roles">Zarządzaj rolami</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/admin/permissions">Zobacz uprawnienia</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dodaj użytkownika</CardTitle>
          <CardDescription>Utwórz nowego użytkownika w systemie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Nazwa użytkownika"
              value={newUser.userName}
              onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <Input
              placeholder="Hasło"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>
          <Button className="mt-4" onClick={handleAddUser}>
            Dodaj użytkownika
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
