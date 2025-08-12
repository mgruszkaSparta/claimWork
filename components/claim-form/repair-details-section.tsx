"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Save, Edit, X } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import {
  getRepairDetails,
  createRepairDetail,
  updateRepairDetail,
  deleteRepairDetail,
  repairDetailUpsertSchema,
  type RepairDetail,
} from "@/lib/api/repair-details"
import { pksData, type Employee } from "@/lib/pks-data"

interface RepairDetailsSectionProps {
  eventId: string
  repairDetails: RepairDetail[]
  setRepairDetails: React.Dispatch<React.SetStateAction<RepairDetail[]>>
}

export function RepairDetailsSection({
  eventId,
  repairDetails,
  setRepairDetails,
}: RepairDetailsSectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [employeesForSelectedBranch, setEmployeesForSelectedBranch] = useState<Employee[]>([])
  const [isFormVisible, setIsFormVisible] = useState(false)
  const { toast } = useToast()

  const getInitialFormData = (): Omit<RepairDetail, "id" | "eventId" | "createdAt" | "updatedAt"> => ({
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
    status: "draft" as const,
  })

  const [formData, setFormData] = useState(getInitialFormData())

  useEffect(() => {
    if (formData.branchId) {
      const selectedBranch = pksData.find((branch) => branch.id === formData.branchId)
      setEmployeesForSelectedBranch(selectedBranch ? selectedBranch.employees : [])
    } else {
      setEmployeesForSelectedBranch([])
    }
  }, [formData.branchId])

  const handleBranchChange = (branchId: string) => {
    setFormData({ ...formData, branchId, employeeEmail: "" })
  }

  const refreshRepairDetails = async () => {
    try {
      setIsLoading(true)
      const data = await getRepairDetails(eventId)
      setRepairDetails(data)
    } catch (error) {
      console.error("Error fetching repair details:", error)
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się pobrać szczegółów naprawy",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNewClick = () => {
    resetForm()
    setIsFormVisible(true)
  }

  const handleCancelClick = () => {
    resetForm()
    setIsFormVisible(false)
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
      if (editingId) {
        await updateRepairDetail(editingId, { ...formData, eventId })
        toast({
          title: "Sukces",
          description: "Opis naprawy został zaktualizowany",
        })
      } else {
        await createRepairDetail({ ...formData, eventId })
        toast({
          title: "Sukces",
          description: "Opis naprawy został dodany",
        })
      }
      resetForm()
      refreshRepairDetails()
      setIsFormVisible(false)
    } catch (error) {
      console.error("Error saving repair details:", error)
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się zapisać opisu naprawy",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (detail: RepairDetail) => {
    setFormData({
      ...detail,
      damageDateTime: detail.damageDateTime ? new Date(detail.damageDateTime).toISOString().slice(0, 16) : "",
      appraiserWaitingDate: detail.appraiserWaitingDate
        ? new Date(detail.appraiserWaitingDate).toISOString().slice(0, 10)
        : "",
      repairStartDate: detail.repairStartDate ? new Date(detail.repairStartDate).toISOString().slice(0, 10) : "",
      repairEndDate: detail.repairEndDate ? new Date(detail.repairEndDate).toISOString().slice(0, 10) : "",
    })
    setEditingId(detail.id)
    setIsFormVisible(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten opis naprawy?")) return

    try {
      await deleteRepairDetail(id)
      toast({
        title: "Sukces",
        description: "Opis naprawy został usunięty",
      })
      refreshRepairDetails()
    } catch (error) {
      console.error("Error deleting repair details:", error)
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się usunąć opisu naprawy",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData(getInitialFormData())
    setEditingId(null)
  }

  const getStatusBadge = (status: RepairDetail["status"]) => {
    const statusConfig = {
      draft: { label: "Szkic", variant: "secondary" as const },
      "in-progress": { label: "W trakcie", variant: "default" as const },
      completed: { label: "Zakończony", variant: "default" as const },
    }

    const config = statusConfig[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getTotalHours = () => {
    return formData.bodyworkHours + formData.paintingHours + formData.assemblyHours + formData.otherWorkHours
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-500">Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="px-6">
        {!isFormVisible && (
          <div className="mb-6 flex justify-end">
            <Button onClick={handleAddNewClick} className="bg-[#1a3a6c] hover:bg-[#15305a]">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj nowy opis
            </Button>
          </div>
        )}

        {/* Form Section */}
        {isFormVisible && (
          <Card className="border-gray-200 shadow-sm mb-6">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-gray-700">
                  {editingId ? "Edytuj opis naprawy" : "Dodaj opis naprawy"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelClick}
                  className="text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Informacje podstawowe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="branch" className="text-sm font-medium">
                        Oddział
                      </Label>
                      <Select value={formData.branchId} onValueChange={handleBranchChange}>
                        <SelectTrigger id="branch">
                          <SelectValue placeholder="Wybierz oddział" />
                        </SelectTrigger>
                        <SelectContent>
                          {pksData.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.company} - {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employee" className="text-sm font-medium">
                        Pracownik
                      </Label>
                      <Select
                        value={formData.employeeEmail}
                        onValueChange={(value) => setFormData({ ...formData, employeeEmail: value })}
                        disabled={!formData.branchId}
                      >
                        <SelectTrigger id="employee">
                          <SelectValue placeholder="Wybierz pracownika" />
                        </SelectTrigger>
                        <SelectContent>
                          {employeesForSelectedBranch.map((employee) => (
                            <SelectItem key={employee.email} value={employee.email}>
                              {employee.name} ({employee.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleTabNumber" className="text-sm font-medium">
                        Nr taborowy pojazdu
                      </Label>
                      <Input
                        id="vehicleTabNumber"
                        value={formData.vehicleTabNumber}
                        onChange={(e) => setFormData({ ...formData, vehicleTabNumber: e.target.value })}
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleRegistration" className="text-sm font-medium">
                        Nr rejestracyjny
                      </Label>
                      <Input
                        id="vehicleRegistration"
                        value={formData.vehicleRegistration}
                        onChange={(e) => setFormData({ ...formData, vehicleRegistration: e.target.value })}
                        required
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Dates Section */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Daty i terminy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="damageDateTime" className="text-sm font-medium">
                        Data i godzina szkody
                      </Label>
                      <Input
                        id="damageDateTime"
                        type="datetime-local"
                        value={formData.damageDateTime}
                        onChange={(e) => setFormData({ ...formData, damageDateTime: e.target.value })}
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appraiserWaitingDate" className="text-sm font-medium">
                        Oczekiwanie na rzeczoznawcę
                      </Label>
                      <Input
                        id="appraiserWaitingDate"
                        type="date"
                        value={formData.appraiserWaitingDate}
                        onChange={(e) => setFormData({ ...formData, appraiserWaitingDate: e.target.value })}
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repairStartDate" className="text-sm font-medium">
                        Przystąpienie do naprawy
                      </Label>
                      <Input
                        id="repairStartDate"
                        type="date"
                        value={formData.repairStartDate}
                        onChange={(e) => setFormData({ ...formData, repairStartDate: e.target.value })}
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="repairEndDate" className="text-sm font-medium">
                        Zakończenie naprawy
                      </Label>
                      <Input
                        id="repairEndDate"
                        type="date"
                        value={formData.repairEndDate}
                        onChange={(e) => setFormData({ ...formData, repairEndDate: e.target.value })}
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Damage Description Section */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Opis uszkodzeń</h3>
                  <div className="space-y-2">
                    <Label htmlFor="damageDescription" className="text-sm font-medium">
                      Szczegółowy opis uszkodzeń
                    </Label>
                    <Textarea
                      id="damageDescription"
                      value={formData.damageDescription}
                      onChange={(e) => setFormData({ ...formData, damageDescription: e.target.value })}
                      placeholder="Opisz szczegółowo jakie były uszkodzenia..."
                      rows={4}
                      className="w-full resize-none"
                    />
                  </div>
                </div>

                {/* Vehicle Options Section */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Opcje pojazdów</h3>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="otherVehiclesAvailable"
                          checked={formData.otherVehiclesAvailable}
                          onCheckedChange={(checked) => setFormData({ ...formData, otherVehiclesAvailable: !!checked })}
                        />
                        <Label htmlFor="otherVehiclesAvailable" className="text-sm font-medium">
                          Były dostępne inne pojazdy do użytku
                        </Label>
                      </div>
                      {formData.otherVehiclesAvailable && (
                        <div className="ml-6 space-y-2">
                          <Label htmlFor="otherVehiclesInfo" className="text-sm font-medium">
                            Informacje o dostępnych pojazdach
                          </Label>
                          <Textarea
                            id="otherVehiclesInfo"
                            value={formData.otherVehiclesInfo}
                            onChange={(e) => setFormData({ ...formData, otherVehiclesInfo: e.target.value })}
                            placeholder="Opisz dostępne pojazdy..."
                            rows={3}
                            className="w-full resize-none"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="replacementVehicleRequired"
                          checked={formData.replacementVehicleRequired}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, replacementVehicleRequired: !!checked })
                          }
                        />
                        <Label htmlFor="replacementVehicleRequired" className="text-sm font-medium">
                          Pojazd zastępczy wymagany
                        </Label>
                      </div>
                      {formData.replacementVehicleRequired && (
                        <div className="ml-6 space-y-2">
                          <Label htmlFor="replacementVehicleInfo" className="text-sm font-medium">
                            Informacje o pojeździe zastępczym
                          </Label>
                          <Textarea
                            id="replacementVehicleInfo"
                            value={formData.replacementVehicleInfo}
                            onChange={(e) => setFormData({ ...formData, replacementVehicleInfo: e.target.value })}
                            placeholder="Opisz pojazd zastępczy..."
                            rows={3}
                            className="w-full resize-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Repair Time Section */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Czas naprawy (roboczogodziny)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bodyworkHours" className="text-sm font-medium">
                        Prace blacharskie
                      </Label>
                      <div className="relative">
                        <Input
                          id="bodyworkHours"
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.bodyworkHours}
                          onChange={(e) =>
                            setFormData({ ...formData, bodyworkHours: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                          rbh
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paintingHours" className="text-sm font-medium">
                        Prace lakiernicze
                      </Label>
                      <div className="relative">
                        <Input
                          id="paintingHours"
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.paintingHours}
                          onChange={(e) =>
                            setFormData({ ...formData, paintingHours: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                          rbh
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assemblyHours" className="text-sm font-medium">
                        Prace montażowe
                      </Label>
                      <div className="relative">
                        <Input
                          id="assemblyHours"
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.assemblyHours}
                          onChange={(e) =>
                            setFormData({ ...formData, assemblyHours: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                          rbh
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otherWorkHours" className="text-sm font-medium">
                        Inne prace
                      </Label>
                      <div className="relative">
                        <Input
                          id="otherWorkHours"
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.otherWorkHours}
                          onChange={(e) =>
                            setFormData({ ...formData, otherWorkHours: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                          rbh
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otherWorkDescription" className="text-sm font-medium">
                      Opis innych prac
                    </Label>
                    <Input
                      id="otherWorkDescription"
                      value={formData.otherWorkDescription}
                      onChange={(e) => setFormData({ ...formData, otherWorkDescription: e.target.value })}
                      placeholder="Opisz inne rodzaje prac naprawczych..."
                      className="w-full"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Łączne godziny pracy:</span>
                      <span className="text-xl font-bold text-[#1a3a6c]">{getTotalHours().toFixed(1)} rbh</span>
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Informacje dodatkowe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="additionalDescription" className="text-sm font-medium">
                        Dodatkowy opis
                      </Label>
                      <Textarea
                        id="additionalDescription"
                        value={formData.additionalDescription}
                        onChange={(e) => setFormData({ ...formData, additionalDescription: e.target.value })}
                        placeholder="Dodatkowe informacje..."
                        rows={3}
                        className="w-full resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">
                        Status
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Szkic</SelectItem>
                          <SelectItem value="in-progress">W trakcie</SelectItem>
                          <SelectItem value="completed">Zakończony</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={handleCancelClick}>
                    Anuluj
                  </Button>
                  <Button type="submit" className="bg-[#1a3a6c] hover:bg-[#15305a]">
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? "Zaktualizuj" : "Dodaj"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Repair Details List Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Zapisane opisy naprawy</h3>
          {repairDetails.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="space-y-3">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 font-medium">Brak opisów naprawy</p>
                  <p className="text-sm text-gray-400">Dodaj pierwszy opis naprawy dla tego zdarzenia</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {repairDetails.map((detail) => (
                <Card key={detail.id} className="shadow-sm hover:shadow-md transition-shadow border-gray-200">
                  <CardContent className="p-6">
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {detail.vehicleTabNumber} ({detail.vehicleRegistration})
                        </h4>
                        <p className="text-sm text-gray-500">
                          Utworzono: {new Date(detail.createdAt).toLocaleDateString("pl-PL")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(detail.status)}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(detail)}
                          className="h-8 w-8 hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(detail.id)}
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Oddział:</span>
                        <span className="text-gray-800">
                          {pksData.find((b) => b.id === detail.branchId)?.name || "Nieznany"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Pracownik:</span>
                        <span className="text-gray-800">{detail.employeeEmail}</span>
                      </div>
                      {detail.damageDateTime && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">Data szkody:</span>
                          <span className="text-gray-800">
                            {new Date(detail.damageDateTime).toLocaleString("pl-PL")}
                          </span>
                        </div>
                      )}
                      {detail.appraiserWaitingDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">Oczek. na rzeczoznawcę:</span>
                          <span className="text-gray-800">
                            {new Date(detail.appraiserWaitingDate).toLocaleDateString("pl-PL")}
                          </span>
                        </div>
                      )}
                      {detail.repairStartDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">Początek naprawy:</span>
                          <span className="text-gray-800">
                            {new Date(detail.repairStartDate).toLocaleDateString("pl-PL")}
                          </span>
                        </div>
                      )}
                      {detail.repairEndDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">Koniec naprawy:</span>
                          <span className="text-gray-800">
                            {new Date(detail.repairEndDate).toLocaleDateString("pl-PL")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Damage Description */}
                    {detail.damageDescription && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Opis uszkodzeń:</h5>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {detail.damageDescription}
                        </p>
                      </div>
                    )}

                    {/* Vehicle Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-gray-700">Inne pojazdy dostępne:</h5>
                        <p className="text-sm text-gray-800 font-medium">
                          {detail.otherVehiclesAvailable ? "Tak" : "Nie"}
                        </p>
                        {detail.otherVehiclesAvailable && detail.otherVehiclesInfo && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                            {detail.otherVehiclesInfo}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-gray-700">Pojazd zastępczy:</h5>
                        <p className="text-sm text-gray-800 font-medium">
                          {detail.replacementVehicleRequired ? "Tak" : "Nie"}
                        </p>
                        {detail.replacementVehicleRequired && detail.replacementVehicleInfo && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                            {detail.replacementVehicleInfo}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Repair Time */}
                    <div className="mb-6">
                      <h5 className="text-sm font-semibold text-gray-700 mb-4">Czas naprawy</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Blacharskie</p>
                          <p className="text-lg font-bold text-[#1a3a6c]">
                            {detail.bodyworkHours} <span className="text-sm font-normal text-gray-600">rbh</span>
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Lakiernicze</p>
                          <p className="text-lg font-bold text-[#1a3a6c]">
                            {detail.paintingHours} <span className="text-sm font-normal text-gray-600">rbh</span>
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Montażowe</p>
                          <p className="text-lg font-bold text-[#1a3a6c]">
                            {detail.assemblyHours} <span className="text-sm font-normal text-gray-600">rbh</span>
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Inne</p>
                          <p className="text-lg font-bold text-[#1a3a6c]">
                            {detail.otherWorkHours} <span className="text-sm font-normal text-gray-600">rbh</span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-[#1a3a6c] text-white rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Łącznie:</span>
                          <span className="text-xl font-bold">
                            {(
                              detail.bodyworkHours +
                              detail.paintingHours +
                              detail.assemblyHours +
                              detail.otherWorkHours
                            ).toFixed(1)}{" "}
                            rbh
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    {(detail.otherWorkDescription || detail.additionalDescription) && (
                      <div className="space-y-4">
                        {detail.otherWorkDescription && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">Opis innych prac:</h5>
                            <p className="text-sm text-gray-700">{detail.otherWorkDescription}</p>
                          </div>
                        )}
                        {detail.additionalDescription && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">Dodatkowy opis:</h5>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.additionalDescription}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
