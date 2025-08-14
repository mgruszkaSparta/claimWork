"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, AlertTriangle, User, FileSignature, Wrench, Car, X, MessageSquare, Clock, FileCheck, Search, Mail, Plus, CheckCircle, Trash2, Save, Calendar, Phone, MapPin, Paperclip, DollarSign, Gavel, ArrowUpDown, HandHeart, Users, CreditCard, Shield, UserCheck } from 'lucide-react'
import { DamageDiagram } from "@/components/damage-diagram"
import { ParticipantForm } from "./participant-form"
import { DocumentsSection } from "../documents-section"
import { DecisionsSection } from "./decisions-section"
import { AppealsSection } from "./appeals-section"
import { ClientClaimsSection } from "./client-claims-section"
import { RecourseSection } from "./recourse-section"
import { SettlementsSection } from "./settlements-section"
import { DamageBasicInfoSection } from "./damage-basic-info-section"
import { DamageVehicleDetailsSection } from "./damage-vehicle-details-section"
import { DamageInspectionSection } from "./damage-inspection-section"
import type {
  Claim,
  Service,
  ParticipantInfo,
  DriverInfo,
  UploadedFile,
  RequiredDocument,
  Decision,
  Note,
} from "@/types"
import { EmailSection } from "../email/email-section-compact"
import { DependentSelect } from "@/components/ui/dependent-select"
import { useToast } from "@/hooks/use-toast"
import { useDamages, createDamageDraft } from "@/hooks/use-damages"
import { RepairScheduleSection } from "./repair-schedule-section"
import { RepairDetailsSection } from "./repair-details-section"
import type { RepairDetail } from "@/lib/repair-details-store"

interface RiskType {
  value: string
  label: string
}

interface ClaimStatus {
  id: number
  name: string
  description: string
}

interface ClaimMainContentProps {
  activeClaimSection: string
  claimFormData: Partial<Claim>
  handleFormChange: (field: keyof Claim, value: any) => void
  handleParticipantChange: (
    party: "injuredParty" | "perpetrator",
    field: keyof Omit<ParticipantInfo, "drivers">,
    value: any,
  ) => void
  handleDriverChange: (
    party: "injuredParty" | "perpetrator",
    driverIndex: number,
    field: keyof DriverInfo,
    value: any,
  ) => void
  handleAddDriver: (party: "injuredParty" | "perpetrator") => void
  handleRemoveDriver: (party: "injuredParty" | "perpetrator", driverIndex: number) => void
  uploadedFiles: UploadedFile[]
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
  requiredDocuments: RequiredDocument[]
  setRequiredDocuments: React.Dispatch<React.SetStateAction<RequiredDocument[]>>
  initialClaimObjectType?: string
}

const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return ""
  // If it's already in YYYY-MM-DD, just return it
  if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
    return dateString.split("T")[0]
  }
  // Handle DD.MM.YYYY format
  const parts = dateString.split(".")
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month}-${day}`
  }
  // Handle full ISO string
  const date = new Date(dateString)
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0]
  }
  return ""
}

// Modern Info Card Component
const InfoCard = ({
  icon,
  label,
  value,
  className = "",
}: { icon?: React.ReactNode; label: string; value: string; className?: string }) => (
  <div className={`bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow ${className}`}>
    <div className="flex items-center space-x-2 mb-1">
      {icon && <div className="text-gray-400">{icon}</div>}
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-sm font-medium text-gray-900 truncate">{value || "Nie określono"}</p>
  </div>
)

// Modern Status Badge Component
const StatusBadge = ({ status, variant = "default" }: { status?: string; variant?: "default" | "white" }) => {
  const getStatusConfig = (statusCode?: string) => {
    const baseClasses = variant === "white" ? "bg-white shadow-sm" : ""
    switch (statusCode) {
      case "NEW":
        return {
          label: "Nowa",
          color:
            variant === "white"
              ? `${baseClasses} text-blue-700 border-blue-200`
              : "bg-blue-50 text-blue-700 border-blue-200",
        }
      case "IN_PROGRESS":
        return {
          label: "W trakcie",
          color:
            variant === "white"
              ? `${baseClasses} text-yellow-700 border-yellow-200`
              : "bg-yellow-50 text-yellow-700 border-yellow-200",
        }
      case "CLOSED":
        return {
          label: "Zamknięta",
          color:
            variant === "white"
              ? `${baseClasses} text-green-700 border-green-200`
              : "bg-green-50 text-green-700 border-green-200",
        }
      case "SUSPENDED":
        return {
          label: "Zawieszona",
          color:
            variant === "white"
              ? `${baseClasses} text-red-700 border-red-200`
              : "bg-red-50 text-red-700 border-red-200",
        }
      default:
        return {
          label: statusCode || "Nie określono",
          color:
            variant === "white"
              ? `${baseClasses} text-gray-700 border-gray-200`
              : "bg-gray-50 text-gray-700 border-gray-200",
        }
    }
  }

  const config = getStatusConfig(status)
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
      {config.label}
    </span>
  )
}

export const ClaimMainContent = ({
  activeClaimSection,
  claimFormData = {},
  handleFormChange,
  handleParticipantChange,
  handleDriverChange,
  handleAddDriver,
  handleRemoveDriver,
  uploadedFiles = [],
  setUploadedFiles,
  requiredDocuments = [],
  setRequiredDocuments,
  initialClaimObjectType = "1",
}: ClaimMainContentProps) => {
  const { toast } = useToast()

  const { createDamage, deleteDamage, fetchDamages } = useDamages(claimFormData.id)

  const isGuid = (value: string) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)

  const eventId = claimFormData.id && isGuid(claimFormData.id) ? claimFormData.id : undefined

  const [repairDetails, setRepairDetails] = useState<RepairDetail[]>([])

  useEffect(() => {
    const loadRepairDetails = async () => {
      if (!eventId) return
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/repair-details?eventId=${eventId}`,
          {
            method: "GET",
            credentials: "include",
          }
        )
        if (response.ok) {
          const data = await response.json()
          setRepairDetails(data)
        }
      } catch (error) {
        console.error("Error loading repair details:", error)
      }
    }

    loadRepairDetails()
  }, [eventId])

  const summaryStatus =
    repairDetails.length === 0
      ? ""
      : repairDetails.some((d) => d.status === "in-progress")
      ? "W trakcie"
      : repairDetails.every((d) => d.status === "completed")
      ? "Zakończone"
      : "Szkic"



  // State for dropdown data
  const [riskTypes, setRiskTypes] = useState<RiskType[]>([])
  const [loadingRiskTypes, setLoadingRiskTypes] = useState(false)
  const [claimObjectType, setClaimObjectType] = useState<string>(initialClaimObjectType) // Default to communication claims

  // Add to the state declarations at the top of the component (around line 80)

  // Form states
  const [showNoteForm, setShowNoteForm] = useState<string | null>(null)
  const [noteForm, setNoteForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  })

  const [taskFilter, setTaskFilter] = useState({
    status: "wszystkie",
    priority: "wszystkie",
    search: "",
  })

  useEffect(() => {
    if (!claimFormData.id) return

    const loadDamages = async () => {
      try {
        const data = await fetchDamages(claimFormData.id)
        handleFormChange("damages", data)
      } catch (error) {
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać szkód.",
          variant: "destructive",
        })
      }
    }

    loadDamages()
  }, [claimFormData.id])

  // Notes are managed via claimFormData

  // State for expanded sections in teczka-szkodowa
  const [expandedSections, setExpandedSections] = useState({
    harmonogram: false,
    naprawa: false,
  })

  const [autoShowRepairForm, setAutoShowRepairForm] = useState(false)

  const [claimStatuses, setClaimStatuses] = useState<ClaimStatus[]>([])

  useEffect(() => {
    const clearCommunicationFields = () => {
      handleFormChange("vehicleType", "")
      handleFormChange("brand", "")
      handleFormChange("vehicleNumber", "")
      handleFormChange("liquidator", "")
    }

    const clearPropertyFields = () => {
      handleFormChange("propertySubject", "")
      handleFormChange("propertyDamageList", [])
      handleFormChange("injuredPartyData", {})
    }

    const clearTransportFields = () => {
      handleFormChange("cargoDetails", "")
      handleFormChange("carrierInfo", "")
    }

    if (claimObjectType === "1") {
      clearPropertyFields()
      clearTransportFields()
    } else if (claimObjectType === "2") {
      clearCommunicationFields()
      clearTransportFields()
    } else if (claimObjectType === "3") {
      clearCommunicationFields()
      clearPropertyFields()
    }
  }, [claimObjectType, handleFormChange])

  // Load data on component mount
  useEffect(() => {
    loadRiskTypes()
    loadClaimStatuses()
  }, [claimObjectType])

  const loadRiskTypes = async () => {
    setLoadingRiskTypes(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/risk-types?claimObjectTypeId=${claimObjectType}`,
        {
          method: "GET",
          credentials: "include",
        },
      )
      if (response.ok) {
        const data = await response.json()
        // Map data according to your database structure
        const riskTypeOptions = data.map((item: any) => ({
          value: item.riskId.toString(), // Use RiskId as value
          label: item.name,
        }))
        setRiskTypes(riskTypeOptions)
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error("Error loading risk types:", error)
      // Fallback data for communication claims (claimObjectTypeId = 1)
      const communicationRiskTypes = [
        { value: "4", label: "OC DZIAŁALNOŚCI" },
        { value: "2", label: "OC SPRAWCY" },
        { value: "6", label: "OC PPM" },
        { value: "7", label: "AC" },
        { value: "19", label: "NAPRAWA WŁASNA" },
        { value: "20", label: "OC W ŻYCIU PRYWATNYM" },
        { value: "22", label: "OC ROLNIKA" },
        { value: "1", label: "INNE" },
      ]

      const propertyRiskTypes = [
        { value: "4", label: "MAJĄTKOWE" },
        { value: "57", label: "NNW" },
        { value: "57", label: "CPM" },
        { value: "57", label: "CAR/EAR" },
        { value: "57", label: "BI" },
        { value: "57", label: "GWARANCJIE" },
      ]

      const transportRiskTypes = [
        { value: "4", label: "OCPD" },
        { value: "4", label: "CARGO" },
      ]

      setRiskTypes(
        claimObjectType === "1"
          ? communicationRiskTypes
          : claimObjectType === "2"
            ? propertyRiskTypes
            : transportRiskTypes,
      )
      
      toast({
        title: "Uwaga",
        description: "Nie udało się załadować danych z serwera. Używane są dane lokalne.",
        variant: "destructive",
      })
    } finally {
      setLoadingRiskTypes(false)
    }
  }

  const loadClaimStatuses = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dictionaries/claim-statuses`,
        {
          method: "GET",
          credentials: "include",
        },
      )
      if (response.ok) {
        const data = await response.json()
        setClaimStatuses(data.items ?? [])
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error("Error loading claim statuses:", error)
      toast({
        title: "Uwaga",
        description: "Nie udało się załadować statusów szkód.",
        variant: "destructive",
      })
    }
  }
  const handleServicesChange = (service: Service, checked: boolean | "indeterminate") => {
    if (typeof checked === "boolean") {
      const currentServices = claimFormData.servicesCalled || []
      let newServices
      if (checked) {
        newServices = [...currentServices, service]
      } else {
        newServices = currentServices.filter((s) => s !== service)
      }
      handleFormChange("servicesCalled", newServices)
    }
  }

  const handleDamagePartToggle = async (partName: string) => {
    const currentDamages = claimFormData.damages || []
    const existing = currentDamages.find((d) => d.description === partName)

    try {
      if (existing) {

        if (existing.eventId && existing.id) {
          await deleteDamage(existing.id)

        }
        const newDamages = currentDamages.filter((d) => d.description !== partName)
        handleFormChange("damages", newDamages)
      } else {

        const unsaved = createDamageDraft({ description: partName, detail: "Do opisu" })
        const newDamages = [...currentDamages, unsaved]

        handleFormChange("damages", newDamages)
      }
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się zapisać szkody",
        variant: "destructive",
      })
    }
  }

  const removeDamageItem = async (description: string) => {
    const currentDamages = claimFormData.damages || []
    const toRemove = currentDamages.find((d) => d.description === description)

    try {

      if (toRemove?.eventId && toRemove.id) {
        await deleteDamage(toRemove.id)

      }
      const newDamages = currentDamages.filter((d) => d.description !== description)
      handleFormChange("damages", newDamages)
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message || "Nie udało się usunąć szkody",
        variant: "destructive",
      })
    }
  }

  const handleDecisionsChange = (decisions: Decision[]) => {
    handleFormChange("decisions", decisions)
  }

  // Notes functions
  const addNote = (type: Note["type"]) => {
    if (!noteForm.title.trim() || !noteForm.description.trim()) {
      toast({
        title: "Błąd",
        description: "Tytuł i opis są wymagane.",
        variant: "destructive",
      })
      return
    }

    const newNote: Note = {
      id: `temp-${Date.now()}`,
      type,
      title: noteForm.title,
      description: noteForm.description,
      user: "",
      createdAt: new Date().toISOString(),
      priority: noteForm.priority,
      status: type === "task" ? "active" : undefined,
      dueDate: noteForm.dueDate || undefined,
    }

    const updatedNotes = [newNote, ...(claimFormData.notes ?? [])]
    handleFormChange("notes", updatedNotes)
    setNoteForm({ title: "", description: "", priority: "medium", dueDate: "" })
    setShowNoteForm(null)

    toast({
      title: "Sukces",
      description: `${getTypeLabel(type)} została dodana pomyślnie.`,
    })
  }

  const updateTaskStatus = (
    noteId: string,
    status: "active" | "completed" | "cancelled",
  ) => {
    const updatedNotes = (claimFormData.notes ?? []).map((note) =>
      note.id === noteId ? { ...note, status } : note,
    )
    handleFormChange("notes", updatedNotes)

    toast({
      title: "Zaktualizowano",
      description: "Status zadania został zmieniony.",
    })
  }

  const deleteNote = (noteId: string) => {
    const updatedNotes = (claimFormData.notes ?? []).filter(
      (note) => note.id !== noteId,
    )
    handleFormChange("notes", updatedNotes)
    toast({
      title: "Usunięto",
      description: "Notatka została usunięta.",
    })
  }

  const cancelNoteForm = () => {
    setShowNoteForm(null)
    setNoteForm({ title: "", description: "", priority: "medium", dueDate: "" })
  }

  const getTypeLabel = (type: Note["type"]) => {
    switch (type) {
      case "note":
        return "Notatka"
      case "task":
        return "Zadanie"
      case "internal":
        return "Notatka wewnętrzna"
      case "status":
        return "Notatka status"
      default:
        return "Notatka"
    }
  }

  const getTypeColor = (type: Note["type"]) => {
    switch (type) {
      case "note":
        return "bg-blue-100 text-blue-800"
      case "task":
        return "bg-green-100 text-green-800"
      case "internal":
        return "bg-yellow-100 text-yellow-800"
      case "status":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const notes = (claimFormData.notes ?? []) as Note[]

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(taskFilter.search.toLowerCase()) ||
      note.description.toLowerCase().includes(taskFilter.search.toLowerCase())
    const matchesStatus = taskFilter.status === "wszystkie" || note.status === taskFilter.status
    const matchesPriority = taskFilter.priority === "wszystkie" || note.priority === taskFilter.priority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const taskStats = {
    active: notes.filter((n) => n.type === "task" && n.status === "active").length,
    cancelled: notes.filter((n) => n.type === "task" && n.status === "cancelled").length,
    completed: notes.filter((n) => n.type === "task" && n.status === "completed").length,
  }

  // Get status label from code
  const getStatusLabel = (statusId?: string) => {
    const status = claimStatuses.find((s) => s.id.toString() === statusId)
    return status ? status.name : statusId || "Nie wybrano"
  }

  // Get risk type label from code
  const getRiskTypeLabel = (riskTypeCode?: string) => {
    const riskType = riskTypes.find((r) => r.value === riskTypeCode)
    return riskType ? riskType.label : riskTypeCode || "Nie wybrano"
  }

  // Initialize participant data if it doesn't exist
  const getParticipantData = (party: "injuredParty" | "perpetrator"): ParticipantInfo => {
    return (
      claimFormData[party] || {
        id: "",
        name: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        phone: "",
        email: "",
        vehicleRegistration: "",
        vehicleVin: "",
        vehicleType: "",
        vehicleBrand: "",
        vehicleModel: "",
        vehicleYear: undefined,
        inspectionContactName: "",
        inspectionContactPhone: "",
        inspectionContactEmail: "",
        insuranceCompany: "",
        policyNumber: "",
        drivers: [{ id: "", name: "", licenseNumber: "" }],
      }
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "cancelled":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  // Toggle expanded section
  const toggleSection = (section: 'harmonogram' | 'naprawa') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Helper function to render participant details
const renderParticipantDetails = (
  participant: ParticipantInfo | undefined,
  title: string,
  icon: React.ReactNode,
  bgColor: string
) => {
  if (!participant) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className={`px-4 py-3 ${bgColor} border-b border-gray-200`}>
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="text-center py-8 text-gray-500">
            <p>Brak danych {title.toLowerCase()}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className={`px-4 py-3 ${bgColor} border-b border-gray-200`}>
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="p-4 space-y-6">
        {/* Dane pojazdu */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center">
            <Car className="h-4 w-4 mr-2 text-blue-600" />
            Dane pojazdu
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Numer rejestracyjny:
              </label>
              <p className="text-sm font-medium text-gray-900">{participant.vehicleRegistration || "Nie określono"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                VIN:
              </label>
              <p className="text-sm font-medium text-gray-900">{participant.vehicleVin || "Nie określono"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Typ pojazdu:
              </label>
              <p className="text-sm font-medium text-gray-900">{participant.vehicleType || "Samochód osobowy"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Marka:
              </label>
              <p className="text-sm font-medium text-gray-900">{participant.vehicleBrand || "Nie określono"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Model:
              </label>
              <p className="text-sm font-medium text-gray-900">{participant.vehicleModel || "Nie określono"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Kraj rejestracji:
              </label>
              <p className="text-sm font-medium text-gray-900">{participant.country === "PL" ? "Polska" : participant.country || "Polska"}</p>
            </div>
          </div>
        </div>

        {/* Polisa */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center">
            <Shield className="h-4 w-4 mr-2 text-green-600" />
            Polisa
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Numer polisy:
              </label>
              <p className="text-sm font-medium text-gray-900">{participant.policyNumber || "Nie określono"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Data rozpoczęcia:
              </label>
              <p className="text-sm font-medium text-gray-900">{participant.policyStartDate || "Nie określono"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Data zakończenia:
              </label>
              <p className="text-sm font-medium text-gray-900">{participant.policyEndDate || "Nie określono"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Data zawarcia umowy:
              </label>
              <p className="text-sm font-medium text-gray-900">{participant.policyDealDate || "Nie określono"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Zakład ubezpieczeń:
              </label>
              <p className="text-sm font-medium text-gray-900">{participant.insuranceCompany || "Nie określono"}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                Suma ubezpieczenia:
              </label>
              <p className="text-sm font-medium text-gray-900">
                {participant.policySumAmount
                  ? `${participant.policySumAmount.toLocaleString('pl-PL')} PLN`
                  : "Nie określono"}
              </p>
            </div>
          </div>
        </div>

        {/* Dane osobowe uczestnika */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center">
              <Users className="h-4 w-4 mr-2 text-purple-600" />
              Dane osobowe uczestnika
            </h4>
          </div>

          {/* Sprawdź czy są dane w drivers lub w głównym participant */}
          {participant.drivers && participant.drivers.length > 0 && participant.drivers.some(d => d.firstName || d.lastName || d.phone || d.email || d.licenseNumber) ? (
            <div className="space-y-4">
              {participant.drivers.map((driver, index) => (
                <div
                  key={
                    driver.id ||
                    `${driver.firstName}-${driver.lastName}-${driver.licenseNumber}`
                  }
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900 flex items-center">
                      <UserCheck className="h-4 w-4 mr-2 text-blue-600" />
                      Osoba {index + 1}
                    </h5>
                    {driver.role && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        driver.role === 'kierowca' ? 'bg-blue-100 text-blue-800' :
                        driver.role === 'wlasciciel' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        Rola: {driver.role === 'kierowca' ? 'Kierowca' :
                               driver.role === 'wlasciciel' ? 'Właściciel' :
                               driver.role === 'wspol_wlasciciel' ? 'Współwłaściciel' :
                               driver.role}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                        Imię:
                      </label>
                      <p className="text-sm font-medium text-gray-900">{driver.firstName || participant.firstName || "Nie określono"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                        Nazwisko:
                      </label>
                      <p className="text-sm font-medium text-gray-900">{driver.lastName || participant.lastName || "Nie określono"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                        Numer identyfikacyjny:
                      </label>
                      <p className="text-sm font-medium text-gray-900">{driver.personalId || participant.personalId || "Nie określono"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                        Numer prawa jazdy:
                      </label>
                      <p className="text-sm font-medium text-gray-900">{driver.licenseNumber || "Nie określono"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                        Telefon:
                      </label>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        {(driver.phone || participant.phone) && <Phone className="h-3 w-3 mr-1 text-gray-400" />}
                        {driver.phone || participant.phone || "Nie określono"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                        E-mail:
                      </label>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        {(driver.email || participant.email) && <Mail className="h-3 w-3 mr-1 text-gray-400" />}
                        {driver.email || participant.email || "Nie określono"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                        Adres:
                      </label>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        {(driver.address || participant.address) && <MapPin className="h-3 w-3 mr-1 text-gray-400" />}
                        {driver.address || participant.address || "Nie określono"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                        Miasto:
                      </label>
                      <p className="text-sm font-medium text-gray-900">
                        {(driver.city || participant.city) ?
                          `${driver.postalCode || participant.postalCode || ''} ${driver.city || participant.city}`.trim() :
                          "Nie określono"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Wyświetl dane głównego uczestnika jeśli brak danych w drivers
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900 flex items-center">
                  <UserCheck className="h-4 w-4 mr-2 text-blue-600" />
                  Osoba 1
                </h5>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    Imię:
                  </label>
                  <p className="text-sm font-medium text-gray-900">{participant.firstName || "Nie określono"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    Nazwisko:
                  </label>
                  <p className="text-sm font-medium text-gray-900">{participant.lastName || "Nie określono"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    Numer identyfikacyjny:
                  </label>
                  <p className="text-sm font-medium text-gray-900">{participant.personalId || "Nie określono"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    Numer prawa jazdy:
                  </label>
                  <p className="text-sm font-medium text-gray-900">{"Nie określono"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    Telefon:
                  </label>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    {participant.phone && <Phone className="h-3 w-3 mr-1 text-gray-400" />}
                    {participant.phone || "Nie określono"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    E-mail:
                  </label>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    {participant.email && <Mail className="h-3 w-3 mr-1 text-gray-400" />}
                    {participant.email || "Nie określono"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    Adres:
                  </label>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    {participant.address && <MapPin className="h-3 w-3 mr-1 text-gray-400" />}
                    {participant.address || "Nie określono"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    Miasto:
                  </label>
                  <p className="text-sm font-medium text-gray-900">
                    {participant.city ?
                      `${participant.postalCode || ''} ${participant.city}`.trim() :
                      "Nie określono"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inspection Contact - only for injured party */}
        {title === "Poszkodowany" && (participant.inspectionContactName || participant.inspectionContactPhone || participant.inspectionContactEmail || participant.inspectionNotes) && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center">
              <Phone className="h-4 w-4 mr-2 text-orange-600" />
              Kontakt do oględzin
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {participant.inspectionContactName && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    Osoba kontaktowa:
                  </label>
                  <p className="text-sm font-medium text-gray-900">{participant.inspectionContactName}</p>
                </div>
              )}
              {participant.inspectionContactPhone && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    Telefon:
                  </label>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <Phone className="h-3 w-3 mr-1 text-gray-400" />
                    {participant.inspectionContactPhone}
                  </p>
                </div>
              )}
              {participant.inspectionContactEmail && (
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                    Email:
                  </label>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <Mail className="h-3 w-3 mr-1 text-gray-400" />
                    {participant.inspectionContactEmail}
                  </p>
                </div>
              )}
            </div>
            {participant.inspectionNotes && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <label className="text-xs font-medium text-blue-700 uppercase tracking-wide block mb-1">
                  Uwagi do oględzin:
                </label>
                <p className="text-sm text-blue-900 leading-relaxed">{participant.inspectionNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

  const renderActiveSection = () => {
    switch (activeClaimSection) {
    case "harmonogram":
      return (
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Harmonogram naprawy</CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              {/* Harmonogram naprawy - expandable section with data preview */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-gray-900">Harmonogram naprawy</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSection('harmonogram')}
                        className="text-xs"
                      >
                        {expandedSections.harmonogram ? 'Zwiń' : 'Rozwiń'}
                      </Button>
                    </div>
                  </div>
                </div>
                {expandedSections.harmonogram && eventId && (
                  <div className="p-4">
                    <div className="border rounded-lg overflow-hidden">
                      <RepairScheduleSection eventId={eventId} />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )

    case "naprawa":
      return (
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Wrench className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Szczegóły naprawy</CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              {/* Szczegóły naprawy - expandable section with data preview */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wrench className="h-4 w-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-gray-900">Szczegóły naprawy</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!expandedSections.naprawa) toggleSection('naprawa')
                          setAutoShowRepairForm(true)
                        }}
                        className="text-xs bg-[#1a3a6c] hover:bg-[#15305a] text-white"
                      >
                        Dodaj opis naprawy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSection('naprawa')}
                        className="text-xs"
                      >
                        {expandedSections.naprawa ? 'Zwiń' : 'Rozwiń'}
                      </Button>
                    </div>
                  </div>
                </div>
                {expandedSections.naprawa && eventId && (
                  <div className="p-4">
                    <div className="border rounded-lg overflow-hidden">
                      <RepairDetailsSection
                        eventId={eventId}
                        autoShowForm={autoShowRepairForm}
                        onAutoShowFormHandled={() => setAutoShowRepairForm(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )

  case "dane-zdarzenia-podstawowe":
      return (

        <div className="space-y-4">
          {/* Dane Szkody Card */}
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Dane szkody</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="claimObjectType" className="text-sm font-medium text-gray-700">
                      Typ szkody
                    </Label>
                    <Select
                      value={claimObjectType}
                      onValueChange={(value) => {
                        setClaimObjectType(value)
                        // Clear risk type and damage type when claim object type changes
                        handleFormChange("riskType", "")
                        handleFormChange("damageType", "")
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Wybierz typ szkody..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Szkody komunikacyjne</SelectItem>
                        <SelectItem value="2">Szkody mienia</SelectItem>
                        <SelectItem value="3">Szkody transportowe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="riskType" className="text-sm font-medium text-gray-700">
                      Ryzyko szkody
                    </Label>
                    <Select
                      value={claimFormData.riskType || ""}
                      onValueChange={(value) => {
                        handleFormChange("riskType", value)
                        // Clear damage type when risk type changes
                        handleFormChange("damageType", "")
                      }}
                      disabled={loadingRiskTypes}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={loadingRiskTypes ? "Ładowanie..." : "Wybierz ryzyko szkody..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {riskTypes.map((riskType) => (
                          <SelectItem key={riskType.value} value={riskType.value}>
                            {riskType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                      Status szkody
                    </Label>
                    <Select
                      value={claimFormData.status?.toString() || ""}
                      onValueChange={(value) => handleFormChange("status", value)}
                      disabled={loadingStatuses}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder={loadingStatuses ? "Ładowanie..." : "Wybierz status szkody..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {claimStatuses.map((status) => (
                          <SelectItem key={status.id} value={status.id.toString()}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="reportDateToInsurer" className="text-sm font-medium text-gray-700">
                      Data zgłoszenia do TU
                    </Label>
                    <Input
                      id="reportDateToInsurer"
                      type="date"
                      value={formatDateForInput(claimFormData.reportDateToInsurer)}
                      onChange={(e) => handleFormChange("reportDateToInsurer", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="relative z-10">
                    <Label htmlFor="client" className="text-sm font-medium text-gray-700 mb-2 block">
                      Klient
                    </Label>
                    <div className="relative">
                      <ClientDropdown
                        selectedClientId={claimFormData.clientId ? parseInt(claimFormData.clientId) : undefined}
                        onClientSelected={(event: ClientSelectionEvent) => {
                          handleFormChange("client", event.clientName)
                          handleFormChange("clientId", event.clientId.toString())
                        }}
                        className="relative z-20"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Kanał zgłoszenia</Label>
                    <RadioGroup
                      value={claimFormData.reportingChannel || ""}
                      onValueChange={(value) => handleFormChange("reportingChannel", value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="infolinia" id="channel-infolinia" />
                        <Label htmlFor="channel-infolinia" className="font-normal text-sm">
                          Infolinia
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="channel-email" />
                        <Label htmlFor="channel-email" className="font-normal text-sm">
                          Email
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bezpośrednio" id="channel-direct" />
                        <Label htmlFor="channel-direct" className="font-normal text-sm">
                          Bezpośrednio
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="damageType" className="text-sm font-medium text-gray-700">
                      Rodzaj szkody
                    </Label>
                    <DependentSelect
                      value={claimFormData.damageType || ""}
                      onValueChange={(value) => handleFormChange("damageType", value)}
                      placeholder="Wybierz rodzaj szkody..."
                      apiUrl="/api/damage-types"
                      riskTypeId={claimFormData.riskType}
                      disabled={!claimFormData.riskType}
                    />
                  </div>
                  <div>
                    <Label htmlFor="insurerClaimNumber" className="text-sm font-medium text-gray-700">
                      Nr szkody TU
                    </Label>
                    <Input
                      id="insurerClaimNumber"
                      value={claimFormData.insurerClaimNumber || ""}
                      onChange={(e) => handleFormChange("insurerClaimNumber", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Nr szkody Sparta</Label>
                    <Input
                      id="spartaNumber"
                      value={claimFormData.spartaNumber || ""}
                      readOnly
                      className="bg-gray-50 mt-1 border-gray-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="handler" className="text-sm font-medium text-gray-700">
                      Szkodę zarejestrował
                    </Label>
                    <HandlerDropdown
                      selectedHandlerId={claimFormData.handlerId ? parseInt(claimFormData.handlerId) : undefined}
                      onHandlerSelected={(event: HandlerSelectionEvent) => {
                        handleFormChange("handlerId", event.handlerId.toString())
                        handleFormChange("handler", event.handlerName)
                        handleFormChange("handlerEmail", event.handlerEmail || "")
                        handleFormChange("handlerPhone", event.handlerPhone || "")
                      }}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 my-8" />

              <div className="space-y-6">
                <div className="relative z-10">
                  <Label htmlFor="insuranceCompany" className="text-sm font-medium text-gray-700 mb-2 block">
                    Towarzystwo ubezpieczeniowe
                  </Label>
                  <div className="relative">
                    <InsuranceDropdown
                      selectedCompanyId={claimFormData.insuranceCompanyId ? parseInt(claimFormData.insuranceCompanyId) : undefined}
                      onCompanySelected={(event: CompanySelectionEvent) => {
                        handleFormChange("insuranceCompany", event.companyName)
                        handleFormChange("insuranceCompanyId", event.companyId.toString())
                      }}
                      className="relative z-20"
                    />
                  </div>
                </div>

                <div className="relative z-10">
                  <Label htmlFor="leasingCompany" className="text-sm font-medium text-gray-700 mb-2 block">
                    Firma leasingowa
                  </Label>
                  <div className="relative">
                    <LeasingDropdown
                      selectedCompanyId={claimFormData.leasingCompanyId ? parseInt(claimFormData.leasingCompanyId) : undefined}
                      onCompanySelected={(event: LeasingCompanySelectionEvent) => {
                        handleFormChange("leasingCompany", event.companyName)
                        handleFormChange("leasingCompanyId", event.companyId.toString())
                      }}
                      className="relative z-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opis zdarzenia Card */}
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileSignature className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Opis zdarzenia</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="damageDate" className="text-sm font-medium text-gray-700">
                    Data szkody
                  </Label>
                  <Input
                    id="damageDate"
                    type="date"
                    value={formatDateForInput(claimFormData.damageDate)}
                    onChange={(e) => handleFormChange("damageDate", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="eventTime" className="text-sm font-medium text-gray-700">
                    Godzina zdarzenia
                  </Label>
                  <Input
                    id="eventTime"
                    type="time"
                    value={claimFormData.eventTime || ""}
                    onChange={(e) => handleFormChange("eventTime", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="reportDate" className="text-sm font-medium text-gray-700">
                    Data zgłoszenia szkody
                  </Label>
                  <Input
                    id="reportDate"
                    type="date"
                    value={formatDateForInput(claimFormData.reportDate)}
                    onChange={(e) => handleFormChange("reportDate", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="eventLocation" className="text-sm font-medium text-gray-700">
                  Miejsce zdarzenia
                </Label>
                <Input
                  id="eventLocation"
                  placeholder="np. Warszawa, ul. Marszałkowska 1"
                  value={claimFormData.eventLocation || ""}
                  onChange={(e) => handleFormChange("eventLocation", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="eventDescription" className="text-sm font-medium text-gray-700">
                  Opis przebiegu zdarzenia
                </Label>
                <Textarea
                  id="eventDescription"
                  placeholder="Opisz szczegółowo przebieg zdarzenia..."
                  rows={4}
                  value={claimFormData.eventDescription || ""}
                  onChange={(e) => handleFormChange("eventDescription", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="comments" className="text-sm font-medium text-gray-700">
                  Uwagi
                </Label>
                <Textarea
                  id="comments"
                  placeholder="Dodatkowe uwagi..."
                  rows={2}
                  value={claimFormData.comments || ""}
                  onChange={(e) => handleFormChange("comments", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Obszar</Label>
                  <RadioGroup
                    value={claimFormData.area || ""}
                    onValueChange={(value) => handleFormChange("area", value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="krajowa" id="area-krajowa" />
                      <Label htmlFor="area-krajowa" className="text-sm">
                        Szkoda krajowa
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="zagraniczna" id="area-zagraniczna" />
                      <Label htmlFor="area-zagraniczna" className="text-sm">
                        Szkoda zagraniczna
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Czy były osoby ranne?</Label>
                  <RadioGroup
                    value={claimFormData.wereInjured ? "tak" : "nie"}
                    onValueChange={(value) => handleFormChange("wereInjured", value === "tak")}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tak" id="injured-tak" />
                      <Label htmlFor="injured-tak" className="text-sm">
                        Tak
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nie" id="injured-nie" />
                      <Label htmlFor="injured-nie" className="text-sm">
                        Nie
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Czy spisano oświadczenie ze sprawcą zdarzenia?
                  </Label>
                  <RadioGroup
                    value={claimFormData.statementWithPerpetrator ? "tak" : "nie"}
                    onValueChange={(value) => handleFormChange("statementWithPerpetrator", value === "tak")}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tak" id="statement-tak" />
                      <Label htmlFor="statement-tak" className="text-sm">
                        Tak
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nie" id="statement-nie" />
                      <Label htmlFor="statement-nie" className="text-sm">
                        Nie
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Czy sprawca został ukarany mandatem?
                  </Label>
                  <RadioGroup
                    value={claimFormData.perpetratorFined ? "tak" : "nie"}
                    onValueChange={(value) => handleFormChange("perpetratorFined", value === "tak")}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tak" id="fined-tak" />
                      <Label htmlFor="fined-tak" className="text-sm">
                        Tak
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nie" id="fined-nie" />
                      <Label htmlFor="fined-nie" className="text-sm">
                        Nie
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Służby Card */}
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Wrench className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Służby</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white space-y-6">
              <div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="service-police"
                      checked={claimFormData.servicesCalled?.includes("policja") || false}
                      onCheckedChange={(checked) => handleServicesChange("policja", checked)}
                    />
                    <Label htmlFor="service-police" className="text-sm">
                      Policja
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="service-ambulance"
                      checked={claimFormData.servicesCalled?.includes("pogotowie") || false}
                      onCheckedChange={(checked) => handleServicesChange("pogotowie", checked)}
                    />
                    <Label htmlFor="service-ambulance" className="text-sm">
                      Pogotowie
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="service-fire"
                      checked={claimFormData.servicesCalled?.includes("straz") || false}
                      onCheckedChange={(checked) => handleServicesChange("straz", checked)}
                    />
                    <Label htmlFor="service-fire" className="text-sm">
                      Straż pożarna
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="service-tow"
                      checked={claimFormData.servicesCalled?.includes("holownik") || false}
                      onCheckedChange={(checked) => handleServicesChange("holownik", checked)}
                    />
                    <Label htmlFor="service-tow" className="text-sm">
                      Holownik
                    </Label>
                  </div>
                </div>

                {/* Description fields for selected services */}
                {claimFormData.servicesCalled?.includes("policja") && (
                  <div className="mt-4">
                    <Label htmlFor="policeDescription" className="text-sm font-medium text-gray-700">
                      Policja - Opis
                    </Label>
                    <Input
                      id="policeDescription"
                      placeholder="Wprowadź opis interwencji policji"
                      value={claimFormData.policeDescription || ""}
                      onChange={(e) => handleFormChange("policeDescription", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
                {claimFormData.servicesCalled?.includes("pogotowie") && (
                  <div className="mt-4">
                    <Label htmlFor="ambulanceDescription" className="text-sm font-medium text-gray-700">
                      Pogotowie - Opis
                    </Label>
                    <Input
                      id="ambulanceDescription"
                      placeholder="Wprowadź opis interwencji pogotowia"
                      value={claimFormData.ambulanceDescription || ""}
                      onChange={(e) => handleFormChange("ambulanceDescription", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
                {claimFormData.servicesCalled?.includes("straz") && (
                  <div className="mt-4">
                    <Label htmlFor="fireDescription" className="text-sm font-medium text-gray-700">
                      Straż pożarna - Opis
                    </Label>
                    <Input
                      id="fireDescription"
                      placeholder="Wprowadź opis interwencji straży pożarnej"
                      value={claimFormData.fireDescription || ""}
                      onChange={(e) => handleFormChange("fireDescription", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
                {claimFormData.servicesCalled?.includes("holownik") && (
                  <div className="mt-4">
                    <Label htmlFor="towDescription" className="text-sm font-medium text-gray-700">
                      Holownik - Opis
                    </Label>
                    <Input
                      id="towDescription"
                      placeholder="Wprowadź opis usługi holowania"
                      value={claimFormData.towDescription || ""}
                      onChange={(e) => handleFormChange("towDescription", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
              {claimFormData.servicesCalled?.includes("policja") && (
                <div>
                  <Label htmlFor="policeUnitDetails" className="text-sm font-medium text-gray-700">
                    Policja - Dane jednostki
                  </Label>
                  <Input
                    id="policeUnitDetails"
                    placeholder="Wprowadź dane jednostki policji"
                    value={claimFormData.policeUnitDetails || ""}
                    onChange={(e) => handleFormChange("policeUnitDetails", e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uszkodzenia samochodu Card */}
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Car className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Uszkodzenia samochodu</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="relative z-10">
                    <Label htmlFor="vehicleType" className="text-sm font-medium text-gray-700 mb-2 block">
                      Rodzaj pojazdu
                    </Label>
                    <div className="relative">
                      <VehicleTypeDropdown
                        selectedVehicleTypeId={claimFormData.vehicleTypeId}
                        onVehicleTypeSelected={(event: VehicleTypeSelectionEvent) => {
                          handleFormChange("vehicleType", event.vehicleTypeName)
                          handleFormChange("vehicleTypeId", event.vehicleTypeId)
                          handleFormChange("vehicleTypeCode", event.vehicleTypeCode)
                        }}
                        className="relative z-20"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="damageDescription" className="text-sm font-medium text-gray-700">
                    Powstałe uszkodzenia opis
                  </Label>
                  <Textarea
                    id="damageDescription"
                    placeholder="Opisz uszkodzenia..."
                    rows={3}
                    value={claimFormData.damageDescription || ""}
                    onChange={(e) => handleFormChange("damageDescription", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Powstałe uszkodzenia</Label>
                  <div className="p-4 border rounded-lg bg-gray-50 space-y-2 mt-2 max-h-60 overflow-y-auto">
                    {claimFormData.damages && claimFormData.damages.length > 0 ? (
                      claimFormData.damages.map((damage, index) => (
                        <div
                          key={damage.id || `${damage.description}-${damage.detail}`}
                          className="flex items-center justify-between text-sm hover:bg-gray-100 p-2 rounded bg-white border"
                        >
                          <span className="font-medium">
                            {index + 1}. {damage.description} -{" "}
                            <span className="text-gray-600 font-normal">{damage.detail}</span>
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeDamageItem(damage.description)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">Wybierz uszkodzone części na diagramie.</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
              <DamageDiagram
                damagedParts={(claimFormData.damages || []).map((d) => d.description)}
                onPartClick={handleDamagePartToggle}
              />
            </div>
          </CardContent>
        </Card>
        {claimObjectType === "2" && (
          <PropertyDamageSection
            claimFormData={claimFormData}
            handleFormChange={handleFormChange}
          />
        )}
        {claimObjectType === "3" && (
          <TransportDamageSection
            claimFormData={claimFormData}
            handleFormChange={handleFormChange}
          />
        )}
      </div>
    )


    case "uczestnicy":
      return (
        <div className="space-y-4">
          {/* Sprawca Card */}
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Sprawca</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <ParticipantForm
                title="Sprawca"
                icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
                participantData={getParticipantData("perpetrator")}
                onParticipantChange={(field, value) => handleParticipantChange("perpetrator", field, value)}
                onDriverChange={(driverIndex, field, value) =>
                  handleDriverChange("perpetrator", driverIndex, field, value)
                }
                onAddDriver={() => handleAddDriver("perpetrator")}
                onRemoveDriver={(index) => handleRemoveDriver("perpetrator", index)}
              />
            </CardContent>
          </Card>

          {/* Poszkodowany Card */}
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Poszkodowany</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <ParticipantForm
                title="Poszkodowany"
                icon={<User className="h-5 w-5 text-blue-600" />}
                participantData={getParticipantData("injuredParty")}
                onParticipantChange={(field, value) => handleParticipantChange("injuredParty", field, value)}
                onDriverChange={(driverIndex, field, value) =>
                  handleDriverChange("injuredParty", driverIndex, field, value)
                }
                onAddDriver={() => handleAddDriver("injuredParty")}
                onRemoveDriver={(index) => handleRemoveDriver("injuredParty", index)}
                showInspectionContact
              />
            </CardContent>
          </Card>
        </div>
      )

    case "dokumenty": {
      return (
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Paperclip className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Dokumenty</CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              {eventId && (
                <DocumentsSection
                  uploadedFiles={uploadedFiles}
                  setUploadedFiles={setUploadedFiles}
                  requiredDocuments={requiredDocuments}
                  setRequiredDocuments={setRequiredDocuments}
                  eventId={eventId}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    case "decyzje":
      return (
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Gavel className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Decyzje</CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              <DecisionsSection claimId={claimFormData.id} onChange={handleDecisionsChange} />
            </CardContent>
          </Card>
        </div>
      )

    case "odwolanie":
      return (
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <ArrowUpDown className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Odwołanie/Reklamacja</CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              {eventId && <AppealsSection claimId={eventId} />}
            </CardContent>
          </Card>
        </div>
      )

    case "roszczenia":
      return (
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Roszczenia klienta</CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              <ClientClaimsSection
                clientClaims={claimFormData.clientClaims || []}
                onClientClaimsChange={(claims) => handleFormChange("clientClaims", claims)}
                claimId={claimFormData.id || undefined}
              />
            </CardContent>
          </Card>
        </div>
      )

    case "regres":
      return (
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Regres</CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              {eventId && <RecourseSection eventId={eventId} />}
            </CardContent>
          </Card>
        </div>
      )

    case "ugody":
      return (
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <HandHeart className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Ugoda</CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              <SettlementsSection eventId={eventId || ""} />
            </CardContent>
          </Card>
        </div>
      )

    case "notatki":
      return (
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Notatki</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              {/* Action buttons */}
              <div className="flex items-center space-x-2 mb-4">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShowNoteForm("note")}
                  disabled={showNoteForm !== null}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj notatkę
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setShowNoteForm("task")}
                  disabled={showNoteForm !== null}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj zadanie
                </Button>
                <Button
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  onClick={() => setShowNoteForm("internal")}
                  disabled={showNoteForm !== null}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj notatkę wewnętrzną
                </Button>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => setShowNoteForm("status")}
                  disabled={showNoteForm !== null}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj notatkę status
                </Button>
              </div>

              {/* Inline Note Form */}
              {showNoteForm && (
                <Card className="border-2 border-blue-200 bg-blue-50/50 rounded-xl mb-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>Dodaj {getTypeLabel(showNoteForm as Note["type"])}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="note-title" className="text-sm font-medium text-gray-700">
                        Tytuł *
                      </Label>
                      <Input
                        id="note-title"
                        value={noteForm.title}
                        onChange={(e) => setNoteForm((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Wprowadź tytuł..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="note-description" className="text-sm font-medium text-gray-700">
                        Opis *
                      </Label>
                      <Textarea
                        id="note-description"
                        value={noteForm.description}
                        onChange={(e) => setNoteForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Wprowadź opis..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    {showNoteForm === "task" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="note-priority" className="text-sm font-medium text-gray-700">
                            Priorytet
                          </Label>
                          <Select
                            value={noteForm.priority}
                            onValueChange={(value: "low" | "medium" | "high") =>
                              setNoteForm((prev) => ({ ...prev, priority: value }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Niski</SelectItem>
                              <SelectItem value="medium">Średni</SelectItem>
                              <SelectItem value="high">Wysoki</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="note-due-date" className="text-sm font-medium text-gray-700">
                            Termin wykonania
                          </Label>
                          <Input
                            id="note-due-date"
                            type="date"
                            value={noteForm.dueDate}
                            onChange={(e) => setNoteForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={cancelNoteForm}>
                        <X className="h-4 w-4 mr-2" />
                        Anuluj
                      </Button>
                      <Button
                        onClick={() => addNote(showNoteForm as Note["type"])}
                        disabled={!noteForm.title.trim() || !noteForm.description.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Zapisz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes table */}
              <Card className="rounded-xl">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left p-4 font-medium text-gray-700 text-sm">TYP</th>
                          <th className="text-left p-4 font-medium text-gray-700 text-sm">OPIS</th>
                          <th className="text-left p-4 font-medium text-gray-700 text-sm">UŻYTKOWNIK</th>
                          <th className="text-left p-4 font-medium text-gray-700 text-sm">DATA DODANIA</th>
                          <th className="text-left p-4 font-medium text-gray-700 text-sm">AKCJA</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {filteredNotes.length > 0 ? (
                          filteredNotes.map((note) => (
                            <tr key={note.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="p-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}
                                >
                                  {getTypeLabel(note.type)}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  <p className="font-medium text-gray-900">{note.title}</p>
                                  <p className="text-sm text-gray-600">{note.description}</p>
                                  {note.type === "task" && (
                                    <div className="flex items-center space-x-2 text-xs">
                                      {note.priority && (
                                        <span className={`font-medium ${getPriorityColor(note.priority)}`}>
                                          Priorytet:{" "}
                                          {note.priority === "high"
                                            ? "Wysoki"
                                            : note.priority === "medium"
                                              ? "Średni"
                                              : "Niski"}
                                        </span>
                                      )}
                                      {note.dueDate && (
                                        <span className="text-gray-500">
                                          • Termin: {new Date(note.dueDate).toLocaleDateString("pl-PL")}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-sm text-gray-600">{note.user}</td>
                              <td className="p-4 text-sm text-gray-600">
                                {new Date(note.createdAt).toLocaleDateString("pl-PL", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  {note.type === "task" && note.status && (
                                    <div className="flex items-center space-x-1">
                                      {getStatusIcon(note.status)}
                                      <Select
                                        value={note.status}
                                        onValueChange={(value: "active" | "completed" | "cancelled") =>
                                          updateTaskStatus(note.id, value)
                                        }
                                      >
                                        <SelectTrigger className="w-32 h-8">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="active">Aktywne</SelectItem>
                                          <SelectItem value="completed">Zakończone</SelectItem>
                                          <SelectItem value="cancelled">Anulowane</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => deleteNote(note.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr className="border-b border-gray-100">
                            <td className="p-4 text-center text-gray-500" colSpan={5}>
                              Brak notatek
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* My Tasks section */}
              <Card className="rounded-xl mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Moje zadania</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-6 mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">{taskStats.active} aktywnych</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-600">{taskStats.cancelled} anulowanych</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">{taskStats.completed} zakończonych</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Szukaj zadań..."
                        className="pl-10"
                        value={taskFilter.search}
                        onChange={(e) => setTaskFilter((prev) => ({ ...prev, search: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Status:</Label>
                      <Select
                        value={taskFilter.status}
                        onValueChange={(value) => setTaskFilter((prev) => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wszystkie">Wszystkie</SelectItem>
                          <SelectItem value="active">Aktywne</SelectItem>
                          <SelectItem value="completed">Zakończone</SelectItem>
                          <SelectItem value="cancelled">Anulowane</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Priorytet:</Label>
                      <Select
                        value={taskFilter.priority}
                        onValueChange={(value) => setTaskFilter((prev) => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wszystkie">Wszystkie</SelectItem>
                          <SelectItem value="high">Wysoki</SelectItem>
                          <SelectItem value="medium">Średni</SelectItem>
                          <SelectItem value="low">Niski</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" size="sm">
                      Odśwież
                    </Button>
                  </div>

                  {/* Tasks list */}
                  <div className="space-y-3">
                    {notes
                      .filter((note) => note.type === "task")
                      .map((task) => (
                        <div key={task.id} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                  checked={task.status === "completed"}
                                  onCheckedChange={(checked) =>
                                    updateTaskStatus(
                                      task.id,
                                      checked ? "completed" : "active",
                                    )
                                  }
                                  disabled={task.status === "cancelled"}
                                  className="mr-1"
                                />
                                {getStatusIcon(task.status)}
                                <h4 className="font-medium text-gray-900">{task.title}</h4>
                                {task.priority && (
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      task.priority === "high"
                                        ? "bg-red-100 text-red-800"
                                        : task.priority === "medium"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {task.priority === "high"
                                      ? "Wysoki"
                                      : task.priority === "medium"
                                        ? "Średni"
                                        : "Niski"}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>
                                  {new Date(task.createdAt).toLocaleDateString("pl-PL", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {task.dueDate && (
                                  <span>Termin: {new Date(task.dueDate).toLocaleDateString("pl-PL")}</span>
                                )}
                                <span>Szkoda nr: {claimFormData.spartaNumber}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                    {notes.filter((note) => note.type === "task").length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Brak zadań do wyświetlenia</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      )

    case "pisma":
      return (
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileCheck className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">Pisma</CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-white">
              <div className="text-center py-12">
                <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Sekcja w przygotowaniu</p>
                <p className="text-gray-400 text-sm mt-2">Funkcjonalność zarządzania pismami będzie dostępna wkrótce</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )

    case "email":
      return (
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-sm border-gray-200 rounded-xl">
            <CardHeader className="flex flex-row items-center space-x-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Mail className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg font-semibold">E-mail</CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              <EmailSection claimId={claimFormData.id} />
            </CardContent>
          </Card>
        </div>
      )

    case "teczka-szkodowa": {
    const visibleNotes = notes.filter((note) => !note.type || note.type === "note")
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Left Column - DANE SZKODY I ZDARZENIA */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Dane szkody i zdarzenia</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <InfoCard label="Nr szkody Sparta" value={claimFormData.spartaNumber} />
                  <InfoCard label="Nr szkody TU" value={claimFormData.insurerClaimNumber} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoCard label="Status" value={getStatusLabel(claimFormData.status)} />
                  <InfoCard label="Szkodę zarejestrował" value={claimFormData.handler} />
                </div>

                <InfoCard label="Rodzaj szkody" value={claimFormData.damageType} />
                <InfoCard label="Ryzyko szkody" value={getRiskTypeLabel(claimFormData.riskType)} />

                <div className="grid grid-cols-2 gap-3">
                  <InfoCard label="Data zdarzenia" value={claimFormData.damageDate} />
                  <InfoCard label="Godzina zdarzenia" value={claimFormData.eventTime} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <InfoCard label="Data zgłoszenia" value={claimFormData.reportDate} />
                  <InfoCard label="Data zgłoszenia do TU" value={claimFormData.reportDateToInsurer} />
                </div>

                <InfoCard
                  icon={<MapPin className="h-4 w-4" />}
                  label="Miejsce zdarzenia"
                  value={claimFormData.eventLocation}
                />

                {claimFormData.eventDescription && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                      Opis zdarzenia
                    </span>
                    <p className="text-sm text-gray-900 leading-relaxed">{claimFormData.eventDescription}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <InfoCard label="Klient" value={claimFormData.client} />
                  <InfoCard label="TU" value={claimFormData.insuranceCompany} />
                </div>

                {claimFormData.leasingCompany && (
                  <InfoCard label="Firma leasingowa" value={claimFormData.leasingCompany} />
                )}

                <div className="grid grid-cols-2 gap-3">
                  <InfoCard label="Obszar" value={claimFormData.area} />
                  <InfoCard label="Kanał zgłoszenia" value={claimFormData.reportingChannel} />
                </div>

                {claimFormData.comments && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                      Uwagi
                    </span>
                    <p className="text-sm text-gray-900 leading-relaxed">{claimFormData.comments}</p>
                  </div>
                )}
              </div>
            </div>

            {/* POSZKODOWANY Section */}
            {renderParticipantDetails(
              claimFormData.injuredParty,
              "Poszkodowany",
              <User className="h-4 w-4 text-blue-600" />,
              "bg-gradient-to-r from-blue-50 to-blue-100"
            )}
          </div>

          {/* Right Column - SPRAWCA */}
          <div className="space-y-4">
            {renderParticipantDetails(
              claimFormData.perpetrator,
              "Sprawca",
              <AlertTriangle className="h-4 w-4 text-red-600" />,
              "bg-gradient-to-r from-red-50 to-red-100"
            )}
          </div>
        </div>

        {/* Full Width Sections */}
        <div className="space-y-4">
          {/* Uszkodzenia samochodu */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Car className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Uszkodzenia samochodu</h3>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <InfoCard label="Rodzaj pojazdu" value={claimFormData.vehicleType} />

                {claimFormData.damageDescription && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                      Opis uszkodzeń
                    </span>
                    <p className="text-sm text-gray-900 leading-relaxed">{claimFormData.damageDescription}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
                    Lista uszkodzeń
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {claimFormData.damages && claimFormData.damages.length > 0 ? (
                      claimFormData.damages.map((damage, index) => (
                        <div
                          key={damage.id || `${damage.description}-${damage.detail}`}
                          className="text-sm text-gray-900 p-2 bg-white rounded border"
                        >
                          <span className="font-medium">{damage.description}</span>
                          <span className="text-gray-600 ml-2">- {damage.detail}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Brak zdefiniowanych uszkodzeń</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <DamageDiagram
                  damagedParts={(claimFormData.damages || []).map((d) => d.description)}
                  onPartClick={() => {}} // Read-only in summary view
                />
              </div>
            </div>
          </div>

          {/* Służby */}
          {claimFormData.servicesCalled && claimFormData.servicesCalled.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Wezwane służby</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {claimFormData.servicesCalled.map((service) => (
                    <span
                      key={service}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize"
                    >
                      {service}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {claimFormData.policeDescription && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                        Policja - Opis
                      </span>
                      <p className="text-sm text-gray-900">{claimFormData.policeDescription}</p>
                    </div>
                  )}
                  {claimFormData.ambulanceDescription && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                        Pogotowie - Opis
                      </span>
                      <p className="text-sm text-gray-900">{claimFormData.ambulanceDescription}</p>
                    </div>
                  )}
                  {claimFormData.fireDescription && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                        Straż pożarna - Opis
                      </span>
                      <p className="text-sm text-gray-900">{claimFormData.fireDescription}</p>
                    </div>
                  )}
                  {claimFormData.towDescription && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                        Holownik - Opis
                      </span>
                      <p className="text-sm text-gray-900">{claimFormData.towDescription}</p>
                    </div>
                  )}
                </div>

                {claimFormData.policeUnitDetails && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                      Dane jednostki policji
                    </span>
                    <p className="text-sm text-gray-900">{claimFormData.policeUnitDetails}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dokumenty - simplified version */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Dokumenty</h3>
              </div>
            </div>
            <div className="p-4">
              {eventId && (
                <DocumentsSection
                  uploadedFiles={uploadedFiles}
                  setUploadedFiles={setUploadedFiles}
                  requiredDocuments={[]}
                  setRequiredDocuments={() => {}}
                  eventId={eventId}
                  hideRequiredDocuments={true}
                />
              )}
            </div>
          </div>

          {/* Notatki */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Notatki</h3>
              </div>
            </div>
            <div className="p-4">
              {visibleNotes.length > 0 ? (
                <div className="space-y-3">
                  {visibleNotes.map((note) => (
                    <div key={note.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}
                            >
                              {getTypeLabel(note.type)}
                            </span>
                            {note.type === "task" && note.priority && (
                              <span className={`text-xs font-medium ${getPriorityColor(note.priority)}`}>
                                {note.priority === "high"
                                  ? "Wysoki"
                                  : note.priority === "medium"
                                    ? "Średni"
                                    : "Niski"}
                              </span>
                            )}
                            {note.type === "task" && note.status && getStatusIcon(note.status)}
                          </div>
                          <h4 className="font-medium text-gray-900 text-sm">{note.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{note.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                            <span>{note.user}</span>
                            <span>{new Date(note.createdAt).toLocaleDateString("pl-PL")}</span>
                            {note.dueDate && (
                              <span>Termin: {new Date(note.dueDate).toLocaleDateString("pl-PL")}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Brak notatek</p>
                </div>
              )}
            </div>
          </div>

          {/* Harmonogram naprawy - expandable section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Harmonogram naprawy</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSection('harmonogram')}
                    className="text-xs"
                  >
                    {expandedSections.harmonogram ? 'Zwiń' : 'Rozwiń'}
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4">
              {expandedSections.harmonogram && eventId ? (
                <div className="border rounded-lg overflow-hidden">
                <RepairScheduleSection eventId={eventId} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      icon={<Calendar className="h-4 w-4" />}
                      label="Liczba harmonogramów"
                      value="2"
                    />
                    <InfoCard
                      icon={<Clock className="h-4 w-4" />}
                      label="Status ostatniego"
                      value="W trakcie"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">Harmonogram #1</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          W trakcie
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Data rozpoczęcia:</span> 15.01.2025
                        </div>
                        <div>
                          <span className="font-medium">Planowane zakończenie:</span> 22.01.2025
                        </div>
                        <div>
                          <span className="font-medium">Warsztat:</span> AutoSerwis Kowalski
                        </div>
                        <div>
                          <span className="font-medium">Koszt:</span> 4,500 PLN
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">Harmonogram #2</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Zakończony
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Data rozpoczęcia:</span> 08.01.2025
                        </div>
                        <div>
                          <span className="font-medium">Data zakończenia:</span> 12.01.2025
                        </div>
                        <div>
                          <span className="font-medium">Warsztat:</span> Lakiernia Nowak
                        </div>
                        <div>
                          <span className="font-medium">Koszt:</span> 2,800 PLN
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-400">Kliknij "Rozwiń" aby zobaczyć pełne szczegóły harmonogramu</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Szczegóły naprawy - expandable section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Szczegóły naprawy</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!expandedSections.naprawa) toggleSection('naprawa')
                        setAutoShowRepairForm(true)
                      }}
                      className="text-xs bg-[#1a3a6c] hover:bg-[#15305a] text-white"
                    >
                      Dodaj opis naprawy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSection('naprawa')}
                      className="text-xs"
                    >
                      {expandedSections.naprawa ? 'Zwiń' : 'Rozwiń'}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {expandedSections.naprawa && eventId ? (
                  <div className="border rounded-lg overflow-hidden">
                <RepairDetailsSection
                  eventId={eventId}
                  autoShowForm={autoShowRepairForm}
                  onAutoShowFormHandled={() => setAutoShowRepairForm(false)}
                />
                  </div>
                ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoCard
                      icon={<Wrench className="h-4 w-4" />}
                      label="Liczba pozycji"
                      value="5"
                    />
                    <InfoCard
                      icon={<DollarSign className="h-4 w-4" />}
                      label="Całkowity koszt"
                      value="7,300 PLN"
                    />
                    <InfoCard
                      icon={<Clock className="h-4 w-4" />}
                      label="Status"
                      value="W realizacji"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">Naprawa zderzaka przedniego</h4>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          W trakcie
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Pracownik:</span> Jan Kowalski
                        </div>
                        <div>
                          <span className="font-medium">Oddział:</span> Warszawa Centrum
                        </div>
                        <div>
                          <span className="font-medium">Data rozpoczęcia:</span> 15.01.2025
                        </div>
                        <div>
                          <span className="font-medium">Koszt:</span> 1,200 PLN
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">Wymiana reflektora</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Zakończone
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Pracownik:</span> Anna Nowak
                        </div>
                        <div>
                          <span className="font-medium">Oddział:</span> Warszawa Centrum
                        </div>
                        <div>
                          <span className="font-medium">Data zakończenia:</span> 12.01.2025
                        </div>
                        <div>
                          <span className="font-medium">Koszt:</span> 850 PLN
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">Lakierowanie maski</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Zaplanowane
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Pracownik:</span> Piotr Wiśniewski
                        </div>
                        <div>
                          <span className="font-medium">Oddział:</span> Warszawa Południe
                        </div>
                        <div>
                          <span className="font-medium">Planowany start:</span> 20.01.2025
                        </div>
                        <div>
                          <span className="font-medium">Koszt:</span> 2,100 PLN
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-400">Kliknij "Rozwiń" aby zobaczyć pełne szczegóły naprawy</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )
    }

    default:
      return (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Wybierz sekcję z menu po lewej stronie</p>
            </div>
          </div>
        </div>
      )
    }
  }

  return renderActiveSection();
};
