"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Save, ArrowLeft, Plus, Calendar, Wrench, X } from 'lucide-react'
import { ClaimFormSidebar } from "@/components/claim-form/claim-form-sidebar"
import { ClaimTopHeader } from "@/components/claim-form/claim-top-header"
import { ClaimMainContent } from "@/components/claim-form/claim-main-content"
import { useClaimForm } from "@/hooks/use-claim-form"
import { useClaims } from "@/hooks/use-claims"
import { generateId } from "@/lib/constants"
import { pksData, type Employee } from "@/lib/pks-data"
import type { Claim, UploadedFile, RequiredDocument } from "@/types"
import type { RepairDetail } from "@/lib/repair-details-store"

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

export default function NewClaimPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { createClaim, initializeClaim } = useClaims()
  const initialized = useRef(false)
  const [activeClaimSection, setActiveClaimSection] = useState("dane-zdarzenia")
  const [isSaving, setIsSaving] = useState(false)
  
  // Repair schedules and details state
  const [repairSchedules, setRepairSchedules] = useState<RepairSchedule[]>([])
  const [repairDetails, setRepairDetails] = useState<RepairDetail[]>([])
  const [isAddingSchedule, setIsAddingSchedule] = useState(false)
  const [isAddingRepairDetail, setIsAddingRepairDetail] = useState(false)
  const [scheduleFormData, setScheduleFormData] = useState<Partial<RepairSchedule>>({})
  const [repairDetailFormData, setRepairDetailFormData] = useState<Partial<RepairDetail>>({})
  const [employeesForSelectedBranch, setEmployeesForSelectedBranch] = useState<Employee[]>([])

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "Analiza zmian.csv",
      size: 301,
      type: "other",
      uploadedAt: "2025-07-24",
      url: "/placeholder.svg?width=400&height=300",
    },
  ])

  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([
    { id: "1", name: "Dowód rejestracyjny", required: true, uploaded: false, description: "" },
    { id: "2", name: "Dyspozycja dotycząca wypłaty odszkodowania", required: true, uploaded: false, description: "" },
    { id: "3", name: "Kalkulacja naprawy", required: true, uploaded: false, description: "" },
    { id: "4", name: "Ocena techniczna", required: true, uploaded: false, description: "" },
    { id: "5", name: "Oświadczenie o trzeźwości", required: true, uploaded: false, description: "" },
    { id: "6", name: "Prawo jazdy", required: true, uploaded: false, description: "" },
    { id: "7", name: "Świadectwo kwalifikacji", required: true, uploaded: false, description: "" },
    { id: "8", name: "Zdjęcia", required: true, uploaded: false, description: "" },
    { id: "9", name: "Zgłoszenie szkody", required: true, uploaded: false, description: "" },
    { id: "10", name: "Akceptacja kalkulacji naprawy", required: true, uploaded: false, description: "" },
    { id: "11", name: "Faktura za holowanie", required: true, uploaded: false, description: "" },
    { id: "12", name: "Faktura za wynajem", required: true, uploaded: false, description: "" },
  ])

  const {
    claimFormData,
    setClaimFormData,
    handleFormChange,
    handleParticipantChange,
    handleDriverChange,
    handleAddDriver,
    handleRemoveDriver,
    resetForm,
  } = useClaimForm()

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      initializeClaim().then((id) => {
        if (id) {
          setClaimFormData((prev) => ({ ...prev, id }))
        }
      })
    }
  }, [initializeClaim, setClaimFormData])

  const getInitialScheduleData = (): Partial<RepairSchedule> => ({
    eventId: "new",
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

  const getInitialRepairDetailData = (): Omit<RepairDetail, "id" | "eventId" | "createdAt" | "updatedAt"> => ({
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

  const handleAddSchedule = () => {
    setScheduleFormData(getInitialScheduleData())
    setIsAddingSchedule(true)
  }

  const handleAddRepairDetail = () => {
    setRepairDetailFormData(getInitialRepairDetailData())
    setIsAddingRepairDetail(true)
  }

  const handleSaveSchedule = () => {
    if (!scheduleFormData.vehicleFleetNumber || !scheduleFormData.vehicleRegistration || !scheduleFormData.damageDate) {
      toast({
        title: "Błąd walidacji",
        description: "Wypełnij wszystkie wymagane pola",
        variant: "destructive",
      })
      return
    }

    const newSchedule: RepairSchedule = {
      ...scheduleFormData,
      id: generateId(),
      eventId: "new",
      createdAt: new Date().toISOString(),
    } as RepairSchedule

    setRepairSchedules(prev => [...prev, newSchedule])
    setIsAddingSchedule(false)
    setScheduleFormData({})
    
    toast({
      title: "Sukces",
      description: "Harmonogram naprawy został dodany",
    })
  }

  const handleSaveRepairDetail = () => {
    const newDetail: RepairDetail = {
      ...repairDetailFormData,
      id: generateId(),
      eventId: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as RepairDetail

    setRepairDetails(prev => [...prev, newDetail])
    setIsAddingRepairDetail(false)
    setRepairDetailFormData({})
    
    toast({
      title: "Sukces",
      description: "Szczegóły naprawy zostały dodane",
    })
  }

  const handleCancelSchedule = () => {
    setIsAddingSchedule(false)
    setScheduleFormData({})
  }

  const handleCancelRepairDetail = () => {
    setIsAddingRepairDetail(false)
    setRepairDetailFormData({})
  }

  const handleBranchChange = (branchId: string) => {
    setRepairDetailFormData({ ...repairDetailFormData, branchId, employeeEmail: "" })
    const selectedBranch = pksData.find((branch) => branch.id === branchId)
    setEmployeesForSelectedBranch(selectedBranch ? selectedBranch.employees : [])
  }

  const getTotalHours = () => {
    return (repairDetailFormData.bodyworkHours || 0) + 
           (repairDetailFormData.paintingHours || 0) + 
           (repairDetailFormData.assemblyHours || 0) + 
           (repairDetailFormData.otherWorkHours || 0)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    try {
      return new Date(dateString).toLocaleDateString("pl-PL")
    } catch {
      return dateString
    }
  }

  const getRepairDetailStatusBadge = (status: RepairDetail["status"]) => {
    const statusConfig = {
      draft: { label: "Szkic", color: "bg-gray-100 text-gray-800" },
      "in-progress": { label: "W trakcie", color: "bg-blue-100 text-blue-800" },
      completed: { label: "Zakończony", color: "bg-green-100 text-green-800" },
    }

    const config = statusConfig[status]
    return <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>{config.label}</span>
  }

  const handleSaveClaim = async (exitAfterSave = false) => {
    if (isSaving) return
    setIsSaving(true)
    
    try {
      const newClaimData = {
        ...claimFormData,
        id: generateId(),
        claimNumber: `PL${new Date().getFullYear()}${String(Date.now()).slice(-8)}`,
      } as Claim

      const createdClaim = await createClaim(newClaimData)

      if (!createdClaim) {
        throw new Error("Nie udało się utworzyć szkody")
      }

      // Save repair schedules and details if any exist
      if (repairSchedules.length > 0) {
        for (const schedule of repairSchedules) {
          try {
            await fetch("/api/repair-schedules", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...schedule, eventId: createdClaim.id }),
            })
          } catch (error) {
            console.error("Error saving repair schedule:", error)
          }
        }
      }

      if (repairDetails.length > 0) {
        for (const detail of repairDetails) {
          try {
            await fetch("/api/repair-details", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...detail, eventId: createdClaim.id }),
            })
          } catch (error) {
            console.error("Error saving repair detail:", error)
          }
        }
      }

      toast({
        title: "Szkoda dodana",
        description: `Nowa szkoda ${createdClaim.spartaNumber} została pomyślnie dodana.`,
      })

      if (exitAfterSave) {
        router.push("/")
      } else {
        resetForm()
        setRepairSchedules([])
        setRepairDetails([])
      }
    } catch (error) {
      console.error("Error saving claim:", error)
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas zapisywania szkody.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    router.push("/")
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <ClaimTopHeader claimFormData={claimFormData} onClose={handleClose} />
      
      <div className="flex flex-1 min-h-0">
        <ClaimFormSidebar activeClaimSection={activeClaimSection} setActiveClaimSection={setActiveClaimSection} />
        
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6 min-h-full">
            <ClaimMainContent
              activeClaimSection={activeClaimSection}
              claimFormData={claimFormData}
              handleFormChange={handleFormChange}
              handleParticipantChange={handleParticipantChange}
              handleDriverChange={handleDriverChange}
              handleAddDriver={handleAddDriver}
              handleRemoveDriver={handleRemoveDriver}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              requiredDocuments={requiredDocuments}
              setRequiredDocuments={setRequiredDocuments}
            />

            {/* Repair Schedules and Details Section */}
            {activeClaimSection === "harmonogram-naprawy" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Repair Schedules */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                          Harmonogram naprawy
                        </CardTitle>
                        <Button onClick={handleAddSchedule} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Dodaj
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {repairSchedules.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                          <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium mb-1">Brak harmonogramów naprawy</p>
                          <p className="text-gray-400 text-sm mb-4">Przejdź do sekcji "Harmonogram" aby dodać harmonogram</p>
                          <Button onClick={handleAddSchedule} size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Dodaj harmonogram
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {repairSchedules.map((schedule, index) => (
                            <div key={schedule.id || index} className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium text-sm">
                                    {schedule.vehicleRegistration} (Nr tab. {schedule.vehicleFleetNumber})
                                  </h4>
                                  <p className="text-xs text-gray-600">
                                    Szkoda nr {schedule.damageNumber} • {formatDate(schedule.damageDate)}
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  {(() => {
                                    const statusConfig = {
                                      draft: { label: "Szkic", color: "bg-gray-100 text-gray-800" },
                                      submitted: { label: "Przesłany", color: "bg-blue-100 text-blue-800" },
                                      approved: { label: "Zatwierdzony", color: "bg-green-100 text-green-800" },
                                      completed: { label: "Zakończony", color: "bg-purple-100 text-purple-800" },
                                    }
                                    const config = statusConfig[schedule.status as keyof typeof statusConfig] || statusConfig.draft
                                    return <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>{config.label}</span>
                                  })()}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {schedule.repairStartDate && (
                                  <div>
                                    <span className="text-gray-500">Rozpoczęcie:</span>
                                    <p className="font-medium">{formatDate(schedule.repairStartDate)}</p>
                                  </div>
                                )}
                                {schedule.repairEndDate && (
                                  <div>
                                    <span className="text-gray-500">Zakończenie:</span>
                                    <p className="font-medium">{formatDate(schedule.repairEndDate)}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Repair Details */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <Wrench className="h-5 w-5 mr-2 text-orange-600" />
                          Szczegóły naprawy
                        </CardTitle>
                        <Button onClick={handleAddRepairDetail} size="sm" className="bg-orange-600 hover:bg-orange-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Dodaj
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {repairDetails.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                          <Wrench className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium mb-1">Brak szczegółów naprawy</p>
                          <p className="text-gray-400 text-sm mb-4">Przejdź do sekcji "Naprawa" aby dodać szczegóły naprawy</p>
                          <Button onClick={handleAddRepairDetail} size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Dodaj szczegóły
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {repairDetails.map((detail, index) => (
                            <div key={detail.id || index} className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium text-sm">
                                    {detail.vehicleTabNumber} ({detail.vehicleRegistration})
                                  </h4>
                                  <p className="text-xs text-gray-600">
                                    {pksData.find((b) => b.id === detail.branchId)?.name || "Nieznany oddział"}
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  {getRepairDetailStatusBadge(detail.status)}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-500">Łączne godziny:</span>
                                  <p className="font-medium text-orange-600">
                                    {(detail.bodyworkHours + detail.paintingHours + detail.assemblyHours + detail.otherWorkHours).toFixed(1)} rbh
                                  </p>
                                </div>
                                {detail.repairStartDate && (
                                  <div>
                                    <span className="text-gray-500">Rozpoczęcie:</span>
                                    <p className="font-medium">{formatDate(detail.repairStartDate)}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-4 right-4 flex space-x-2 z-60">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClose}
          className="shadow-lg bg-transparent"
          disabled={isSaving}
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Anuluj
        </Button>
        <Button
          size="sm"
          className="bg-[#1a3a6c] hover:bg-[#1a3a6c]/90 shadow-lg"
          onClick={() => handleSaveClaim(false)}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
              Zapisywanie...
            </>
          ) : (
            <>
              <Save className="h-3 w-3 mr-1" />
              Zapisz
            </>
          )}
        </Button>
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 shadow-lg"
          onClick={() => handleSaveClaim(true)}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
              Zapisywanie...
            </>
          ) : (
            <>
              <Save className="h-3 w-3 mr-1" />
              Zapisz i wyjdź
            </>
          )}
        </Button>
      </div>

      {/* Add Schedule Dialog */}
      <Dialog open={isAddingSchedule} onOpenChange={setIsAddingSchedule}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
              Dodaj harmonogram naprawy
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Nazwa przedsiębiorstwa</Label>
                <Input
                  id="companyName"
                  value={scheduleFormData.companyName || ""}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="damageNumber">Nr szkody *</Label>
                <Input
                  id="damageNumber"
                  value={scheduleFormData.damageNumber || ""}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, damageNumber: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="vehicleFleetNumber">Nr taborowy *</Label>
                <Input
                  id="vehicleFleetNumber"
                  value={scheduleFormData.vehicleFleetNumber || ""}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, vehicleFleetNumber: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="vehicleRegistration">Nr rejestracyjny *</Label>
                <Input
                  id="vehicleRegistration"
                  value={scheduleFormData.vehicleRegistration || ""}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, vehicleRegistration: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="damageDate">Data szkody *</Label>
                <Input
                  id="damageDate"
                  type="date"
                  value={scheduleFormData.damageDate || ""}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, damageDate: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="damageTime">Godzina szkody</Label>
                <Input
                  id="damageTime"
                  type="time"
                  value={scheduleFormData.damageTime || ""}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, damageTime: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            {/* Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expertWaitingDate">Oczekiwanie na rzeczoznawcę</Label>
                <Input
                  id="expertWaitingDate"
                  type="date"
                  value={scheduleFormData.expertWaitingDate || ""}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, expertWaitingDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="additionalInspections">Kolejne wyceny oględziny</Label>
                <Input
                  id="additionalInspections"
                  value={scheduleFormData.additionalInspections || ""}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, additionalInspections: e.target.value }))}
                  className="mt-1"
                  placeholder="np. brak, planowane na..."
                />
              </div>
              <div>
                <Label htmlFor="repairStartDate">Przystąpienie do naprawy</Label>
                <Input
                  id="repairStartDate"
                  type="date"
                  value={scheduleFormData.repairStartDate || ""}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, repairStartDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="repairEndDate">Zakończenie naprawy</Label>
                <Input
                  id="repairEndDate"
                  type="date"
                  value={scheduleFormData.repairEndDate || ""}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, repairEndDate: e.target.value }))}
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
                  value={scheduleFormData.whyNotOperational || ""}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, whyNotOperational: e.target.value }))}
                  className="mt-1"
                  placeholder="np. poważne uszkodzenia, niebezpieczne dla pasażerów..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-base font-medium">Czy były pojazdy inne które można było użytkować?</Label>
                <RadioGroup
                  value={scheduleFormData.alternativeVehiclesAvailable ? "tak" : "nie"}
                  onValueChange={(value) =>
                    setScheduleFormData(prev => ({
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

                {scheduleFormData.alternativeVehiclesAvailable && (
                  <div className="mt-3">
                    <Label htmlFor="alternativeVehiclesDescription">Opis dostępnych pojazdów</Label>
                    <Textarea
                      id="alternativeVehiclesDescription"
                      value={scheduleFormData.alternativeVehiclesDescription || ""}
                      onChange={(e) =>
                        setScheduleFormData(prev => ({ ...prev, alternativeVehiclesDescription: e.target.value }))
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactDispatcher">Kontakt - Dyspozytor</Label>
                <Input
                  id="contactDispatcher"
                  type="email"
                  value={scheduleFormData.contactDispatcher || ""}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, contactDispatcher: e.target.value }))}
                  className="mt-1"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="contactManager">Kontakt - Kierownik</Label>
                <Input
                  id="contactManager"
                  type="email"
                  value={scheduleFormData.contactManager || ""}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, contactManager: e.target.value }))}
                  className="mt-1"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status harmonogramu</Label>
              <Select
                value={scheduleFormData.status || "draft"}
                onValueChange={(value) => setScheduleFormData(prev => ({ ...prev, status: value as any }))}
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
          </div>

          {/* Dialog Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancelSchedule}>
              <X className="h-4 w-4 mr-2" />
              Anuluj
            </Button>
            <Button onClick={handleSaveSchedule} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="h-4 w-4 mr-2" />
              Zapisz harmonogram
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Repair Detail Dialog */}
      <Dialog open={isAddingRepairDetail} onOpenChange={setIsAddingRepairDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2 text-orange-600" />
              Dodaj szczegóły naprawy
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch">Oddział</Label>
                <Select value={repairDetailFormData.branchId} onValueChange={handleBranchChange}>
                  <SelectTrigger id="branch" className="mt-1">
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
              <div>
                <Label htmlFor="employee">Pracownik</Label>
                <Select
                  value={repairDetailFormData.employeeEmail}
                  onValueChange={(value) => setRepairDetailFormData(prev => ({ ...prev, employeeEmail: value }))}
                  disabled={!repairDetailFormData.branchId}
                >
                  <SelectTrigger id="employee" className="mt-1">
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
              <div>
                <Label htmlFor="vehicleTabNumber">Nr taborowy pojazdu</Label>
                <Input
                  id="vehicleTabNumber"
                  value={repairDetailFormData.vehicleTabNumber}
                  onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, vehicleTabNumber: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="vehicleRegistration">Nr rejestracyjny</Label>
                <Input
                  id="vehicleRegistration"
                  value={repairDetailFormData.vehicleRegistration}
                  onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, vehicleRegistration: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="damageDateTime">Data i godzina szkody</Label>
                <Input
                  id="damageDateTime"
                  type="datetime-local"
                  value={repairDetailFormData.damageDateTime}
                  onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, damageDateTime: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="appraiserWaitingDate">Oczekiwanie na rzeczoznawcę</Label>
                <Input
                  id="appraiserWaitingDate"
                  type="date"
                  value={repairDetailFormData.appraiserWaitingDate}
                  onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, appraiserWaitingDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="repairStartDate">Przystąpienie do naprawy</Label>
                <Input
                  id="repairStartDate"
                  type="date"
                  value={repairDetailFormData.repairStartDate}
                  onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, repairStartDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="repairEndDate">Zakończenie naprawy</Label>
                <Input
                  id="repairEndDate"
                  type="date"
                  value={repairDetailFormData.repairEndDate}
                  onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, repairEndDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <Separator />

            {/* Damage Description */}
            <div>
              <Label htmlFor="damageDescription">Szczegółowy opis uszkodzeń</Label>
              <Textarea
                id="damageDescription"
                value={repairDetailFormData.damageDescription}
                onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, damageDescription: e.target.value }))}
                placeholder="Opisz szczegółowo jakie były uszkodzenia..."
                rows={4}
                className="mt-1 resize-none"
              />
            </div>

            <Separator />

            {/* Vehicle Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="otherVehiclesAvailable"
                  checked={repairDetailFormData.otherVehiclesAvailable}
                  onCheckedChange={(checked) => setRepairDetailFormData(prev => ({ ...prev, otherVehiclesAvailable: !!checked }))}
                />
                <Label htmlFor="otherVehiclesAvailable">Były dostępne inne pojazdy do użytku</Label>
              </div>
              {repairDetailFormData.otherVehiclesAvailable && (
                <div className="ml-6">
                  <Label htmlFor="otherVehiclesInfo">Informacje o dostępnych pojazdach</Label>
                  <Textarea
                    id="otherVehiclesInfo"
                    value={repairDetailFormData.otherVehiclesInfo}
                    onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, otherVehiclesInfo: e.target.value }))}
                    placeholder="Opisz dostępne pojazdy..."
                    rows={3}
                    className="mt-1 resize-none"
                  />
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="replacementVehicleRequired"
                  checked={repairDetailFormData.replacementVehicleRequired}
                  onCheckedChange={(checked) => setRepairDetailFormData(prev => ({ ...prev, replacementVehicleRequired: !!checked }))}
                />
                <Label htmlFor="replacementVehicleRequired">Pojazd zastępczy wymagany</Label>
              </div>
              {repairDetailFormData.replacementVehicleRequired && (
                <div className="ml-6">
                  <Label htmlFor="replacementVehicleInfo">Informacje o pojeździe zastępczym</Label>
                  <Textarea
                    id="replacementVehicleInfo"
                    value={repairDetailFormData.replacementVehicleInfo}
                    onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, replacementVehicleInfo: e.target.value }))}
                    placeholder="Opisz pojazd zastępczy..."
                    rows={3}
                    className="mt-1 resize-none"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Repair Time */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-700">Czas naprawy (roboczogodziny)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="bodyworkHours">Prace blacharskie</Label>
                  <div className="relative mt-1">
                    <Input
                      id="bodyworkHours"
                      type="number"
                      min="0"
                      step="0.1"
                      value={repairDetailFormData.bodyworkHours}
                      onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, bodyworkHours: Number.parseFloat(e.target.value) || 0 }))}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">rbh</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="paintingHours">Prace lakiernicze</Label>
                  <div className="relative mt-1">
                    <Input
                      id="paintingHours"
                      type="number"
                      min="0"
                      step="0.1"
                      value={repairDetailFormData.paintingHours}
                      onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, paintingHours: Number.parseFloat(e.target.value) || 0 }))}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">rbh</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="assemblyHours">Prace montażowe</Label>
                  <div className="relative mt-1">
                    <Input
                      id="assemblyHours"
                      type="number"
                      min="0"
                      step="0.1"
                      value={repairDetailFormData.assemblyHours}
                      onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, assemblyHours: Number.parseFloat(e.target.value) || 0 }))}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">rbh</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="otherWorkHours">Inne prace</Label>
                  <div className="relative mt-1">
                    <Input
                      id="otherWorkHours"
                      type="number"
                      min="0"
                      step="0.1"
                      value={repairDetailFormData.otherWorkHours}
                      onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, otherWorkHours: Number.parseFloat(e.target.value) || 0 }))}
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">rbh</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="otherWorkDescription">Opis innych prac</Label>
                <Input
                  id="otherWorkDescription"
                  value={repairDetailFormData.otherWorkDescription}
                  onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, otherWorkDescription: e.target.value }))}
                  placeholder="Opisz inne rodzaje prac naprawczych..."
                  className="mt-1"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Łączne godziny pracy:</span>
                  <span className="text-xl font-bold text-orange-600">{getTotalHours().toFixed(1)} rbh</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="additionalDescription">Dodatkowy opis</Label>
                <Textarea
                  id="additionalDescription"
                  value={repairDetailFormData.additionalDescription}
                  onChange={(e) => setRepairDetailFormData(prev => ({ ...prev, additionalDescription: e.target.value }))}
                  placeholder="Dodatkowe informacje..."
                  rows={3}
                  className="mt-1 resize-none"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={repairDetailFormData.status}
                  onChange={(value: any) => setRepairDetailFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="status" className="mt-1">
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

          {/* Dialog Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancelRepairDetail}>
              <X className="h-4 w-4 mr-2" />
              Anuluj
            </Button>
            <Button onClick={handleSaveRepairDetail} className="bg-orange-600 hover:bg-orange-700">
              <Save className="h-4 w-4 mr-2" />
              Zapisz szczegóły
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
