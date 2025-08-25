'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ArrowLeft, Edit, FileText, User, AlertTriangle, Car, Calendar, Phone, Mail, MapPin, Euro, Users, Plus, Save, X, ExternalLink, Wrench, Clock } from 'lucide-react'
import type { Claim } from "@/types"
import { pksData, type Employee } from "@/lib/pks-data"
import type { RepairDetail } from "@/lib/repair-details-store"
import { transformApiClaimToFrontend } from "@/hooks/use-claims"
import { dictionaryService, type DictionaryItemDto } from "@/lib/dictionary-service"

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
  cost?: number
  createdAt?: string
  updatedAt?: string
}

export default function ViewClaimPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [claim, setClaim] = useState<Claim | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [repairSchedules, setRepairSchedules] = useState<RepairSchedule[]>([])
  const [repairDetails, setRepairDetails] = useState<RepairDetail[]>([])
  const [isAddingSchedule, setIsAddingSchedule] = useState(false)
  const [isAddingRepairDetail, setIsAddingRepairDetail] = useState(false)
  const [scheduleFormData, setScheduleFormData] = useState<Partial<RepairSchedule>>({})
  const [repairDetailFormData, setRepairDetailFormData] = useState<Partial<RepairDetail>>({})
  const [employeesForSelectedBranch, setEmployeesForSelectedBranch] = useState<Employee[]>([])
  const [riskTypes, setRiskTypes] = useState<DictionaryItemDto[]>([])
  const [claimStatuses, setClaimStatuses] = useState<DictionaryItemDto[]>([])

  const id = params.id as string

  useEffect(() => {
    const loadDictionaries = async () => {
      try {
        const [riskRes, statusRes] = await Promise.all([
          dictionaryService.getRiskTypes(),
          dictionaryService.getClaimStatuses(),
        ])
        setRiskTypes(riskRes.items)
        setClaimStatuses(statusRes.items)
      } catch (err) {
        console.error("Error loading dictionaries:", err)
      }
    }
    loadDictionaries()
  }, [])

  const riskTypeMap = useMemo(() => {
    const map: Record<string, string> = {}
    riskTypes.forEach((r) => {
      map[String(r.code).toLowerCase()] = r.name
    })
    return map
  }, [riskTypes])

  const claimStatusMap = useMemo(() => {
    const map: Record<number, { name: string; color?: string }> = {}
    claimStatuses.forEach((s) => {
      const idNum = typeof s.id === "string" ? parseInt(s.id) : s.id
      map[idNum] = { name: s.name, color: s.color }
    })
    return map
  }, [claimStatuses])

  const getInitialScheduleData = (): Partial<RepairSchedule> => ({
    eventId: id,
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

  const loadClaimData = useCallback(async () => {
    if (!id) {
      setLoadError("Brak ID szkody")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setLoadError(null)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/claims/${id}`,
        {
          method: "GET",
          credentials: "omit",
        }
      )
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const claimData = await response.json()
      if (claimData) {

        const transformedData = transformApiClaimToFrontend(claimData)

        setClaim(transformedData)
      } else {
        throw new Error("Nie znaleziono danych szkody")
      }
    } catch (error) {
      console.error("Error loading claim:", error)
      const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd podczas ładowania szkody"
      setLoadError(errorMessage)
      toast({
        title: "Błąd",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [id, toast])

  const loadRepairSchedules = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/repair-schedules?eventId=${id}`,
        {
          method: "GET",
          credentials: "omit",
        }
      )
      if (response.ok) {
        const data = await response.json()
        setRepairSchedules(data)
      }
    } catch (error) {
      console.error("Error loading repair schedules:", error)
    }
  }, [id])

  const loadRepairDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/repair-details?eventId=${id}`,
        {
          method: "GET",
          credentials: "omit",
        }
      )
      if (response.ok) {
        const data = await response.json()
        setRepairDetails(data)
      }
    } catch (error) {
      console.error("Error loading repair details:", error)
    }
  }, [id])

  useEffect(() => {
    loadClaimData()
    loadRepairSchedules()
    loadRepairDetails()
  }, [loadClaimData, loadRepairSchedules, loadRepairDetails])

  useEffect(() => {
    if (repairDetailFormData.branchId) {
      const selectedBranch = pksData.find((branch) => branch.id === repairDetailFormData.branchId)
      setEmployeesForSelectedBranch(selectedBranch ? selectedBranch.employees : [])
    } else {
      setEmployeesForSelectedBranch([])
    }
  }, [repairDetailFormData.branchId])

  const handleEdit = () => {
    router.push(`/claims/${id}/edit`)
  }

  const handleClose = () => {
    router.push("/claims")
  }

  const handleGoToRepairSection = () => {
    router.push(`/claims/${id}/edit#repair-section`)
  }

  const handleGoToScheduleSection = () => {
    router.push(`/claims/${id}/edit#schedule-section`)
  }

  const handleAddSchedule = () => {
    setScheduleFormData(getInitialScheduleData())
    setIsAddingSchedule(true)
  }

  const handleAddRepairDetail = () => {
    setRepairDetailFormData(getInitialRepairDetailData())
    setIsAddingRepairDetail(true)
  }

  const handleSaveSchedule = async () => {
    try {
      if (!scheduleFormData.vehicleFleetNumber || !scheduleFormData.vehicleRegistration || !scheduleFormData.damageDate) {
        toast({
          title: "Błąd walidacji",
          description: "Wypełnij wszystkie wymagane pola",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/repair-schedules`,
        {
          method: "POST",
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(scheduleFormData),
        }
      )

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }

      const savedSchedule = await response.json()
      setRepairSchedules((prev) => [...prev, savedSchedule])
      setIsAddingSchedule(false)
      setScheduleFormData({})
      
      toast({
        title: "Sukces",
        description: "Harmonogram naprawy został utworzony",
      })
    } catch (error) {
      console.error("Error saving repair schedule:", error)
      toast({
        title: "Błąd",
        description: `Nie udało się zapisać harmonogramu: ${error instanceof Error ? error.message : "Nieznany błąd"}`,
        variant: "destructive",
      })
    }
  }

  const handleSaveRepairDetail = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/repair-details`,
        {
          method: "POST",
          credentials: "omit",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...repairDetailFormData,
            eventId: id,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to save repair details")
      }

      const savedDetail = await response.json()
      setRepairDetails((prev) => [...prev, savedDetail])
      setIsAddingRepairDetail(false)
      setRepairDetailFormData({})
      
      toast({
        title: "Sukces",
        description: "Szczegóły naprawy zostały utworzone",
      })
    } catch (error) {
      console.error("Error saving repair detail:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać szczegółów naprawy",
        variant: "destructive",
      })
    }
  }

  const handleCancelSchedule = () => {
    setIsAddingSchedule(false)
    setScheduleFormData({})
  }

    const handleCancelRepairDetail = () => {
      setIsAddingRepairDetail(false);
      setRepairDetailFormData({});
    };

    const handleBranchChange = (branchId: string) => {
      setRepairDetailFormData({ ...repairDetailFormData, branchId, employeeEmail: "" });
    };

    const getTotalHours = () => {
      return (
        (repairDetailFormData.bodyworkHours || 0) +
        (repairDetailFormData.paintingHours || 0) +
        (repairDetailFormData.assemblyHours || 0) +
        (repairDetailFormData.otherWorkHours || 0)
      );
    };

    const formatDate = (dateString?: string) => {
      if (!dateString) return "-";
      try {
        return new Date(dateString).toLocaleDateString("pl-PL");
      } catch {
        return dateString;
      }
    };

    const formatCurrency = (amount?: number, currency = "PLN") => {
      if (amount === undefined || amount === null) return "-";
      return new Intl.NumberFormat("pl-PL", {
        style: "currency",
        currency: currency,
      }).format(amount);
    };

    const getStatusBadge = (statusId?: number) => {
      const statusInfo = statusId ? claimStatusMap[statusId] : undefined
      const color =
        statusInfo?.color || "bg-gray-100 text-gray-800 border-gray-200"
      return <Badge className={color}>{statusInfo?.name || "Brak"}</Badge>
    }

    const getRepairDetailStatusBadge = (status: RepairDetail["status"]) => {
      const statusConfig = {
        draft: { label: "Szkic", variant: "secondary" as const },
        "in-progress": { label: "W trakcie", variant: "default" as const },
        completed: { label: "Zakończony", variant: "default" as const },
      };

      const config = statusConfig[status];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#1a3a6c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Ładowanie szkody...</p>
        </div>
      </div>
    )
  }

  if (loadError || !claim) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Błąd ładowania</h2>
          <p className="text-gray-600 mb-4">{loadError || "Nie znaleziono szkody"}</p>
          <div className="flex space-x-3 justify-center">
            <Button onClick={loadClaimData} variant="outline">
              Spróbuj ponownie
            </Button>
            <Button onClick={handleClose}>Powrót do listy</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Powrót
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Szkoda {claim.spartaNumber || claim.claimNumber}</h1>
              <p className="text-sm text-gray-500">
                {claim.brand} {claim.model} • {claim.owner}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(claim.claimStatusId)}
            <Button onClick={handleEdit} className="bg-[#1a3a6c] hover:bg-[#1a3a6c]/90">
              <Edit className="h-4 w-4 mr-2" />
              Edytuj
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm font-medium">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  Podstawowe informacje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Numer szkody</p>
                  <p className="font-medium">{claim.spartaNumber || claim.claimNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Numer szkody TU</p>
                  <p className="font-medium">{claim.insurerClaimNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(claim.claimStatusId)}</div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Klient</p>
                  <p className="font-medium">{claim.client || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Prowadzący</p>
                  <p className="font-medium">{claim.handler || "-"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm font-medium">
                  <Calendar className="h-4 w-4 mr-2 text-green-600" />
                  Daty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Data zdarzenia</p>
                  <p className="font-medium">{formatDate(claim.damageDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Godzina zdarzenia</p>
                  <p className="font-medium">{claim.eventTime || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Data zgłoszenia</p>
                  <p className="font-medium">{formatDate(claim.reportDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Data zgłoszenia do TU</p>
                  <p className="font-medium">{formatDate(claim.reportDateToInsurer)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm font-medium">
                  <Euro className="h-4 w-4 mr-2 text-yellow-600" />
                  Kwoty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Całkowita szkoda</p>
                  <p className="font-medium text-lg">{formatCurrency(claim.totalClaim, claim.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Wypłata</p>
                  <p className="font-medium text-lg">{formatCurrency(claim.payout, claim.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Waluta</p>
                  <p className="font-medium">{claim.currency || "PLN"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-red-600" />
                Szczegóły zdarzenia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Miejsce zdarzenia</p>
                  <p className="font-medium">{claim.eventLocation || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rodzaj szkody</p>
                  <p className="font-medium">{claim.damageType || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ryzyko szkody</p>
                  <p className="font-medium">
                    {claim.riskType
                      ?
                          riskTypeMap[String(claim.riskType).toLowerCase()] ||
                            String(claim.riskType)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Obszar</p>
                  <p className="font-medium">{claim.area || "-"}</p>
                </div>
              </div>
              {claim.eventDescription && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Opis zdarzenia</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">{claim.eventDescription}</p>
                </div>
              )}
              {claim.comments && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Uwagi</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">{claim.comments}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participants */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Injured Party */}
            {claim.injuredParty && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-600" />
                    Poszkodowany
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nazwa</p>
                    <p className="font-medium">{claim.injuredParty.name || "-"}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Telefon</p>
                      <p className="font-medium flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {claim.injuredParty.phone || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {claim.injuredParty.email || "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Adres</p>
                    <p className="font-medium">
                      {claim.injuredParty.address && claim.injuredParty.city
                        ? `${claim.injuredParty.address}, ${claim.injuredParty.postalCode} ${claim.injuredParty.city}`
                        : "-"}
                    </p>
                  </div>
                  {/* Drivers Section */}
                  {(claim.injuredParty?.drivers && claim.injuredParty.drivers.length > 0) && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Kierowcy ({claim.injuredParty.drivers.length})</p>
                      <div className="space-y-4">
                        {claim.injuredParty.drivers.map((driver, index) => (
                          <div key={`driver-${index}`} className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-gray-900">
                                {driver.firstName} {driver.lastName} {driver.name && `(${driver.name})`}
                              </h5>
                              {driver.role && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {driver.role === 'driver' ? 'Kierowca' :
                                   driver.role === 'owner' ? 'Właściciel' :
                                   driver.role === 'co-owner' ? 'Współwłaściciel' : driver.role}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              {driver.personalId && (
                                <div>
                                  <span className="text-gray-500">PESEL/Paszport:</span>
                                  <p className="font-medium">{driver.personalId}</p>
                                </div>
                              )}
                              {driver.licenseNumber && (
                                <div>
                                  <span className="text-gray-500">Prawo jazdy:</span>
                                  <p className="font-medium">{driver.licenseNumber}</p>
                                </div>
                              )}
                              {driver.citizenship && (
                                <div>
                                  <span className="text-gray-500">Obywatelstwo:</span>
                                  <p className="font-medium">{driver.citizenship}</p>
                                </div>
                              )}
                              {driver.phone && (
                                <div>
                                  <span className="text-gray-500">Telefon:</span>
                                  <p className="font-medium">{driver.phone}</p>
                                </div>
                              )}
                              {driver.email && (
                                <div>
                                  <span className="text-gray-500">Email:</span>
                                  <p className="font-medium">{driver.email}</p>
                                </div>
                              )}
                            </div>

                            {(driver.address || driver.city || driver.street) && (
                              <div className="border-t pt-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Adres</span>
                                <div className="mt-1 text-sm">
                                  {driver.street && <p>{driver.street} {driver.houseNumber}{driver.flatNumber ? `/${driver.flatNumber}` : ''}</p>}
                                  {driver.address && !driver.street && <p>{driver.address}</p>}
                                  {(driver.postalCode || driver.city) && (
                                    <p>{driver.postalCode} {driver.city}</p>
                                  )}
                                  {driver.country && driver.country !== 'PL' && <p>{driver.country}</p>}
                                </div>
                              </div>
                            )}

                            {(driver.owner || driver.coOwner) && (
                              <div className="border-t pt-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Właściciele</span>
                                <div className="mt-1 text-sm space-y-1">
                                  {driver.owner && (
                                    <div>
                                      <span className="text-gray-500">Właściciel:</span>
                                      <span className="ml-2 font-medium">{driver.owner}</span>
                                    </div>
                                  )}
                                  {driver.coOwner && (
                                    <div>
                                      <span className="text-gray-500">Współwłaściciel:</span>
                                      <span className="ml-2 font-medium">{driver.coOwner}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {driver.emailConsent && (
                              <div className="border-t pt-2">
                                <div className="flex items-center text-xs text-green-600">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Zgoda na korespondencję elektroniczną
                                </div>
                              </div>
                            )}

                            {driver.additionalInfo && (
                              <div className="border-t pt-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Dodatkowe informacje</span>
                                <p className="mt-1 text-sm text-gray-700">{driver.additionalInfo}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Perpetrator */}
            {claim.perpetrator && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Sprawca
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nazwa</p>
                    <p className="font-medium">{claim.perpetrator.name || "-"}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Telefon</p>
                      <p className="font-medium flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {claim.perpetrator.phone || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {claim.perpetrator.email || "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Adres</p>
                    <p className="font-medium">
                      {claim.perpetrator.address && claim.perpetrator.city
                        ? `${claim.perpetrator.address}, ${claim.perpetrator.postalCode} ${claim.perpetrator.city}`
                        : "-"}
                    </p>
                  </div>
                  {/* Drivers Section */}
                  {(claim.perpetrator?.drivers && claim.perpetrator.drivers.length > 0) && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Kierowcy ({claim.perpetrator.drivers.length})</p>
                      <div className="space-y-4">
                        {claim.perpetrator.drivers.map((driver, index) => (
                          <div key={`perp-driver-primary-${index}`} className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-gray-900">
                                {driver.firstName} {driver.lastName} {driver.name && `(${driver.name})`}
                              </h5>
                              {driver.role && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {driver.role === 'driver' ? 'Kierowca' :
                                   driver.role === 'owner' ? 'Właściciel' :
                                   driver.role === 'co-owner' ? 'Współwłaściciel' : driver.role}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              {driver.personalId && (
                                <div>
                                  <span className="text-gray-500">PESEL/Paszport:</span>
                                  <p className="font-medium">{driver.personalId}</p>
                                </div>
                              )}
                              {driver.licenseNumber && (
                                <div>
                                  <span className="text-gray-500">Prawo jazdy:</span>
                                  <p className="font-medium">{driver.licenseNumber}</p>
                                </div>
                              )}
                              {driver.citizenship && (
                                <div>
                                  <span className="text-gray-500">Obywatelstwo:</span>
                                  <p className="font-medium">{driver.citizenship}</p>
                                </div>
                              )}
                              {driver.phone && (
                                <div>
                                  <span className="text-gray-500">Telefon:</span>
                                  <p className="font-medium">{driver.phone}</p>
                                </div>
                              )}
                              {driver.email && (
                                <div>
                                  <span className="text-gray-500">Email:</span>
                                  <p className="font-medium">{driver.email}</p>
                                </div>
                              )}
                            </div>

                            {(driver.address || driver.city || driver.street) && (
                              <div className="border-t pt-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Adres</span>
                                <div className="mt-1 text-sm">
                                  {driver.street && <p>{driver.street} {driver.houseNumber}{driver.flatNumber ? `/${driver.flatNumber}` : ''}</p>}
                                  {driver.address && !driver.street && <p>{driver.address}</p>}
                                  {(driver.postalCode || driver.city) && (
                                    <p>{driver.postalCode} {driver.city}</p>
                                  )}
                                  {driver.country && driver.country !== 'PL' && <p>{driver.country}</p>}
                                </div>
                              </div>
                            )}

                            {(driver.owner || driver.coOwner) && (
                              <div className="border-t pt-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Właściciele</span>
                                <div className="mt-1 text-sm space-y-1">
                                  {driver.owner && (
                                    <div>
                                      <span className="text-gray-500">Właściciel:</span>
                                      <span className="ml-2 font-medium">{driver.owner}</span>
                                    </div>
                                  )}
                                  {driver.coOwner && (
                                    <div>
                                      <span className="text-gray-500">Współwłaściciel:</span>
                                      <span className="ml-2 font-medium">{driver.coOwner}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {driver.emailConsent && (
                              <div className="border-t pt-2">
                                <div className="flex items-center text-xs text-green-600">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Zgoda na korespondencję elektroniczną
                                </div>
                              </div>
                            )}

                            {driver.additionalInfo && (
                              <div className="border-t pt-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Dodatkowe informacje</span>
                                <p className="mt-1 text-sm text-gray-700">{driver.additionalInfo}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Perpetrator */}
            {claim.perpetrator && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Sprawca
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nazwa</p>
                    <p className="font-medium">{claim.perpetrator.name || "-"}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Telefon</p>
                      <p className="font-medium flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {claim.perpetrator.phone || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {claim.perpetrator.email || "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Adres</p>
                    <p className="font-medium">
                      {claim.perpetrator.address && claim.perpetrator.city
                        ? `${claim.perpetrator.address}, ${claim.perpetrator.postalCode} ${claim.perpetrator.city}`
                        : "-"}
                    </p>
                  </div>
                  {/* Drivers Section */}
                  {(claim.perpetrator?.drivers && claim.perpetrator.drivers.length > 0) && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Kierowcy ({claim.perpetrator.drivers.length})</p>
                      <div className="space-y-4">
                        {claim.perpetrator.drivers.map((driver, index) => (
                          <div key={`perp-driver-secondary-${index}`} className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-gray-900">
                                {driver.firstName} {driver.lastName} {driver.name && `(${driver.name})`}
                              </h5>
                              {driver.role && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {driver.role === 'driver' ? 'Kierowca' :
                                   driver.role === 'owner' ? 'Właściciel' :
                                   driver.role === 'co-owner' ? 'Współwłaściciel' : driver.role}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              {driver.personalId && (
                                <div>
                                  <span className="text-gray-500">PESEL/Paszport:</span>
                                  <p className="font-medium">{driver.personalId}</p>
                                </div>
                              )}
                              {driver.licenseNumber && (
                                <div>
                                  <span className="text-gray-500">Prawo jazdy:</span>
                                  <p className="font-medium">{driver.licenseNumber}</p>
                                </div>
                              )}
                              {driver.citizenship && (
                                <div>
                                  <span className="text-gray-500">Obywatelstwo:</span>
                                  <p className="font-medium">{driver.citizenship}</p>
                                </div>
                              )}
                              {driver.phone && (
                                <div>
                                  <span className="text-gray-500">Telefon:</span>
                                  <p className="font-medium">{driver.phone}</p>
                                </div>
                              )}
                              {driver.email && (
                                <div>
                                  <span className="text-gray-500">Email:</span>
                                  <p className="font-medium">{driver.email}</p>
                                </div>
                              )}
                            </div>

                            {(driver.address || driver.city || driver.street) && (
                              <div className="border-t pt-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Adres</span>
                                <div className="mt-1 text-sm">
                                  {driver.street && <p>{driver.street} {driver.houseNumber}{driver.flatNumber ? `/${driver.flatNumber}` : ''}</p>}
                                  {driver.address && !driver.street && <p>{driver.address}</p>}
                                  {(driver.postalCode || driver.city) && (
                                    <p>{driver.postalCode} {driver.city}</p>
                                  )}
                                  {driver.country && driver.country !== 'PL' && <p>{driver.country}</p>}
                                </div>
                              </div>
                            )}

                            {(driver.owner || driver.coOwner) && (
                              <div className="border-t pt-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Właściciele</span>
                                <div className="mt-1 text-sm space-y-1">
                                  {driver.owner && (
                                    <div>
                                      <span className="text-gray-500">Właściciel:</span>
                                      <span className="ml-2 font-medium">{driver.owner}</span>
                                    </div>
                                  )}
                                  {driver.coOwner && (
                                    <div>
                                      <span className="text-gray-500">Współwłaściciel:</span>
                                      <span className="ml-2 font-medium">{driver.coOwner}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {driver.emailConsent && (
                              <div className="border-t pt-2">
                                <div className="flex items-center text-xs text-green-600">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Zgoda na korespondencję elektroniczną
                                </div>
                              </div>
                            )}

                            {driver.additionalInfo && (
                              <div className="border-t pt-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">Dodatkowe informacje</span>
                                <p className="mt-1 text-sm text-gray-700">{driver.additionalInfo}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Damages */}
          {claim.damages && claim.damages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="h-5 w-5 mr-2 text-orange-600" />
                  Uszkodzenia ({claim.damages.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {claim.damages.map((damage, index) => (
                    <div key={`damage-${index}`} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{damage.description}</h4>
                        {damage.estimatedCost && (
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(damage.estimatedCost)}
                          </span>
                        )}
                      </div>
                      {damage.detail && <p className="text-sm text-gray-600 mb-2">{damage.detail}</p>}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Lokalizacja:</span>
                          <p className="font-medium">{damage.location || "-"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Nasilenie:</span>
                          <p className="font-medium">{damage.severity || "-"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status naprawy:</span>
                          <p className="font-medium">{damage.repairStatus || "-"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Warsztat:</span>
                          <p className="font-medium">{damage.repairShop || "-"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services Called */}
          {claim.servicesCalled && claim.servicesCalled.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-600" />
                  Wezwane służby
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {claim.servicesCalled.map((service, index) => (
                    <Badge key={`service-${index}`} variant="outline" className="capitalize">
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Repair Schedules and Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Repair Schedules */}
            <div>
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                <h3 className="text-sm font-semibold">Harmonogram naprawy</h3>
              </div>
                {repairSchedules.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium mb-1">Brak harmonogramów naprawy</p>
                    <p className="text-gray-400 text-sm mb-4">Przejdź do sekcji "Harmonogram" aby dodać harmonogram</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <Button onClick={handleAddSchedule} size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Dodaj tutaj
                      </Button>
                      <Button onClick={handleGoToScheduleSection} size="sm" variant="ghost">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Zobacz szczegóły
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {repairSchedules.slice(0, 2).map((schedule, index) => (
                      <div key={schedule.id || index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">Harmonogram #{index + 1}</h4>
                          {(() => {
                            const statusConfig = {
                              draft: { label: "Szkic", color: "bg-gray-100 text-gray-800" },
                              submitted: { label: "Przesłany", color: "bg-blue-100 text-blue-800" },
                              approved: { label: "Zatwierdzony", color: "bg-green-100 text-green-800" },
                              completed: { label: "Zakończony", color: "bg-purple-100 text-purple-800" },
                            }
                            const config = statusConfig[schedule.status as keyof typeof statusConfig] || statusConfig.draft
                            return <Badge className={`${config.color} text-xs`}>{config.label}</Badge>
                          })()}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Data rozpoczęcia</span>
                            <p className="font-medium">{schedule.repairStartDate ? formatDate(schedule.repairStartDate) : "-"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Planowane zakończenie</span>
                            <p className="font-medium">{schedule.repairEndDate ? formatDate(schedule.repairEndDate) : "-"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Warsztat</span>
                            <p className="font-medium">{schedule.companyName || "-"}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Koszt</span>
                            <p className="font-medium">{schedule.cost ? formatCurrency(schedule.cost) : "-"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {repairSchedules.length > 2 && (
                      <div className="text-center pt-2">
                        <Button onClick={handleGoToScheduleSection} size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Zobacz wszystkie ({repairSchedules.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
          </div>
        </div>
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
              <h3 className="text-sm font-semibold text-gray-700">Czas naprawy (roboczogodziny)</h3>
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
    </div>
  )
}
