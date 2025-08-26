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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  Car,
  User,
  Mail,
  Plus,
  Trash2,
  Save,
  Edit,
  X,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Timer,
  FileText,
  Phone,
  Wrench,
  TrendingUp,
  Activity,
  CircleCheck,
  CircleAlert,
  PlayCircle,
  Printer,
} from "lucide-react"
import { pksData } from "@/lib/pks-data"
import {
  getRepairSchedules,
  createRepairSchedule,
  updateRepairSchedule,
  deleteRepairSchedule,
} from "@/lib/api/repair-schedules"

interface RepairSchedule {
  id?: string
  eventId: string
  branchId?: string
  companyName: string
  vehicleFleetNumber: string
  vehicleRegistration?: string
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

interface RepairScheduleFormData {
  id?: string
  eventId: string
  branchId?: string
  companyName: string
  vehicleFleetNumber: string
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
}

interface RepairScheduleSectionProps {
  eventId: string
}

export const RepairScheduleSection: React.FC<RepairScheduleSectionProps> = ({ eventId }) => {
  const { toast } = useToast()
  const [schedules, setSchedules] = useState<RepairSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSchedule, setEditingSchedule] = useState<RepairSchedule | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState<RepairScheduleFormData>({
    eventId,
    branchId: "",
    companyName: "Przedsiębiorstwo Komunikacji Samochodowej w Grodzisku Maz. Sp. z o.o.",
    vehicleFleetNumber: "",
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
      const data = await getRepairSchedules(eventId)
      setSchedules(data)
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

  const handleBranchChange = (branchId: string) => {
    const branch = pksData.find((b) => b.id === branchId)
    setFormData((prev) => ({
      ...prev,
      branchId,
      companyName: branch?.company || prev.companyName,
      contactDispatcher: branch?.employees.find((e) => e.role === "dyspozytor")?.email || "",
      contactManager: branch?.employees.find((e) => e.role === "kierownik")?.email || "",
    }))
  }

  const handleSubmit = async () => {
    try {
      if (!formData.vehicleFleetNumber) {
        toast({
          title: "Błąd walidacji",
          description: "Wypełnij wszystkie wymagane pola",
          variant: "destructive",
        })
        return
      }

      const savedSchedule = editingSchedule
        ? await updateRepairSchedule(editingSchedule.id!, formData)
        : await createRepairSchedule(formData)

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
    if (!confirm("Czy na pewno chcesz usunąć harmonogram?")) return
    try {
      await deleteRepairSchedule(scheduleId)
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
      branchId: "",
      companyName: "Przedsiębiorstwo Komunikacji Samochodowej w Grodzisku Maz. Sp. z o.o.",
      vehicleFleetNumber: "",
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
    setFormData({
      id: schedule.id,
      eventId: schedule.eventId,
      branchId: schedule.branchId,
      companyName: schedule.companyName,
      vehicleFleetNumber: schedule.vehicleFleetNumber,
      expertWaitingDate: schedule.expertWaitingDate,
      additionalInspections: schedule.additionalInspections,
      repairStartDate: schedule.repairStartDate,
      repairEndDate: schedule.repairEndDate,
      whyNotOperational: schedule.whyNotOperational,
      alternativeVehiclesAvailable: schedule.alternativeVehiclesAvailable,
      alternativeVehiclesDescription: schedule.alternativeVehiclesDescription,
      contactDispatcher: schedule.contactDispatcher,
      contactManager: schedule.contactManager,
      status: schedule.status,
    })
    setEditingSchedule(schedule)
    setShowForm(true)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        label: "Szkic",
        icon: FileText,
        className: "status-draft",
      },
      submitted: {
        label: "Przesłany",
        icon: PlayCircle,
        className: "status-submitted",
      },
      approved: {
        label: "Zatwierdzony",
        icon: CircleCheck,
        className: "status-approved",
      },
      completed: {
        label: "Zakończony",
        icon: CheckCircle2,
        className: "status-completed",
      },
      "in-progress": {
        label: "W trakcie",
        icon: Timer,
        className: "status-in-progress",
      },
      delayed: {
        label: "Opóźniony",
        icon: CircleAlert,
        className: "status-delayed",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const IconComponent = config.icon

    return (
      <Badge
        className={`${config.className} flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-lg`}
      >
        <IconComponent className="h-4 w-4" />
        {config.label}
      </Badge>
    )
  }

  const getStatusIndicator = (schedule: RepairSchedule) => {
    const now = new Date()
    const repairStart = schedule.repairStartDate ? new Date(schedule.repairStartDate) : null
    const repairEnd = schedule.repairEndDate ? new Date(schedule.repairEndDate) : null

    if (schedule.status === "completed") {
      return { status: "completed", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle2 }
    }

    if (repairStart && now > repairStart && !repairEnd) {
      return { status: "in-progress", color: "text-orange-600", bgColor: "bg-orange-100", icon: Timer }
    }

    if (repairStart && now > repairStart && (!repairEnd || now > repairEnd)) {
      return { status: "delayed", color: "text-red-600", bgColor: "bg-red-100", icon: CircleAlert }
    }

    return { status: schedule.status, color: "text-blue-600", bgColor: "bg-blue-100", icon: PlayCircle }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("pl-PL")
  }

  const getProgressPercentage = (schedule: RepairSchedule) => {
    let progress = 0
    if (schedule.expertWaitingDate) progress += 33
    if (schedule.repairStartDate) progress += 33
    if (schedule.repairEndDate) progress += 34
    return progress
  }

  const getRepairStages = (schedule: RepairSchedule) => {
    const stages = [
      {
        id: "draft",
        label: "Szkic",
        icon: FileText,
        completed: schedule.status !== "draft",
        date: schedule.createdAt,
      },
      {
        id: "submitted",
        label: "Przesłany",
        icon: PlayCircle,
        completed: ["submitted", "approved", "completed"].includes(schedule.status),
        date: schedule.updatedAt,
      },
      {
        id: "approved",
        label: "Zatwierdzony",
        icon: CircleCheck,
        completed: ["approved", "completed"].includes(schedule.status),
        date: schedule.repairStartDate,
      },
      {
        id: "completed",
        label: "Zakończony",
        icon: CheckCircle2,
        completed: schedule.status === "completed",
        date: schedule.repairEndDate,
      },
    ]
    return stages
  }

  const RepairProgressStages = ({ schedule }: { schedule: RepairSchedule }) => {
    const stages = getRepairStages(schedule)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Postęp naprawy - 4 etapy
          </span>
          <span className="font-bold text-primary">{stages.filter((s) => s.completed).length}/4 etapów</span>
        </div>

        <div className="flex items-center justify-between relative">
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted"></div>
          <div
            className="absolute top-6 left-6 h-0.5 bg-primary transition-all duration-1000 ease-out"
            style={{
              width: `${Math.max(0, (stages.filter((s) => s.completed).length - 1) * (100 / (stages.length - 1)))}%`,
            }}
          ></div>

          {stages.map((stage) => {
            const IconComponent = stage.icon
            return (
              <div key={stage.id} className="flex flex-col items-center space-y-2 relative z-10">
                <div
                  className={`
                  w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300
                  ${
                    stage.completed
                      ? "bg-primary border-primary text-primary-foreground shadow-lg"
                      : "bg-background border-muted-foreground/30 text-muted-foreground"
                  }
                `}
                >
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className={`text-xs font-medium ${stage.completed ? "text-primary" : "text-muted-foreground"}`}>
                    {stage.label}
                  </div>
                  {stage.date && <div className="text-xs text-muted-foreground mt-0.5">{formatDate(stage.date)}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              <p className="text-xl font-semibold text-foreground">Ładowanie harmonogramów</p>
            </div>
            <p className="text-muted-foreground">Przygotowujemy dane dla Ciebie...</p>
          </div>
        </div>
      </div>
    )
  }

  return (

    <div className="space-y-8 animate-fade-in w-full min-h-screen">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Harmonogram i naprawy</h2>
        <p className="text-sm text-gray-600">
          Zarządzaj planem napraw pojazdu. Dodaj nowy harmonogram lub edytuj istniejące wpisy.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-medium"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nowy harmonogram
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => (open ? setShowForm(true) : resetForm())}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {editingSchedule ? "Edytuj harmonogram" : "Nowy harmonogram naprawy"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Podstawowe informacje
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="branch" className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 className="h-4 w-4 text-primary" />
                    Oddział
                  </Label>
                  <Select value={formData.branchId} onValueChange={handleBranchChange}>
                    <SelectTrigger
                      id="branch"
                      className="h-12 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20"
                    >
                      <SelectValue placeholder="Wybierz oddział" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {pksData.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id} className="rounded-lg">
                          {branch.company} - {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="companyName">Nazwa przedsiębiorstwa</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                    className="h-12 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="vehicleFleetNumber" className="flex items-center gap-2 text-sm font-semibold">
                    <Car className="h-4 w-4 text-primary" />
                    Nr taborowy *
                  </Label>
                  <Input
                    id="vehicleFleetNumber"
                    value={formData.vehicleFleetNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, vehicleFleetNumber: e.target.value }))}
                    className="h-12 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Harmonogram napraw
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="expertWaitingDate" className="flex items-center gap-2 text-sm font-semibold">
                    <Timer className="h-4 w-4 text-primary" />
                    Oczekiwanie na rzeczoznawcę
                  </Label>
                  <Input
                    id="expertWaitingDate"
                    type="date"
                    value={formData.expertWaitingDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expertWaitingDate: e.target.value }))}
                    className="h-12 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="additionalInspections">Kolejne wyceny oględziny</Label>
                  <Input
                    id="additionalInspections"
                    value={formData.additionalInspections}
                    onChange={(e) => setFormData((prev) => ({ ...prev, additionalInspections: e.target.value }))}
                    className="h-12 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20"
                    placeholder="np. brak, planowane na..."
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="repairStartDate" className="flex items-center gap-2 text-sm font-semibold">
                    <Wrench className="h-4 w-4 text-accent" />
                    Przystąpienie do naprawy
                  </Label>
                  <Input
                    id="repairStartDate"
                    type="date"
                    value={formData.repairStartDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, repairStartDate: e.target.value }))}
                    className="h-12 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="repairEndDate" className="flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Zakończenie naprawy
                  </Label>
                  <Input
                    id="repairEndDate"
                    type="date"
                    value={formData.repairEndDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, repairEndDate: e.target.value }))}
                    className="h-12 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-accent" />
                Status operacyjny
              </h3>
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="whyNotOperational" className="flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="h-4 w-4 text-accent" />
                    Dlaczego nie mógł jeździć na linii
                  </Label>
                  <Textarea
                    id="whyNotOperational"
                    value={formData.whyNotOperational}
                    onChange={(e) => setFormData((prev) => ({ ...prev, whyNotOperational: e.target.value }))}
                    placeholder="np. poważne uszkodzenia, niebezpieczne dla pasażerów..."
                    rows={4}
                    className="resize-none h-28 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Car className="h-4 w-4 text-primary" />
                    Czy były pojazdy inne które można było używać?
                  </Label>
                  <RadioGroup
                    value={formData.alternativeVehiclesAvailable ? "tak" : "nie"}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        alternativeVehiclesAvailable: value === "tak",
                      }))
                    }
                    className="flex gap-8"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="tak"
                        id="alt-vehicles-yes"
                        className="h-5 w-5 rounded-full border-border focus:border-primary/50 focus:ring-primary/20"
                      />
                      <Label htmlFor="alt-vehicles-yes" className="font-normal">
                        Tak
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value="nie"
                        id="alt-vehicles-no"
                        className="h-5 w-5 rounded-full border-border focus:border-primary/50 focus:ring-primary/20"
                      />
                      <Label htmlFor="alt-vehicles-no" className="font-normal">
                        Nie
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.alternativeVehiclesAvailable && (
                    <div className="space-y-3 mt-4">
                      <Label htmlFor="alternativeVehiclesDescription">Opis dostępnych pojazdów</Label>
                      <Textarea
                        id="alternativeVehiclesDescription"
                        value={formData.alternativeVehiclesDescription}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, alternativeVehiclesDescription: e.target.value }))
                        }
                        placeholder="Opisz jakie pojazdy były dostępne..."
                        rows={3}
                        className="resize-none h-24 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Kontakty
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="contactDispatcher" className="flex items-center gap-2 text-sm font-semibold">
                    <Phone className="h-4 w-4 text-primary" />
                    Kontakt - Dyspozytor
                  </Label>
                  <Input
                    id="contactDispatcher"
                    type="email"
                    value={formData.contactDispatcher}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contactDispatcher: e.target.value }))}
                    className="h-12 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="contactManager" className="flex items-center gap-2 text-sm font-semibold">
                    <User className="h-4 w-4 text-accent" />
                    Kontakt - Kierownik
                  </Label>
                  <Input
                    id="contactManager"
                    type="email"
                    value={formData.contactManager}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contactManager: e.target.value }))}
                    className="h-12 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="status" className="flex items-center gap-2 text-sm font-semibold">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Status harmonogramu
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger className="h-12 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="draft" className="rounded-lg">
                      Szkic
                    </SelectItem>
                    <SelectItem value="submitted" className="rounded-lg">
                      Przesłany
                    </SelectItem>
                    <SelectItem value="approved" className="rounded-lg">
                      Zatwierdzony
                    </SelectItem>
                    <SelectItem value="completed" className="rounded-lg">
                      Zakończony
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-border">
              <Button
                variant="outline"
                onClick={resetForm}
                className="px-8 py-3 rounded-xl border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 bg-transparent"
              >
                <X className="h-4 w-4 mr-2" />
                Anuluj
              </Button>

              <Button
                onClick={handleSubmit}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingSchedule ? "Zaktualizuj" : "Zapisz"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 w-full grid-cols-1">
        {schedules.length === 0 ? (
          <Card className="col-span-full w-full border-2 border-dashed border-border bg-muted/20 rounded-2xl animate-fade-in">
            <CardContent className="text-center py-16">
              <div className="space-y-4">
                <div className="p-6 bg-primary/10 rounded-2xl w-fit mx-auto">
                  <Calendar className="h-16 w-16 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-foreground">Brak harmonogramów</p>
                  <p className="text-muted-foreground">
                    Rozpocznij zarządzanie flotą - utwórz pierwszy harmonogram naprawy
                  </p>
                </div>
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground mt-6 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Dodaj pierwszy harmonogram
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule, index) => {
            const statusIndicator = getStatusIndicator(schedule)
            return (
              <Card
                key={schedule.id}
                className="w-full hover:shadow-lg transition-all duration-300 border bg-card rounded-2xl overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`h-2 ${statusIndicator.bgColor}`}></div>

                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-4 ${statusIndicator.bgColor} rounded-2xl border`}>
                        <statusIndicator.icon className={`h-7 w-7 ${statusIndicator.color}`} />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold text-foreground">
                          {schedule.vehicleRegistration}
                        </CardTitle>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-lg">
                            <FileText className="h-3 w-3" />
                            Nr tab. {schedule.vehicleFleetNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(statusIndicator.status)}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.print()}
                          className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(schedule)}
                          className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(schedule.id!)}
                          className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <RepairProgressStages schedule={schedule} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Wrench className="h-3 w-3" />
                        Rozpoczęcie naprawy
                      </p>
                      <p className="font-medium">{formatDate(schedule.repairStartDate)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" />
                        Zakończenie naprawy
                      </p>
                      <p className="font-medium">{formatDate(schedule.repairEndDate)}</p>
                    </div>
                  </div>

                  {schedule.whyNotOperational && (
                    <div className="p-5 bg-muted/50 rounded-2xl">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" />
                        Powód niezdolności do jazdy
                      </p>
                      <p className="text-sm">{schedule.whyNotOperational}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span
                        className={`flex items-center gap-2 ${schedule.alternativeVehiclesAvailable ? "text-green-500" : "text-accent"}`}
                      >
                        <Car className="h-3 w-3" />
                        Pojazdy zastępcze: {schedule.alternativeVehiclesAvailable ? "Dostępne" : "Niedostępne"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {schedule.contactDispatcher && (
                        <span className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {schedule.contactDispatcher}
                        </span>
                      )}
                      {schedule.contactManager && (
                        <span className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {schedule.contactManager}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

