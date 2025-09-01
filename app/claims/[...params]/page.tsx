"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Save,
  ArrowLeft,
  Edit,
  FileText,
  Calendar,
  User,
  Car,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  Euro,
  Users,
} from "lucide-react"
import { ClaimFormSidebar } from "@/components/claim-form/claim-form-sidebar"
import { ClaimTopHeader } from "@/components/claim-form/claim-top-header"
import { ClaimMainContent } from "@/components/claim-form/claim-main-content"
import { useClaimForm } from "@/hooks/use-claim-form"
import { useClaims, transformApiClaimToFrontend } from "@/hooks/use-claims"
import { useAuth } from "@/hooks/use-auth"
import type { Claim, UploadedFile, RequiredDocument } from "@/types"
import { getRequiredDocumentsByObjectType } from "@/lib/required-documents"

type PageMode = "new" | "view" | "edit"

export default function ClaimPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { createClaim, updateClaim } = useClaims()
  const { user } = useAuth()

  // Determine page mode and ID from params
  const paramsArray = Array.isArray(params.params) ? params.params : [params.params].filter(Boolean)
  const isNew = paramsArray[0] === "new"
  const claimId = isNew ? null : paramsArray[0]
  const isEdit = paramsArray[1] === "edit" || isNew
  const mode: PageMode = isNew ? "new" : isEdit ? "edit" : "view"

  const [activeClaimSection, setActiveClaimSection] = useState("teczka-szkodowa")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(!isNew)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [claim, setClaim] = useState<Claim | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

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

  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>(() =>
    getRequiredDocumentsByObjectType()
  )

  useEffect(() => {
    if (user?.roles) {
      const privileged = user.roles.some((r) =>
        ["likwidacja", "administrator", "admin"].includes(r.toLowerCase()),
      )
      setActiveClaimSection(privileged ? "dane-zdarzenia" : "teczka-szkodowa")
    }
  }, [user])

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [activeClaimSection])

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
    const objectType = claim?.objectTypeId || claimFormData.objectTypeId
    if (objectType) {
      setRequiredDocuments(getRequiredDocumentsByObjectType(objectType))
    }
  }, [claim?.objectTypeId, claimFormData.objectTypeId])

  // Load claim data for existing claims
  const loadClaimData = useCallback(async () => {
    if (!claimId) return

    try {
      setIsLoading(true)
      setLoadError(null)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/claims/${claimId}`, {
        method: "GET",
        credentials: "omit",
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const claimData = await response.json()
      if (claimData) {

        const transformedData = transformApiClaimToFrontend(claimData)


        setClaim(transformedData)
        if (mode === "edit") {
          setClaimFormData(transformedData)
        }
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
  }, [claimId, mode, setClaimFormData, toast])

  useEffect(() => {
    if (claimId) {
      loadClaimData()
    }
  }, [loadClaimData])

  useEffect(() => {
    if (!claimId && user) {
      setClaimFormData((prev) => ({ ...prev, registeredById: user.id, registeredByName: user.username }))
    }
  }, [claimId, user, setClaimFormData])

  const handleSaveClaim = async (exitAfterSave = false) => {
    if (isSaving) return

    setIsSaving(true)
    try {
      if (mode === "new") {
        const newClaimData = {
          ...claimFormData,
          claimNumber: `PL${new Date().getFullYear()}${String(Date.now()).slice(-8)}`,
          registeredById: user?.id,
        } as Claim

        const createdClaim = await createClaim(newClaimData)
        if (createdClaim) {
          toast({
            title: "Szkoda dodana",
            description: `Nowa szkoda ${createdClaim.spartaNumber} została pomyślnie dodana.`,
          })

          if (exitAfterSave) {
            router.push("/claims")
          } else {
            // Redirect to edit mode of the newly created claim
            router.push(`/claims/${createdClaim.id}/edit`)
          }
        } else {
          throw new Error("Nie udało się utworzyć szkody")
        }
      } else if (mode === "edit" && claimId) {
        const {
          settlements: _settlements,
          recourses: _recourses,
          ...claimWithoutSettlementsRecourses
        } = claimFormData
        const updatedClaim = await updateClaim(
          claimId,
          claimWithoutSettlementsRecourses,
        )
        toast({
          title: "Szkoda zaktualizowana",
          description: `Szkoda ${updatedClaim.spartaNumber || updatedClaim.claimNumber} została pomyślnie zaktualizowana.`,
        })

        if (exitAfterSave) {
          router.push("/claims")
        } else {
          // Refresh the data
          await loadClaimData()
        }
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
    router.push("/claims")
  }

  const handleEdit = () => {
    if (claimId) {
      router.push(`/claims/${claimId}/edit`)
    }
  }

  const handleView = () => {
    if (claimId) {
      router.push(`/claims/${claimId}`)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    try {
      return new Date(dateString).toLocaleDateString("pl-PL")
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount?: number, currency = "PLN") => {
    if (amount === undefined || amount === null) return "-"
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const getStatusBadge = (status?: string) => {
    const statusColors: Record<string, string> = {
      nowa: "bg-blue-100 text-blue-800",
      "w-trakcie": "bg-yellow-100 text-yellow-800",
      zamknieta: "bg-green-100 text-green-800",
      anulowana: "bg-red-100 text-red-800",
    }

    return <Badge className={statusColors[status || "nowa"] || "bg-gray-100 text-gray-800"}>{status || "Nowa"}</Badge>
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#1a3a6c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">
            {mode === "new" ? "Przygotowywanie formularza..." : "Ładowanie szkody..."}
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (loadError && mode !== "new") {
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
          <p className="text-gray-600 mb-4">{loadError}</p>
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

  // Form mode (new or edit)
  if (mode === "new" || mode === "edit") {
    return (
      <div className="flex flex-col h-screen bg-white">
        <ClaimTopHeader claimFormData={claimFormData} onClose={handleClose} />
        <div className="flex flex-1 overflow-hidden min-h-0">
          <ClaimFormSidebar
            activeClaimSection={activeClaimSection}
            setActiveClaimSection={setActiveClaimSection}
            claimObjectType={claim?.objectTypeId?.toString()}
            counts={{
              roszczenia:
                (mode === "view"
                  ? claim?.clientClaims?.length
                  : claimFormData.clientClaims?.length) || 0,

              decyzje:
                (mode === "view"
                  ? claim?.decisions?.length
                  : claimFormData.decisions?.length) || 0,
              odwolanie:
                (mode === "view"
                  ? claim?.appeals?.length
                  : claimFormData.appeals?.length) || 0,
              regres:
                (mode === "view"
                  ? claim?.recourses?.length
                  : claimFormData.recourses?.length) || 0,
              ugody:
                (mode === "view"
                  ? claim?.settlements?.length
                  : claimFormData.settlements?.length) || 0,
              notatki:
                (mode === "view"
                  ? claim?.notes?.length
                  : claimFormData.notes?.length) || 0,
              dokumenty:
                mode === "view"
                  ? claim?.documents?.length || 0
                  : (claimFormData.documents?.length || 0) + uploadedFiles.length,

            }}
          />
          <div ref={contentRef} className="flex-1 overflow-y-auto bg-gray-50">
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
                initialClaimObjectType={
                  claim?.objectTypeId?.toString() ?? claimFormData.objectTypeId?.toString()
                }
              />
            </div>
          </div>
        </div>
        <div className="fixed bottom-4 right-4 flex space-x-2 z-60">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="shadow-lg bg-transparent"
            disabled={isSaving}
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            {mode === "new" ? "Anuluj" : "Powrót"}
          </Button>
          {mode === "edit" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              className="shadow-lg bg-transparent"
              disabled={isSaving}
            >
              Podgląd
            </Button>
          )}
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
        <Toaster />
      </div>
    )
  }

  // View mode
  if (mode === "view" && claim) {
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
                <h1 className="text-xl font-semibold text-gray-900">
                  Szkoda {claim.spartaNumber || claim.claimNumber}
                </h1>
                <p className="text-sm text-gray-500">
                  {claim.brand} {claim.model} • {claim.owner}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(claim.status)}
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
                    <div className="mt-1">{getStatusBadge(claim.status)}</div>
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
                    <p className="font-medium">{claim.riskType || "-"}</p>
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
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Pojazd</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Rejestracja:</span>
                          <span className="font-medium">{claim.injuredParty.vehicleRegistration || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Marka/Model:</span>
                          <span className="font-medium">
                            {claim.injuredParty.vehicleBrand} {claim.injuredParty.vehicleModel || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">VIN:</span>
                          <span className="font-medium">{claim.injuredParty.vehicleVin || "-"}</span>
                        </div>
                      </div>
                    </div>
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
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Pojazd</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Rejestracja:</span>
                          <span className="font-medium">{claim.perpetrator.vehicleRegistration || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Marka/Model:</span>
                          <span className="font-medium">
                            {claim.perpetrator.vehicleBrand} {claim.perpetrator.vehicleModel || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">VIN:</span>
                          <span className="font-medium">{claim.perpetrator.vehicleVin || "-"}</span>
                        </div>
                      </div>
                    </div>
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
          </div>
        </div>

        <Toaster />
      </div>
    )
  }

  // Fallback
  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-lg font-medium text-gray-900 mb-2">Nie znaleziono szkody</p>
        <Button onClick={handleClose}>Powrót do listy</Button>
      </div>
    </div>
  )
}
