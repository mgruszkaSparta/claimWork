'use client';

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { AuthWrapper } from '@/components/auth-wrapper'
import { ProtectedRoute } from '@/components/protected-route'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, TrendingUp, Users, Search, Filter, CheckSquare } from 'lucide-react';

interface User {
  username: string
  email?: string
  roles?: string[]
}

interface PageProps {
  user?: User
  onLogout?: () => void
}

interface Task {
  title: string
  due: string
}

function HomePage({ user, onLogout }: PageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    // additional effects can go here
  }, [])

  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch("/api/notes?category=task")
        if (!res.ok) {
          console.warn(
            "Failed to fetch tasks:",
            res.status,
            res.statusText,
          )
          return
        }
        const data = await res.json()
        const mapped = data.map((note: any) => ({
          title: note.title || note.content,
          due: note.createdAt
            ? new Date(note.createdAt).toISOString().split("T")[0]
            : "",
        }))
        setTasks(mapped)
      } catch (err) {
        console.error("Error fetching tasks:", err)
      }
    }
    loadTasks()
  }, [])

  const initialStats = [
    { title: "Zarejestrowane szkody", value: "0", changeType: "positive" as const, icon: FileText, color: "blue" },
    { title: "Aktywne szkody", value: "0", changeType: "positive" as const, icon: Clock, color: "yellow" },
    { title: "Zamknięte szkody", value: "0", changeType: "positive" as const, icon: CheckSquare, color: "green" }
  ];
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/dashboard/client");
        if (!res.ok) throw new Error("Failed to fetch dashboard stats");
        const data = await res.json();
        setStats([
          { ...initialStats[0], value: data.totalClaims?.toString() },
          { ...initialStats[1], value: data.activeClaims?.toString() },
          { ...initialStats[2], value: data.closedClaims?.toString() }
        ]);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    }
    loadStats();
  }, []);


  const statusOverview = [
    { status: "Nowe", count: 45, percentage: 36, color: "bg-blue-500" },
    { status: "W trakcie", count: 89, percentage: 28, color: "bg-yellow-500" },
    { status: "Zakończone", count: 1113, percentage: 89, color: "bg-green-500" },
    { status: "Odrzucone", count: 23, percentage: 2, color: "bg-red-500" },
  ];

  const recentClaims = [
    {
      id: "SPARTA/2025/0348",
      client: "JPM GLOBAL",
      type: "OC SPRAWCY",
      amount: "45,000 PLN",
      status: "W trakcie",
      date: "2025-01-08",
    },
    {
      id: "SPARTA/2025/0347",
      client: "KUROWSKI SP. Z O.O.",
      type: "AC",
      amount: "23,500 PLN",
      status: "Nowa",
      date: "2025-01-07",
    },
    {
      id: "SPARTA/2025/0346",
      client: "MATRAK SPÓŁKA JAWNA",
      type: "CARGO",
      amount: "78,900 PLN",
      status: "Zakończona",
      date: "2025-01-06",
    },
  ];

  const quickActions = [
    { title: "Wyszukaj szkodę", icon: Search, color: "bg-gray-600 hover:bg-gray-700" },
    { title: "Raporty", icon: TrendingUp, color: "bg-green-600 hover:bg-green-700" },
    { title: "Filtry", icon: Filter, color: "bg-purple-600 hover:bg-purple-700" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="ml-16 flex flex-col min-h-screen">
        <Header onMenuClick={() => {}} user={user} onLogout={onLogout} />
        <main className="flex-1 p-0">
          <div className="w-full">

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                System zarządzania szkodami
              </h1>
              <p className="mt-2 text-gray-600">
                Zarządzaj szkodami samochodowymi w jednym miejscu
              </p>
              {user && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    Zalogowany jako: <span className="font-semibold">{user.username}</span> ({user.roles?.join(', ')})
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-6">
               
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <Card key={`stat-${stat.title}`} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                              {stat.change && (
                                <p
                                  className={`text-sm ${
                                    stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                                  }`}
                                >
                                  {stat.change} vs poprzedni miesiąc
                                </p>
                              )}
                            </div>
                            <div
                              className={`p-3 rounded-full ${
                                stat.color === "blue"
                                  ? "bg-blue-100"
                                  : stat.color === "yellow"
                                    ? "bg-yellow-100"
                                    : stat.color === "green"
                                      ? "bg-green-100"
                                      : "bg-red-100"
                              }`}
                            >
                              <Icon
                                className={`h-6 w-6 ${
                                  stat.color === "blue"
                                    ? "text-blue-600"
                                    : stat.color === "yellow"
                                      ? "text-yellow-600"
                                      : stat.color === "green"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <span>Przegląd statusów</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {statusOverview.map((item, index) => (
                          <div key={`status-${item.status}`} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${item.color}`} />
                              <span className="text-sm font-medium text-gray-700">{item.status}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600">{item.count}</span>
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${item.color}`}
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-8">{item.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Claims */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span>Ostatnie szkody</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentClaims.map((claim, index) => (
                          <div key={claim.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{claim.id}</p>
                              <p className="text-sm text-gray-600">{claim.client}</p>
                              <p className="text-xs text-gray-500">
                                {claim.type} • {claim.date}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">{claim.amount}</p>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  claim.status === "Nowa"
                                    ? "bg-blue-100 text-blue-800"
                                    : claim.status === "W trakcie"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {claim.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span>Szybkie akcje</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {quickActions.map((action, index) => {
                        const Icon = action.icon
                        return (
                          <Button
                            key={`quick-action-${action.title}`}
                            variant="outline"
                          >
                            <Icon className="h-6 w-6" />
                            <span className="text-sm">{action.title}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                      <span>Zadania</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tasks.map((task, index) => (
                        <li
                          key={`task-${task.title}`}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-700">{task.title}</span>
                          <span className="text-xs text-gray-500">{task.due}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
        </main>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <ProtectedRoute roles={["Admin", "User"]}>
      <AuthWrapper>
        <HomePage />
      </AuthWrapper>
    </ProtectedRoute>
  )
}
