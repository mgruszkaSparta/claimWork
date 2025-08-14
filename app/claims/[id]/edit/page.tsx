"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Save, ArrowLeft } from "lucide-react"
import { ClaimFormSidebar } from "@/components/claim-form/claim-form-sidebar"
import { ClaimTopHeader } from "@/components/claim-form/claim-top-header"
import { ClaimMainContent } from "@/components/claim-form/claim-main-content"
import { useClaimForm } from "@/hooks/use-claim-form"
import { useClaims, transformApiClaimToFrontend } from "@/hooks/use-claims"
import type { UploadedFile, RequiredDocument } from "@/types"

export default function EditClaimPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { updateClaim } = useClaims()
  const [activeClaimSection, setActiveClaimSection] = useState("dane-zdarzenia")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const id = params.id as string

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "Analiza zmian.csv",
      size: 301,
      type: "other",
      url: "/placeholder.svg?width=400&height=300",
    },
  ])

  const [requiredDocuments, setRequiredDocuments] = useState<RequiredDocument[]>([
    {
      id: "1", name: "Dowód rejestracyjny", required: true, uploaded: false,
      description: ""
    },
    {
      id: "2", name: "Dyspozycja dotycząca wypłaty odszkodowania", required: true, uploaded: false,
      description: ""
    },
    { id: "3", name: "Kalkulacja naprawy", required: true, uploaded: false },
    {
      id: "4", name: "Ocena techniczna", required: true, uploaded: false,
      description: ""
    },
    {
      id: "5", name: "Oświadczenie o trzeźwości", required: true, uploaded: false,
      description: ""
    },
    {
      id: "6", name: "Prawo jazdy", required: true, uploaded: false,
      description: ""
    },
    {
      id: "7", name: "Świadectwo kwalifikacji", required: true, uploaded: false,
      description: ""
    },
    {
      id: "8", name: "Zdjęcia", required: true, uploaded: false,
      description: ""
    },
    {
      id: "9", name: "Zgłoszenie szkody", required: true, uploaded: false,
      description: ""
    },
    {
      id: "10", name: "Akceptacja kalkulacji naprawy", required: true, uploaded: false,
      description: ""
    },
    {
      id: "11", name: "Faktura za holowanie", required: true, uploaded: false,
      description: ""
    },
    {
      id: "12", name: "Faktura za wynajem", required: true, uploaded: false,
      description: ""
    },
  ])

  const {
    claimFormData,
    setClaimFormData,
    handleFormChange,
    handleParticipantChange,
    handleDriverChange,
    handleAddDriver,
    handleRemoveDriver,
  } = useClaimForm()

  // Stable function to load claim data
  const loadClaimData = useCallback(async () => {
    if (!id) {
      setLoadError("Brak ID szkody")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setLoadError(null)

      // Direct API call instead of using the hook to avoid loops
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/claims/${id}`, {
        method: "GET",
        credentials: "include",
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const claimData = await response.json()
      if (claimData) {

        const transformedData = transformApiClaimToFrontend(claimData)

        setClaimFormData(transformedData)
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
  }, [id, setClaimFormData, toast])

  // Load claim data on mount
  useEffect(() => {
    loadClaimData()
  }, [loadClaimData])

  const handleSaveClaim = async (exitAfterSave = false) => {
    if (isSaving || !id) return

    setIsSaving(true)
    try {
      // Settlements and recourses are managed via their own endpoints; remove
      // them from the claim payload to avoid unintentionally overwriting
      // existing records.
      const {
        settlements: _settlements,
        recourses: _recourses,
        ...claimWithoutSettlementsRecourses
      } = claimFormData

      const updatedClaim = await updateClaim(
        id,
        claimWithoutSettlementsRecourses,
      )

      if (updatedClaim) {
        setClaimFormData(updatedClaim)
        toast({
          title: "Szkoda zaktualizowana",
          description: `Szkoda ${updatedClaim.spartaNumber || updatedClaim.claimNumber} została pomyślnie zaktualizowana.`,
        })
        if (exitAfterSave) {
          router.push("/claims")
        }
      }
    } catch (error) {
      console.error("Error updating claim:", error)
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Wystąpił błąd podczas aktualizacji szkody.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    router.push("/claims")
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#1a3a6c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Ładowanie szkody...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
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
          Powrót
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
      <Toaster />
    </div>
  )
}
