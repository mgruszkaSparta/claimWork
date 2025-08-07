"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, Car, User, Mail, Plus, Trash2, Save, Edit, X } from 'lucide-react'

interface RepairSchedule {
  id?: string
  eventId: string
  companyName: string
  damageNumber: string
  vehicleFleetNumber: string
  vehicleRegistration: string
  damageDate: string
  damageTime: string
  expertWaitingDate: string
  additionalInspections: string
  repairStartDate: string
  repairEndDate: string
  whyNotOperational: string
  alternativeVehiclesAvailable: boolean
  alternativeVehiclesDescription: string
  contactDispatcher: string
  contactManager: string
  status: "draft" | "submitted" | "approved" | "completed"
  createdAt?: string
  updatedAt?: string
}

interface RepairScheduleSectionProps {
  eventId: string
}

// PKS contact database
const PKS_CONTACTS = {
  "PKS Gostynin": {
    locations: {
      Gostynin: {
        dispatcher: "dyspozytornia@pksgostynin.pl",
        manager: "sogostynin@pksgostynin.pl",
      },
      Elbląg: {
        dispatcher: "elblag@pksgostynin.pl",
        manager: "p.jaglowski@pksgostynin.pl",
      },
    },
  },
  "PKS Grodzisk Maz.": {
    locations: {
      "Grodzisk Mazowiecki": {
        dispatcher: "przewozy@pksgrodzisk.com.pl",
        manager: "b.domanska@pksgrodzisk.pl",
      },
      Sosnowiec: {
        dispatcher: "slask@pksgrodzisk.pl",
        manager: "k.chajdas@pksgrodzisk.pl",
      },
      Sochaczew: {
        dispatcher: "sochaczew@pksgrodzisk.com.pl",
        manager: "m.wadecki@pksgrodzisk.pl",
      },
      Pruszków: {
        dispatcher: "pruszkow@pksgrodzisk.pl",
        manager: "m.konopka@pksgrodzisk.pl",
      },
      Warszawa: {
        dispatcher: "klementowicka@pksgrodzisk.pl",
        manager: "m.kaczor@pksgrodzisk.pl",
      },
      Żyrardów: {
        dispatcher: "zyrardow@pksgrodzisk.com.pl",
        manager: "d.pater@pksgrodzisk.pl",
      },
    },
  },
  "PKS Skierniewice": {
    locations: {
      Skierniewice: {
        dispatcher: "skierniewice@pksskierniewice.pl",
        manager: "s.marat@pksskierniewice.pl",
      },
      Łowicz: {
        dispatcher: "lowicz@pksskierniewice.pl",
        manager: "m.wadecki@pksgrodzisk.pl",
      },
      "Rawa Mazowiecka": {
        dispatcher: "rawa@pksskierniewice.pl",
        manager: "sorawa@pksskierniewice.pl",
      },
    },
  },
  "PKS Kutno": {
    locations: {
      Kutno: {
        dispatcher: "cpn@pkskutno.pl",
        manager: "i.garstka@pkskutno.pl",
      },
    },
  },
}

export const RepairScheduleSection: React.FC<RepairScheduleSectionProps> = ({ eventId }) => {
  const { toast } = useToast()
  const [schedules, setSchedules] = useState<RepairSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSchedule, setEditingSchedule] = useState<RepairSchedule | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<RepairSchedule>>({
    eventId,
    companyName: "Przedsiębiorstwo Komunikacji Samochodowej w Grodzisku Maz. Sp. z o.o.",
    damageNumber: "1",
    vehicleFleetNumber: "",
    vehicleRegistration: "",
    damageDate: "",
    damageTime: "",
    expertWaitingDate: "",
    additionalInspections: "brak",
    repairStartDate: "",
    repairEndDate: "",
    whyNotOperational: "",
    alternativeVehiclesAvailable: false,
    alternativeVehiclesDescription: "",
    contactDispatcher: "",
    contactManager: "",
    status: "draft",
  })

  useEffect(() => {
    loadSchedules()
  }, [eventId])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/repair-schedules?eventId=${eventId}`)
      if (response.ok) {
        const data = await response.json()
        setSchedules(data)
      } else {
        console.error("Failed to load repair schedules")
      }
    } catch (error) {
      console.error("Error loading repair schedules:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się załadować harmonogramów napraw",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      if (!formData.vehicleFleetNumber || !formData.vehicleRegistration || !formData.damageDate) {
        toast({
          title: "Błąd walidacji",
          description: "Wypełnij wszystkie wymagane pola",
          variant: "destructive",
        })
        return
      }

      const url = editingSchedule ? `/api/repair-schedules/${editingSchedule.id}` : "/api/repair-schedules"

      const method = editingSchedule ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }

      const savedSchedule = await response.json()

      if (editingSchedule) {
        setSchedules((prev) => prev.map((s) => (s.id === savedSchedule.id ? savedSchedule : s)))
        toast({
          title: "Sukces",
          description: "Harmonogram naprawy został zaktualizowany",
        })
      } else {
        setSchedules((prev) => [...prev, savedSchedule])
        toast({
          title: "Sukces",
          description: "Harmonogram naprawy został utworzony",
        })
      }

      resetForm()
    } catch (error) {
      console.error("Error saving repair schedule:", error)
      toast({
        title: "Błąd",
        description: `Nie udało się zapisać harmonogramu: ${error instanceof Error ? error.message : "Nieznany błąd"}`,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (scheduleId: string) => {
    try {
      const response = await fetch(`/api/repair-schedules/${scheduleId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete repair schedule")
      }

      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId))
      toast({
        title: "Sukces",
        description: "Harmonogram naprawy został usunięty",
      })
    } catch (error) {
      console.error("Error deleting repair schedule:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć harmonogramu",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      eventId,
      companyName: "Przedsiębiorstwo Komunikacji Samochodowej w Grodzisku Maz. Sp. z o.o.",
      damageNumber: "1",
      vehicleFleetNumber: "",
      vehicleRegistration: "",
      damageDate: "",
      damageTime: "",
      expertWaitingDate: "",
      additionalInspections: "brak",
      repairStartDate: "",
      repairEndDate: "",
      whyNotOperational: "",
      alternativeVehiclesAvailable: false,
      alternativeVehiclesDescription: "",
      contactDispatcher: "",
      contactManager: "",
      status: "draft",
    })
    setEditingSchedule(null)
    setShowForm(false)
  }

  const handleEdit = (schedule: RepairSchedule) => {
    setFormData(schedule)
    setEditingSchedule(schedule)
    setShowForm(true)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Szkic", color: "bg-gray-100 text-gray-800" },
      submitted: { label: "Przesłany", color: "bg-blue-100 text-blue-800" },
      approved: { label: "Zatwierdzony", color: "bg-green-100 text-green-800" },
      completed: { label: "Zakończony", color: "bg-purple-100 text-purple-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("pl-PL")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Ładowanie harmonogramów napraw...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Dodaj harmonogram
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>{editingSchedule ? "Edytuj harmonogram" : "Nowy harmonogram"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="companyName">Nazwa przedsiębiorstwa</Label>
                <Input
                  id="companyName"
                  value={formData.companyName || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="damageNumber">Nr szkody *</Label>
                <Input
                  id="damageNumber"
                  value={formData.damageNumber || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, damageNumber: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="vehicleFleetNumber">Nr taborowy *</Label>
                <Input
                  id="vehicleFleetNumber"
                  value={formData.vehicleFleetNumber || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vehicleFleetNumber: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="vehicleRegistration">Nr rejestracyjny *</Label>
                <Input
                  id="vehicleRegistration"
                  value={formData.vehicleRegistration || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, vehicleRegistration: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="damageDate">Data szkody *</Label>
                <Input
                  id="damageDate"
                  type="date"
                  value={formData.damageDate || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, damageDate: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="damageTime">Godzina szkody</Label>
                <Input
                  id="damageTime"
                  type="time"
                  value={formData.damageTime || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, damageTime: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="expertWaitingDate">Oczekiwanie na rzeczoznawcę</Label>
                <Input
                  id="expertWaitingDate"
                  type="date"
                  value={formData.expertWaitingDate || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expertWaitingDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="additionalInspections">Kolejne wyceny oględziny</Label>
                <Input
                  id="additionalInspections"
                  value={formData.additionalInspections || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, additionalInspections: e.target.value }))}
                  className="mt-1"
                  placeholder="np. brak, planowane na..."
                />
              </div>
              <div>
                <Label htmlFor="repairStartDate">Przystąpienie do naprawy</Label>
                <Input
                  id="repairStartDate"
                  type="date"
                  value={formData.repairStartDate || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, repairStartDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="repairEndDate">Zakończenie naprawy</Label>
                <Input
                  id="repairEndDate"
                  type="date"
                  value={formData.repairEndDate || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, repairEndDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            {/* Operational Status */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="whyNotOperational">Dlaczego nie mógł jeździć na linii</Label>
                <Textarea
                  id="whyNotOperational"
                  value={formData.whyNotOperational || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, whyNotOperational: e.target.value }))}
                  className="mt-1"
                  placeholder="np. poważne uszkodzenia, niebezpieczne dla pasażerów..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-base font-medium">Czy były pojazdy inne które można było użytkować?</Label>
                <RadioGroup
                  value={formData.alternativeVehiclesAvailable ? "tak" : "nie"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      alternativeVehiclesAvailable: value === "tak",
                    }))
                  }
                  className="flex space-x-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tak" id="alt-vehicles-yes" />
                    <Label htmlFor="alt-vehicles-yes">Tak</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nie" id="alt-vehicles-no" />
                    <Label htmlFor="alt-vehicles-no">Nie</Label>
                  </div>
                </RadioGroup>

                {formData.alternativeVehiclesAvailable && (
                  <div className="mt-3">
                    <Label htmlFor="alternativeVehiclesDescription">Opis dostępnych pojazdów</Label>
                    <Textarea
                      id="alternativeVehiclesDescription"
                      value={formData.alternativeVehiclesDescription || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, alternativeVehiclesDescription: e.target.value }))
                      }
                      className="mt-1"
                      placeholder="Opisz jakie pojazdy były dostępne..."
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Contacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="contactDispatcher">Kontakt - Dyspozytor</Label>
                <Input
                  id="contactDispatcher"
                  type="email"
                  value={formData.contactDispatcher || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactDispatcher: e.target.value }))}
                  className="mt-1"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="contactManager">Kontakt - Kierownik</Label>
                <Input
                  id="contactManager"
                  type="email"
                  value={formData.contactManager || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, contactManager: e.target.value }))}
                  className="mt-1"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status harmonogramu</Label>
              <Select
                value={formData.status || "draft"}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Szkic</SelectItem>
                  <SelectItem value="submitted">Przesłany</SelectItem>
                  <SelectItem value="approved">Zatwierdzony</SelectItem>
                  <SelectItem value="completed">Zakończony</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Anuluj
              </Button>
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {editingSchedule ? "Zaktualizuj" : "Zapisz"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedules List */}
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Brak harmonogramów</p>
              <p className="text-gray-400 text-sm">Kliknij "Dodaj harmonogram" aby utworzyć pierwszy</p>
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Car className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">
                        {schedule.vehicleRegistration} (Nr tab. {schedule.vehicleFleetNumber})
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Szkoda nr {schedule.damageNumber} • {formatDate(schedule.damageDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(schedule.status)}
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(schedule)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(schedule.id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Oczekiwanie na rzeczoznawcę</p>
                    <p className="font-medium">{formatDate(schedule.expertWaitingDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rozpoczęcie naprawy</p>
                    <p className="font-medium">{formatDate(schedule.repairStartDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Zakończenie naprawy</p>
                    <p className="font-medium">{formatDate(schedule.repairEndDate)}</p>
                  </div>
                </div>

                {/* Operational Status */}
                {schedule.whyNotOperational && (
                  <div>
                    <p className="text-gray-500 text-sm">Powód niezdolności do jazdy:</p>
                    <p className="text-sm">{schedule.whyNotOperational}</p>
                  </div>
                )}

                {/* Alternative Vehicles */}
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-500">Pojazdy zastępcze:</span>
                  <span className={schedule.alternativeVehiclesAvailable ? "text-green-600" : "text-red-600"}>
                    {schedule.alternativeVehiclesAvailable ? "Dostępne" : "Niedostępne"}
                  </span>
                </div>

                {/* Contacts */}
                {(schedule.contactDispatcher || schedule.contactManager) && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {schedule.contactDispatcher && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>Dyspozytor: {schedule.contactDispatcher}</span>
                      </div>
                    )}
                    {schedule.contactManager && (
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>Kierownik: {schedule.contactManager}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
