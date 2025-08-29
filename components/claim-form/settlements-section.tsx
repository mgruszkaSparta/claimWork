"use client"

import type React from "react"
import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { HandHeart, Plus, Minus, Edit, Trash2, Download, Eye, X, Upload, FileText, Info, Loader2 } from "lucide-react"
import { DocumentPreview, type FileType } from "@/components/document-preview"
import { getSettlements, createSettlement, updateSettlement, deleteSettlement } from "@/lib/api/settlements"
import { API_BASE_URL } from "@/lib/api"
import { authFetch } from "@/lib/auth-fetch"
import type { Settlement } from "@/lib/api/settlements"
import type { DocumentDto } from "@/lib/api"

interface SettlementsSectionProps {
  eventId: string
}

interface SettlementFormData {
  externalEntity: string
  customExternalEntity: string
  transferDate: string
  status: string
  settlementDate: string
  settlementAmount: number
  currency: string
  documentDescription: string
}

const initialFormData: SettlementFormData = {
  externalEntity: "",
  customExternalEntity: "",
  transferDate: "",
  status: "",
  settlementDate: "",
  settlementAmount: 0,
  currency: "PLN",
  documentDescription: "",
}

export const SettlementsSection: React.FC<SettlementsSectionProps> = ({ eventId }) => {
  const { toast } = useToast()

  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [isListLoading, setIsListLoading] = useState(false)

  // Form state
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingSettlementId, setEditingSettlementId] = useState<string | null>(null)
  const [currentSettlement, setCurrentSettlement] = useState<Settlement | null>(null)
  const [formData, setFormData] = useState<SettlementFormData>(initialFormData)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCustomEntityInput, setShowCustomEntityInput] = useState(false)
  const [showFileDescription, setShowFileDescription] = useState(false)
  const [dropZoneActive, setDropZoneActive] = useState(false)
  const [outlookDragActive, setOutlookDragActive] = useState(false)

  // Preview state
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [previewFileName, setPreviewFileName] = useState<string>("")
  const [previewFileType, setPreviewFileType] = useState<FileType>("other")
  const [currentPreviewSettlement, setCurrentPreviewSettlement] = useState<Settlement | null>(null)
  const [currentPreviewDoc, setCurrentPreviewDoc] = useState<DocumentDto | null>(null)
  const [previewDocs, setPreviewDocs] = useState<DocumentDto[]>([])
  const [previewIndex, setPreviewIndex] = useState(0)

  const loadSettlements = useCallback(async () => {
    if (!eventId) return
    setIsListLoading(true)
    try {
      const data = await getSettlements(eventId)
      setSettlements(data)
    } catch (error) {
      console.error("Error fetching settlements:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać ugód",
        variant: "destructive",
      })
    } finally {
      setIsListLoading(false)
    }
  }, [eventId, toast])

  useEffect(() => {
    loadSettlements()
  }, [loadSettlements])

  // Calculate total settlement amounts by currency
  const totalPaymentsByCurrency = useMemo(() => {
    return settlements.reduce(
      (acc, settlement) => {
        const currency = settlement.currency || "PLN"
        const amount = settlement.settlementAmount || 0
        acc[currency] = (acc[currency] || 0) + amount
        return acc
      },
      {} as Record<string, number>,
    )
  }, [settlements])

  const totalSettlementAmount = useMemo(() => {
    return settlements.reduce((sum, s) => sum + (s.settlementAmount || 0), 0)
  }, [settlements])

  // Handle form field changes
  const handleFormChange = useCallback((field: keyof SettlementFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Handle external entity change
  const handleExternalEntityChange = useCallback(
    (value: string) => {
      setShowCustomEntityInput(value === "custom")
      handleFormChange("externalEntity", value)
      if (value !== "custom") {
        handleFormChange("customExternalEntity", "")
      }
    },
    [handleFormChange],
  )

  // Toggle form visibility
  const toggleForm = useCallback(() => {
    setIsFormVisible((prev) => !prev)
    if (isFormVisible) {
      cancelEdit()
    }
  }, [isFormVisible])

  // File handling
  const onFileSelected = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(files)])
      setShowFileDescription(true)
    }
  }, [])

  const onFilesDropped = useCallback((files: FileList) => {
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(files)])
      setShowFileDescription(true)
    }
    setDropZoneActive(false)
    setOutlookDragActive(false)
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDropZoneActive(true)
  }, [])

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setDropZoneActive(false)
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const files = event.dataTransfer.files
      onFilesDropped(files)
    },
    [onFilesDropped],
  )

  const onOutlookDropDetected = useCallback((event: React.DragEvent) => {
    setOutlookDragActive(true)
  }, [])

  const removeSelectedFile = useCallback(
    (index: number) => {
      setSelectedFiles((prev) => {
        const updated = prev.filter((_, i) => i !== index)
        if (updated.length === 0) {
          setShowFileDescription(false)
          handleFormChange("documentDescription", "")
        }
        return updated
      })
    },
    [handleFormChange],
  )

  // Cancel edit
  const cancelEdit = useCallback(() => {
    setFormData(initialFormData)
    setSelectedFiles([])
    setShowFileDescription(false)
    setShowCustomEntityInput(false)
    setIsEditing(false)
    setEditingSettlementId(null)
    setCurrentSettlement(null)
  }, [])

  // Form submission
  const onSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      setIsLoading(true)

      try {
        const payload = {
          eventId,
          externalEntity: formData.externalEntity,
          customExternalEntity: formData.customExternalEntity || undefined,
          transferDate: formData.transferDate || undefined,
          settlementDate: formData.settlementDate || undefined,
          settlementAmount: formData.settlementAmount || undefined,
          currency: formData.currency || undefined,
          status: formData.status,
          documentDescription: formData.documentDescription || undefined,
        }

        if (isEditing && editingSettlementId) {
          await updateSettlement(editingSettlementId, payload, selectedFiles)
          toast({
            title: "Sukces",
            description: "Ugoda została zaktualizowana pomyślnie.",
          })
        } else {
          await createSettlement(payload, selectedFiles)
          toast({
            title: "Sukces",
            description: "Ugoda została dodana pomyślnie.",
          })
        }

        await loadSettlements()

        // Reset form
        setFormData(initialFormData)
        setSelectedFiles([])
        setShowFileDescription(false)
        setShowCustomEntityInput(false)
        setIsFormVisible(false)
        setIsEditing(false)
        setEditingSettlementId(null)
      } catch (error) {
        console.error("Error saving settlement:", error)
        toast({
          title: "Błąd",
          description: "Wystąpił błąd podczas zapisywania ugody.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
      [
        formData,
        selectedFiles,
        isEditing,
        editingSettlementId,
        eventId,
        loadSettlements,
        toast,
      ],
    )

  // Edit settlement
  const editSettlement = useCallback((settlement: Settlement) => {
    const isCustom = !!settlement.customExternalEntity
    setFormData({
      externalEntity: isCustom ? "custom" : settlement.externalEntity ?? "",
      customExternalEntity: settlement.customExternalEntity ?? "",
      transferDate: settlement.transferDate?.slice(0, 10) ?? "",
      status: settlement.status ?? "",
      settlementDate: settlement.settlementDate?.slice(0, 10) ?? "",
      settlementAmount: settlement.settlementAmount ?? 0,
      currency: settlement.currency ?? "PLN",
      documentDescription: settlement.documentDescription ?? "",
    })
    setShowCustomEntityInput(isCustom)
    setIsEditing(true)
    setEditingSettlementId(settlement.id!)
    setCurrentSettlement(settlement)
    setShowFileDescription(!!settlement.documents?.length)
    setIsFormVisible(true)
  }, [])

  // Delete settlement
  const removeSettlement = useCallback(
    async (settlementId: string) => {
      try {
        await deleteSettlement(settlementId)
        toast({
          title: "Sukces",
          description: "Ugoda została usunięta pomyślnie.",
        })
        await loadSettlements()
      } catch (error) {
        console.error("Error deleting settlement:", error)
        toast({
          title: "Błąd",
          description: "Nie udało się usunąć ugody.",
          variant: "destructive",
        })
      }
    },
    [loadSettlements, toast],
  )

  // File operations
  const isPreviewable = useCallback((fileName?: string) => {
    if (!fileName) return false
    const ext = fileName.toLowerCase().split(".").pop()
    return [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "docx",
      "xls",
      "xlsx",
    ].includes(ext || "")
  }, [])

  const getFileNameFromPath = (path: string): string => {
    return path.split("/").pop()?.split("?")[0] || "document"
  }

  const loadPreview = async (settlement: Settlement, doc: DocumentDto) => {
    const url = `${API_BASE_URL}/settlements/${settlement.id}/documents/${doc.id}/preview`
    const response = await authFetch(url, { method: "GET" })
    if (!response.ok) throw new Error("Failed to preview file")
    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)
    const fileName = doc.originalFileName || doc.fileName || "document"
    const ext = fileName.toLowerCase().split(".").pop()
    setPreviewFileName(fileName)

    if (ext === "pdf") {
      setPreviewFileType("pdf")
      setPreviewUrl(objectUrl)
    } else if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
      setPreviewFileType("image")
      setPreviewUrl(objectUrl)
    } else if (ext === "docx") {
      setPreviewFileType("docx")
      setPreviewUrl(objectUrl)
    } else if (ext === "xls" || ext === "xlsx") {
      setPreviewFileType("excel")
      setPreviewUrl(url)
      window.URL.revokeObjectURL(objectUrl)
    } else {
      setPreviewFileType("other")
      setPreviewUrl(objectUrl)
    }
    setCurrentPreviewDoc(doc)
  }

  const previewFile = useCallback(
    async (settlement: Settlement, doc?: DocumentDto) => {
      const docs = settlement.documents || []
      if (docs.length === 0) {
        try {
          const url = `${API_BASE_URL}/settlements/${settlement.id}/preview`
          const response = await authFetch(url, { method: "GET" })
          if (!response.ok) throw new Error("Failed to preview file")
          const blob = await response.blob()
          const objectUrl = window.URL.createObjectURL(blob)
          const fileName = settlement.documentName || "document"
          const ext = fileName.toLowerCase().split(".").pop()
          setPreviewDocs([])
          setPreviewFileName(fileName)
          if (ext === "pdf") {
            setPreviewFileType("pdf")
            setPreviewUrl(objectUrl)
          } else if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
            setPreviewFileType("image")
            setPreviewUrl(objectUrl)
          } else if (ext === "docx") {
            setPreviewFileType("docx")
            setPreviewUrl(objectUrl)
          } else if (ext === "xls" || ext === "xlsx") {
            setPreviewFileType("excel")
            setPreviewUrl(url)
            window.URL.revokeObjectURL(objectUrl)
          } else {
            setPreviewFileType("other")
            setPreviewUrl(objectUrl)
          }
          setCurrentPreviewSettlement(settlement)
          setCurrentPreviewDoc(null)
          setIsPreviewVisible(true)
        } catch (error) {
          console.error("Error previewing file:", error)
          toast({ title: "Błąd", description: "Błąd podczas wczytywania podglądu", variant: "destructive" })
        }
        return
      }

      const startIndex = doc ? docs.findIndex((d) => d.id === doc.id) : 0
      const index = startIndex >= 0 ? startIndex : 0
      setPreviewDocs(docs)
      setPreviewIndex(index)
      setCurrentPreviewSettlement(settlement)
      try {
        await loadPreview(settlement, docs[index])
        setIsPreviewVisible(true)
      } catch (error) {
        console.error("Error previewing file:", error)
        toast({ title: "Błąd", description: "Błąd podczas wczytywania podglądu", variant: "destructive" })
      }
    },
    [toast],
  )

  const showNextDoc = async () => {
    if (!currentPreviewSettlement || previewDocs.length === 0) return
    const next = (previewIndex + 1) % previewDocs.length
    setPreviewIndex(next)
    try {
      await loadPreview(currentPreviewSettlement, previewDocs[next])
    } catch (error) {
      console.error("Error previewing file:", error)
    }
  }

  const showPrevDoc = async () => {
    if (!currentPreviewSettlement || previewDocs.length === 0) return
    const prev = (previewIndex - 1 + previewDocs.length) % previewDocs.length
    setPreviewIndex(prev)
    try {
      await loadPreview(currentPreviewSettlement, previewDocs[prev])
    } catch (error) {
      console.error("Error previewing file:", error)
    }
  }

  const closePreview = useCallback(() => {
    setIsPreviewVisible(false)
    if (previewUrl && previewUrl.startsWith("blob:")) {
      window.URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl("")
    setPreviewFileName("")
    setCurrentPreviewSettlement(null)
    setCurrentPreviewDoc(null)
    setPreviewDocs([])
  }, [previewUrl])

  const downloadFile = useCallback(
    async (settlement: Settlement, doc?: DocumentDto) => {
      try {
        const downloadUrl = doc
          ? `${API_BASE_URL}/settlements/${settlement.id}/documents/${doc.id}/download`
          : `${API_BASE_URL}/settlements/${settlement.id}/download`

        const response = await authFetch(downloadUrl, { method: "GET" })
        if (!response.ok) {
          throw new Error("Failed to download file")
        }
        const blob = await response.blob()
        const objectUrl = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = objectUrl
        a.download =
          doc?.originalFileName || doc?.fileName || settlement.documentName || "document"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(objectUrl)
        document.body.removeChild(a)
      } catch (error) {
        console.error("Error downloading file:", error)
        toast({
          title: "Błąd",
          description: "Błąd podczas pobierania pliku",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  // Get display name for external entity
  const getDisplayExternalEntity = useCallback((settlement: Settlement) => {
    return settlement.externalEntity || "Nie określono"
  }, [])

  // Get status class for styling
  const getStatusClass = useCallback((status?: string) => {
    switch (status) {
      case "w trakcie":
        return "bg-yellow-100 text-yellow-800"
      case "akceptacja":
        return "bg-green-100 text-green-800"
      case "odmowa":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }, [])

  // Format date for display
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("pl-PL")
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#d1d9e6] overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-md mb-4 border border-[#d1d9e6]">
          <div className="text-[#1a3a6c]">
            <HandHeart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#1a3a6c]">Ugoda</h2>
          </div>
        </div>

        {/* Add/Edit Settlement Form Toggle Button */}
        <div className="mb-4 flex justify-end">
          <Button
            onClick={toggleForm}
            className="bg-[#1a3a6c] text-white hover:bg-[#15305a] transition-colors flex items-center gap-2"
          >
            {!isFormVisible ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
            {isFormVisible ? "Ukryj formularz" : "Dodaj nową ugodę"}
          </Button>
        </div>

        {/* Add New Settlement Card */}
        {isFormVisible && (
          <div className="bg-white rounded-lg border border-[#d1d9e6] overflow-hidden mb-6">
            <div className="p-4 bg-[#f8fafc] border-b border-[#d1d9e6]">
              <h3 className="text-sm font-semibold text-[#1a3a6c]">
                {isEditing ? `Edytuj ugodę #${editingSettlementId}` : "Dodaj nową ugodę"}
              </h3>
              {isEditing && (
                <p className="text-sm text-gray-600 mt-0.5">
                  Edytujesz istniejącą ugodę. Możesz zmienić wszystkie dane i załączyć nowy dokument.
                </p>
              )}
            </div>

            <div className="p-5">
              <form onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* External Entity */}
                  <div className="grid gap-2">
                    <Label className="text-[#1a3a6c] text-sm font-medium">Podmiot zewnętrzny:</Label>
                    <div className="flex gap-2">
                      <Select value={formData.externalEntity} onValueChange={handleExternalEntityChange}>
                        <SelectTrigger className="flex-1 border border-[#d1d9e6] focus:ring-2 focus:ring-[#1a3a6c]/20 focus:border-[#1a3a6c]">
                          <SelectValue placeholder="-- Wybierz podmiot --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- Wybierz podmiot --</SelectItem>
                          <SelectItem value="ClaimXpert360">ClaimXpert360</SelectItem>
                          <SelectItem value="custom">Inny podmiot...</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Custom entity input */}
                    {showCustomEntityInput && (
                      <Input
                        type="text"
                        className="w-full border border-[#d1d9e6] focus:ring-2 focus:ring-[#1a3a6c]/20 focus:border-[#1a3a6c]"
                        value={formData.customExternalEntity}
                        onChange={(e) => handleFormChange("customExternalEntity", e.target.value)}
                        placeholder="Wprowadź nazwę podmiotu"
                      />
                    )}
                  </div>

                  {/* Transfer Date */}
                  <div className="grid gap-2">
                    <Label className="text-[#1a3a6c] text-sm font-medium">
                      Data przekazania do podmiotu zewnętrznego:
                    </Label>
                    <Input
                      type="date"
                      className="w-full border border-[#d1d9e6] focus:ring-2 focus:ring-[#1a3a6c]/20 focus:border-[#1a3a6c]"
                      value={formData.transferDate}
                      onChange={(e) => handleFormChange("transferDate", e.target.value)}
                    />
                  </div>

                  {/* Status */}
                  <div className="grid gap-2">
                    <Label className="text-[#1a3a6c] text-sm font-medium">Status:</Label>
                    <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                      <SelectTrigger className="w-full border border-[#d1d9e6] focus:ring-2 focus:ring-[#1a3a6c]/20 focus:border-[#1a3a6c]">
                        <SelectValue placeholder="-- Wybierz status --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- Wybierz status --</SelectItem>
                        <SelectItem value="w trakcie">W trakcie</SelectItem>
                        <SelectItem value="akceptacja">Akceptacja</SelectItem>
                        <SelectItem value="odmowa">Odmowa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Settlement Date */}
                  <div className="grid gap-2">
                    <Label className="text-[#1a3a6c] text-sm font-medium">Data zawarcia ugody:</Label>
                    <Input
                      type="date"
                      className="w-full border border-[#d1d9e6] focus:ring-2 focus:ring-[#1a3a6c]/20 focus:border-[#1a3a6c]"
                      value={formData.settlementDate}
                      onChange={(e) => handleFormChange("settlementDate", e.target.value)}
                    />
                  </div>

                  {/* Settlement Amount with Currency */}
                  <div className="grid gap-2 md:col-span-2">
                    <Label className="text-[#1a3a6c] text-sm font-medium">Kwota ugody:</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        className="flex-1 border border-[#d1d9e6] focus:ring-2 focus:ring-[#1a3a6c]/20 focus:border-[#1a3a6c]"
                        value={formData.settlementAmount}
                        onChange={(e) => handleFormChange("settlementAmount", Number.parseFloat(e.target.value) || 0)}
                        placeholder="Wprowadź kwotę ugody"
                      />
                      <Select value={formData.currency} onValueChange={(value) => handleFormChange("currency", value)}>
                        <SelectTrigger className="w-20 border border-[#d1d9e6] focus:ring-2 focus:ring-[#1a3a6c]/20 focus:border-[#1a3a6c]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLN">PLN</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="CHF">CHF</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/** Payment method, notes, and description fields removed to match updated design */}
                </div>

                {/* Document Upload Section */}
                <div className="grid gap-2 mt-5">
                  <Label className="text-[#1a3a6c] text-sm font-medium">Załącz dokument ugody (PDF):</Label>

                  {isEditing && selectedFiles.length === 0 && currentSettlement?.documents?.length ? (
                    <div className="space-y-2 mb-4">
                      {currentSettlement.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="text-[#1a3a6c] h-4 w-4" />
                            <span className="text-sm font-medium">
                              {doc.originalFileName || doc.fileName}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {isPreviewable(doc.originalFileName || doc.fileName || "") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => previewFile(currentSettlement, doc)}
                                title="Podgląd"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadFile(currentSettlement, doc)}
                              title="Pobierz"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {showFileDescription && (
                        <div className="p-3 bg-white rounded-b-lg border-x border-b">
                          <Label className="block text-[#1a3a6c] text-sm font-medium mb-1">
                            Opis dokumentu:
                          </Label>
                          <Textarea
                            value={formData.documentDescription}
                            onChange={(e) => handleFormChange("documentDescription", e.target.value)}
                            className="w-full border border-[#d1d9e6] focus:ring-2 focus:ring-[#1a3a6c]/20 focus:border-[#1a3a6c] text-sm"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Drop zone for drag and drop */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 transition-all relative ${
                      dropZoneActive ? "border-[#1a3a6c] bg-[#1a3a6c]/5" : "border-[#d1d9e6]"
                    }`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                  >
                    {/* Outlook drag indicator */}
                    {outlookDragActive && (
                      <div className="absolute inset-0 bg-[#1a3a6c]/10 flex items-center justify-center rounded-lg">
                        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                          <Upload className="mx-auto mb-2 text-[#1a3a6c] h-10 w-10" />
                          <p className="text-[#1a3a6c] font-medium">Upuść załącznik z Outlooka tutaj</p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col items-center justify-center text-center">
                      <FileText className="mb-3 text-gray-400 h-10 w-10" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Kliknij, aby wybrać plik</span> lub przeciągnij i upuść
                      </p>
                      <p className="text-xs text-gray-400">Obsługiwane formaty: PDF, DOC, DOCX, JPG, PNG</p>
                      <input
                        type="file"
                        className="hidden"
                        onChange={onFileSelected}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        id="file-input"
                        multiple
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById("file-input")?.click()}
                        className="mt-4 bg-gray-100 text-[#1a3a6c] border border-[#d1d9e6] hover:bg-gray-200"
                        variant="outline"
                      >
                        Wybierz plik
                      </Button>
                    </div>
                  </div>

                  {/* Selected files display with description field */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-t-lg border border-[#d1d9e6] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="text-[#1a3a6c] h-4 w-4" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeSelectedFile(index)}
                            variant="ghost"
                            size="sm"
                            className="p-1 text-gray-500 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {showFileDescription && (
                        <div className="p-3 bg-white rounded-b-lg border-x border-b border-[#d1d9e6]">
                          <Label className="block text-[#1a3a6c] text-sm font-medium mb-1">
                            Opis dokumentu:
                          </Label>
                          <Textarea
                            value={formData.documentDescription}
                            onChange={(e) => handleFormChange("documentDescription", e.target.value)}
                            className="w-full border border-[#d1d9e6] focus:ring-2 focus:ring-[#1a3a6c]/20 focus:border-[#1a3a6c] text-sm"
                            placeholder="Dodaj opis dokumentu (np. 'Umowa ugody', 'Protokół ugody', itp.)"
                            rows={2}
                          />
                          <p className="text-xs text-gray-500 mt-0.5">
                            Opis pomoże w łatwiejszej identyfikacji dokumentu w przyszłości.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Outlook integration hint */}
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <Info className="h-3 w-3" />
                    <span>Możesz przeciągnąć załącznik bezpośrednio z Outlooka lub wkleić go ze schowka (Ctrl+V)</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <div className="bg-[#f0f9ff] p-3 rounded border border-[#bae6fd] flex items-center gap-2">
                    <Info className="text-[#0284c7] h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium text-[#0284c7]">
                        Suma ugód: <span className="font-bold">{totalSettlementAmount.toFixed(2)} PLN</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isEditing && (
                      <Button type="button" onClick={cancelEdit} variant="outline">
                        Anuluj
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-[#1a3a6c] text-white hover:bg-[#15305a] flex items-center gap-2"
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isEditing ? "Zapisz zmiany" : "Dodaj ugodę"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Settlement List Card */}
        {!isFormVisible && (
          <div className="bg-white rounded-lg border border-[#d1d9e6] overflow-hidden">
            <div className="p-4 bg-[#f8fafc] border-b border-[#d1d9e6] flex justify-between items-center">
              <h3 className="text-sm font-semibold text-[#1a3a6c]">Lista ugód</h3>
              <div className="text-sm text-gray-500">
                {Object.keys(totalPaymentsByCurrency).length > 0 ? (
                  <>
                    Łączne kwoty ugód:
                    {Object.entries(totalPaymentsByCurrency).map(([currency, amount], index) => (
                      <span key={currency} className="ml-1">
                        <span className="font-bold text-[#1a3a6c]">
                          {amount.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
                          {currency}
                        </span>
                        {index < Object.entries(totalPaymentsByCurrency).length - 1 ? "; " : ""}
                      </span>
                    ))}
                  </>
                ) : (
                  <>
                    Łączna kwota ugód: <span className="font-bold text-[#1a3a6c]">0.00</span>
                  </>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50 text-[#1a3a6c] text-sm">
                    <th className="py-3 px-4 border-b border-[#d1d9e6] text-left font-medium">Podmiot zewnętrzny</th>
                    <th className="py-3 px-4 border-b border-[#d1d9e6] text-left font-medium">Data przekazania</th>
                    <th className="py-3 px-4 border-b border-[#d1d9e6] text-left font-medium">Status</th>
                    <th className="py-3 px-4 border-b border-[#d1d9e6] text-left font-medium">Data ugody</th>
                    <th className="py-3 px-4 border-b border-[#d1d9e6] text-left font-medium">Kwota</th>
                    <th className="py-3 px-4 border-b border-[#d1d9e6] text-left font-medium">Waluta</th>
                    <th className="py-3 px-4 border-b border-[#d1d9e6] text-left font-medium">Dokument</th>
                    <th className="py-3 px-4 border-b border-[#d1d9e6] text-center font-medium">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {isListLoading && settlements.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-gray-500">
                        Ładowanie danych...
                      </td>
                    </tr>
                  )}
                  {!isListLoading && settlements.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-gray-500">
                        Brak ugód do wyświetlenia
                      </td>
                    </tr>
                  )}
                  {settlements.map((settlement) => (
                    <tr key={settlement.id} className="hover:bg-gray-50 text-sm">
                      <td className="py-3 px-4 border-b border-[#d1d9e6] text-gray-700">
                        {getDisplayExternalEntity(settlement)}
                      </td>
                      <td className="py-3 px-4 border-b border-[#d1d9e6] text-gray-700">
                        {formatDate(settlement.transferDate)}
                      </td>
                      <td className="py-3 px-4 border-b border-[#d1d9e6]">
                        <Badge className={getStatusClass(settlement.status)}>{settlement.status}</Badge>
                      </td>
                      <td className="py-3 px-4 border-b border-[#d1d9e6] text-gray-700">
                        {formatDate(settlement.settlementDate)}
                      </td>
                      <td className="py-3 px-4 border-b border-[#d1d9e6] text-gray-700">
                        {settlement.settlementAmount || "-"}
                      </td>
                      <td className="py-3 px-4 border-b border-[#d1d9e6] text-gray-700">
                        {settlement.currency || "PLN"}
                      </td>
                      <td className="py-3 px-4 border-b border-[#d1d9e6]">
                        {(() => {
                          const count = settlement.documents?.length || (settlement.documentPath ? 1 : 0)
                          if (count === 0) {
                            return <span className="text-gray-500">Brak dokumentu</span>
                          }
                          return (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700">Załączniki ({count})</span>
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => previewFile(settlement)}
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                  title="Podgląd"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => downloadFile(settlement)}
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50"
                                  title="Pobierz"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })()}
                      </td>
                      <td className="py-3 px-4 border-b border-[#d1d9e6] text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            onClick={() => editSettlement(settlement)}
                            variant="ghost"
                            size="sm"
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Edytuj"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <ConfirmDialog
                            title="Czy na pewno chcesz usunąć tę ugodę?"
                            description="Ta akcja nie może być cofnięta. Ugoda zostanie trwale usunięta."
                            onConfirm={() => removeSettlement(settlement.id!)}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Usuń"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-50 border-t border-[#d1d9e6] flex justify-center">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>
                  Wyświetlanie {settlements.length > 0 ? `1-${settlements.length}` : "0"} z {settlements.length} ugód
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <DocumentPreview
        isOpen={isPreviewVisible}
        onClose={closePreview}
        url={previewUrl}
        fileName={previewFileName}
        fileType={previewFileType}
        canNavigate={previewDocs.length > 1}
        onPrev={showPrevDoc}
        onNext={showNextDoc}
        onDownload={() =>
          currentPreviewSettlement &&
          downloadFile(
            currentPreviewSettlement,
            previewDocs.length ? previewDocs[previewIndex] : currentPreviewDoc || undefined,
          )
        }
      />
    </div>
  )
}
