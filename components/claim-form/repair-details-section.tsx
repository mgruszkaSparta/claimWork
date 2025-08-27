"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  createRepairDetail,
  deleteRepairDetail,
  getRepairDetails,
  updateRepairDetail,
  repairDetailUpsertSchema,
  type RepairDetail,
} from "@/lib/api/repair-details"
import { pksData, type Employee } from "@/lib/pks-data"
import {
  Plus,
  Trash2,
  Save,
  Edit,
  X,
  Building2,
  User,
  Car,
  Calendar,
  Timer,
  Wrench,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

interface RepairDetailsSectionProps {
  eventId: string
  autoShowForm?: boolean
  onAutoShowFormHandled?: () => void
}

const initialFormData: Omit<RepairDetail, "id" | "eventId" | "createdAt" | "updatedAt"> = {
  branchId: "",
  employeeEmail: "",
  replacementVehicleRequired: false,
  replacementVehicleInfo: "",
  vehicleTabNumber: "",
  vehicleRegistration: "",
  damageDateTime: "",
  appraiserWaitingDate: "",
  repairStartDate: "",
  repairEndDate: "",
  otherVehiclesAvailable: false,
  otherVehiclesInfo: "",
  bodyworkHours: 0,
  paintingHours: 0,
  assemblyHours: 0,
  otherWorkHours: 0,
  otherWorkDescription: "",
  damageDescription: "",
  additionalDescription: "",
  status: "draft",
}

export const RepairDetailsSection: React.FC<RepairDetailsSectionProps> = ({
  eventId,
  autoShowForm,
  onAutoShowFormHandled,
}) => {
  const { toast } = useToast()
  const [details, setDetails] = useState<RepairDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<RepairDetail | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    loadDetails()
  }, [eventId])

  useEffect(() => {
    if (autoShowForm) {
      setShowForm(true)
      onAutoShowFormHandled?.()
    }
  }, [autoShowForm, onAutoShowFormHandled])

  const loadDetails = async () => {
    try {
      setLoading(true)
      const data = await getRepairDetails(eventId)
      setDetails(data)
    } catch (error) {
      console.error("Error loading repair details:", error)
      toast({ title: "Błąd", description: "Nie udało się załadować szczegółów naprawy", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleBranchChange = (branchId: string) => {
    const branch = pksData.find((b) => b.id === branchId)
    setEmployees(branch ? branch.employees : [])
    setFormData((prev) => ({ ...prev, branchId, employeeEmail: "" }))
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setEditing(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = repairDetailUpsertSchema.safeParse({ ...formData, eventId })
    if (!validation.success) {
      toast({
        title: "Błąd",
        description: validation.error.errors.map((err) => err.message).join(", "),
        variant: "destructive",
      })
      return
    }

    try {
      if (editing) {
        await updateRepairDetail(editing.id, { ...formData, eventId })
        toast({ title: "Sukces", description: "Opis naprawy został zaktualizowany" })
      } else {
        await createRepairDetail({ ...formData, eventId })
        toast({ title: "Sukces", description: "Opis naprawy został dodany" })
      }
      resetForm()
      loadDetails()
    } catch (error) {
      console.error("Error saving repair detail:", error)
      toast({ title: "Błąd", description: "Nie udało się zapisać opisu", variant: "destructive" })
    }
  }

  const handleEdit = (detail: RepairDetail) => {
    setFormData({
      branchId: detail.branchId,
      employeeEmail: detail.employeeEmail,
      replacementVehicleRequired: detail.replacementVehicleRequired,
      replacementVehicleInfo: detail.replacementVehicleInfo || "",
      vehicleTabNumber: detail.vehicleTabNumber,
      vehicleRegistration: detail.vehicleRegistration,
      damageDateTime: detail.damageDateTime
        ? new Date(detail.damageDateTime).toISOString().slice(0, 16)
        : "",
      appraiserWaitingDate: detail.appraiserWaitingDate ? detail.appraiserWaitingDate.slice(0, 10) : "",
      repairStartDate: detail.repairStartDate ? detail.repairStartDate.slice(0, 10) : "",
      repairEndDate: detail.repairEndDate ? detail.repairEndDate.slice(0, 10) : "",
      otherVehiclesAvailable: detail.otherVehiclesAvailable,
      otherVehiclesInfo: detail.otherVehiclesInfo || "",
      bodyworkHours: detail.bodyworkHours,
      paintingHours: detail.paintingHours,
      assemblyHours: detail.assemblyHours,
      otherWorkHours: detail.otherWorkHours,
      otherWorkDescription: detail.otherWorkDescription || "",
      damageDescription: detail.damageDescription || "",
      additionalDescription: detail.additionalDescription || "",
      status: detail.status,
    })
    handleBranchChange(detail.branchId)
    setEditing(detail)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteRepairDetail(id)
      toast({ title: "Sukces", description: "Opis naprawy został usunięty" })
      loadDetails()
    } catch (error) {
      console.error("Error deleting repair detail:", error)
      toast({ title: "Błąd", description: "Nie udało się usunąć opisu", variant: "destructive" })
    }
  }

  const getStatusBadge = (status: RepairDetail["status"]) => {
    const statusConfig = {
      draft: { label: "Szkic", icon: FileText, className: "status-draft" },
      "in-progress": { label: "W trakcie", icon: Timer, className: "status-in-progress" },
      completed: { label: "Zakończony", icon: CheckCircle2, className: "status-completed" },
    }
    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <Badge className={`${config.className} flex items-center gap-1 px-2 py-1 rounded-lg`}> 
        <Icon className="h-3 w-3" /> {config.label}
      </Badge>
    )
  }

  const formatDate = (value: string) => {
    if (!value) return "-"
    return new Date(value).toLocaleDateString("pl-PL")
  }

  const getTotalHours = (detail: RepairDetail) => {
    return detail.bodyworkHours + detail.paintingHours + detail.assemblyHours + detail.otherWorkHours
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Ładowanie szczegółów naprawy...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <Dialog open={showForm} onOpenChange={(open) => (open ? setShowForm(true) : resetForm())}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> {editing ? "Edytuj opis naprawy" : "Nowy opis naprawy"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Informacje podstawowe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="branch" className="flex items-center gap-2 text-sm font-semibold">
                      <Building2 className="h-4 w-4 text-primary" /> Oddział
                    </Label>
                    <Select value={formData.branchId} onValueChange={handleBranchChange}>
                      <SelectTrigger id="branch" className="h-12 rounded-xl border-border">
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
                    <Label htmlFor="employee" className="flex items-center gap-2 text-sm font-semibold">
                      <User className="h-4 w-4 text-primary" /> Pracownik
                    </Label>
                    <Select
                      value={formData.employeeEmail}
                      onValueChange={(value) => setFormData((p) => ({ ...p, employeeEmail: value }))}
                      disabled={!formData.branchId}
                    >
                      <SelectTrigger id="employee" className="h-12 rounded-xl border-border">
                        <SelectValue placeholder="Wybierz pracownika" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {employees.map((emp) => (
                          <SelectItem key={emp.email} value={emp.email} className="rounded-lg">
                            {emp.name} ({emp.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="vehicleTabNumber">Nr taborowy</Label>
                    <Input
                      id="vehicleTabNumber"
                      value={formData.vehicleTabNumber}
                      onChange={(e) => setFormData((p) => ({ ...p, vehicleTabNumber: e.target.value }))}
                      className="h-12 rounded-xl border-border"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="vehicleRegistration">Nr rejestracyjny</Label>
                    <Input
                      id="vehicleRegistration"
                      value={formData.vehicleRegistration}
                      onChange={(e) => setFormData((p) => ({ ...p, vehicleRegistration: e.target.value }))}
                      className="h-12 rounded-xl border-border"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Daty i terminy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="damageDateTime">Data i godzina szkody</Label>
                    <Input
                      id="damageDateTime"
                      type="datetime-local"
                      value={formData.damageDateTime}
                      onChange={(e) => setFormData((p) => ({ ...p, damageDateTime: e.target.value }))}
                      className="h-12 rounded-xl border-border"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="appraiserWaitingDate">Oczekiwanie na rzeczoznawcę</Label>
                    <Input
                      id="appraiserWaitingDate"
                      type="date"
                      value={formData.appraiserWaitingDate}
                      onChange={(e) => setFormData((p) => ({ ...p, appraiserWaitingDate: e.target.value }))}
                      className="h-12 rounded-xl border-border"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="repairStartDate">Przystąpienie do naprawy</Label>
                    <Input
                      id="repairStartDate"
                      type="date"
                      value={formData.repairStartDate}
                      onChange={(e) => setFormData((p) => ({ ...p, repairStartDate: e.target.value }))}
                      className="h-12 rounded-xl border-border"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="repairEndDate">Zakończenie naprawy</Label>
                    <Input
                      id="repairEndDate"
                      type="date"
                      value={formData.repairEndDate}
                      onChange={(e) => setFormData((p) => ({ ...p, repairEndDate: e.target.value }))}
                      className="h-12 rounded-xl border-border"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Damage description */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-accent" /> Opis uszkodzeń
                </h3>
                <Textarea
                  id="damageDescription"
                  value={formData.damageDescription}
                  onChange={(e) => setFormData((p) => ({ ...p, damageDescription: e.target.value }))}
                  placeholder="Opisz uszkodzenia..."
                  rows={4}
                  className="rounded-xl border-border focus:border-primary/50"
                />
              </div>

              {/* Vehicle options */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" /> Opcje pojazdów
                </h3>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="otherVehiclesAvailable"
                        checked={formData.otherVehiclesAvailable}
                        onCheckedChange={(checked) =>
                          setFormData((p) => ({ ...p, otherVehiclesAvailable: !!checked }))
                        }
                      />
                      <Label htmlFor="otherVehiclesAvailable">Były dostępne inne pojazdy</Label>
                    </div>
                    {formData.otherVehiclesAvailable && (
                      <Textarea
                        id="otherVehiclesInfo"
                        value={formData.otherVehiclesInfo}
                        onChange={(e) => setFormData((p) => ({ ...p, otherVehiclesInfo: e.target.value }))}
                        placeholder="Opisz dostępne pojazdy..."
                        rows={3}
                        className="rounded-xl border-border"
                      />
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="replacementVehicleRequired"
                        checked={formData.replacementVehicleRequired}
                        onCheckedChange={(checked) =>
                          setFormData((p) => ({ ...p, replacementVehicleRequired: !!checked }))
                        }
                      />
                      <Label htmlFor="replacementVehicleRequired">Potrzebny pojazd zastępczy</Label>
                    </div>
                    {formData.replacementVehicleRequired && (
                      <Textarea
                        id="replacementVehicleInfo"
                        value={formData.replacementVehicleInfo}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, replacementVehicleInfo: e.target.value }))
                        }
                        placeholder="Opis pojazdu zastępczego..."
                        rows={3}
                        className="rounded-xl border-border"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Work hours */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Timer className="h-5 w-5 text-primary" /> Godziny pracy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="bodyworkHours">Blacharskie</Label>
                    <Input
                      id="bodyworkHours"
                      type="number"
                      step="0.1"
                      value={formData.bodyworkHours}
                      onChange={(e) => setFormData((p) => ({ ...p, bodyworkHours: parseFloat(e.target.value) || 0 }))}
                      className="h-12 rounded-xl border-border"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="paintingHours">Lakiernicze</Label>
                    <Input
                      id="paintingHours"
                      type="number"
                      step="0.1"
                      value={formData.paintingHours}
                      onChange={(e) => setFormData((p) => ({ ...p, paintingHours: parseFloat(e.target.value) || 0 }))}
                      className="h-12 rounded-xl border-border"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="assemblyHours">Montażowe</Label>
                    <Input
                      id="assemblyHours"
                      type="number"
                      step="0.1"
                      value={formData.assemblyHours}
                      onChange={(e) => setFormData((p) => ({ ...p, assemblyHours: parseFloat(e.target.value) || 0 }))}
                      className="h-12 rounded-xl border-border"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="otherWorkHours">Inne</Label>
                    <Input
                      id="otherWorkHours"
                      type="number"
                      step="0.1"
                      value={formData.otherWorkHours}
                      onChange={(e) => setFormData((p) => ({ ...p, otherWorkHours: parseFloat(e.target.value) || 0 }))}
                      className="h-12 rounded-xl border-border"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="otherWorkDescription">Opis innych prac</Label>
                  <Input
                    id="otherWorkDescription"
                    value={formData.otherWorkDescription}
                    onChange={(e) => setFormData((p) => ({ ...p, otherWorkDescription: e.target.value }))}
                    className="h-12 rounded-xl border-border"
                  />
                </div>
                <div className="bg-muted/50 p-4 rounded-xl flex justify-between">
                  <span className="text-sm font-medium">Łącznie:</span>
                  <span className="font-bold text-primary">
                    {(formData.bodyworkHours + formData.paintingHours + formData.assemblyHours + formData.otherWorkHours).toFixed(1)} rbh
                  </span>
                </div>
              </div>

              {/* Additional info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" /> Informacje dodatkowe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Textarea
                    id="additionalDescription"
                    value={formData.additionalDescription}
                    onChange={(e) => setFormData((p) => ({ ...p, additionalDescription: e.target.value }))}
                    placeholder="Dodatkowe informacje..."
                    rows={3}
                    className="rounded-xl border-border"
                  />
                  <div className="space-y-3">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData((p) => ({ ...p, status: value as RepairDetail["status"] }))}
                    >
                      <SelectTrigger id="status" className="h-12 rounded-xl border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="draft" className="rounded-lg">
                          Szkic
                        </SelectItem>
                        <SelectItem value="in-progress" className="rounded-lg">
                          W trakcie
                        </SelectItem>
                        <SelectItem value="completed" className="rounded-lg">
                          Zakończony
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

            <div className="flex justify-between items-center pt-8 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="px-8 py-3 rounded-xl border-border hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4 mr-2" /> Anuluj
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl shadow"
              >
                <Save className="h-4 w-4 mr-2" /> {editing ? "Zaktualizuj" : "Zapisz"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {details.length === 0 ? (
          <Card className="border-2 border-dashed border-border bg-muted/20 rounded-2xl">
            <CardContent className="text-center py-16">
              <div className="space-y-4">
                <div className="p-6 bg-primary/10 rounded-2xl w-fit mx-auto">
                  <FileText className="h-16 w-16 text-primary" />
                </div>
              <p className="text-xl font-semibold text-foreground">Brak opisów naprawy</p>
              <p className="text-muted-foreground">Dodaj pierwszy opis, aby rozpocząć</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        details.map((detail, index) => (
          <Card
              key={detail.id}
              className="hover:shadow-lg transition-all duration-300 border bg-card rounded-2xl overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl border">
                      <Wrench className="h-7 w-7 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-2xl font-bold text-foreground">
                        {detail.vehicleRegistration}
                      </CardTitle>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-lg">
                          <FileText className="h-3 w-3" /> Nr tab. {detail.vehicleTabNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(detail.status)}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(detail)}
                        className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        title="Czy na pewno chcesz usunąć opis?"
                        description="Ta akcja nie może być cofnięta. Opis zostanie trwale usunięty."
                        onConfirm={() => handleDelete(detail.id)}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Przystąpienie do naprawy</p>
                    <p className="font-medium">{formatDate(detail.repairStartDate)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Zakończenie naprawy</p>
                    <p className="font-medium">{formatDate(detail.repairEndDate)}</p>
                  </div>
                </div>
                {detail.damageDescription && (
                  <div className="p-5 bg-muted/50 rounded-2xl">
                    <p className="text-xs text-muted-foreground mb-2">Opis uszkodzeń</p>
                    <p className="text-sm">{detail.damageDescription}</p>
                  </div>
                )}
                <div className="flex items-center justify-between pt-6 border-t border-border text-xs text-muted-foreground">
                  <span>Łączne godziny pracy: {getTotalHours(detail).toFixed(1)} rbh</span>
                  <span>{detail.employeeEmail}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl shadow">
          <Plus className="h-5 w-5 mr-2" /> Nowy opis
        </Button>
      </div>
    </div>
  )
}

