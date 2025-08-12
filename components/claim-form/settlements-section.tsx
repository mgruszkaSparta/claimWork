"use client"

import type React from "react"
import { useState, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { HandHeart, Plus, Minus, Edit, Trash2, Download, Eye, X, Upload, FileText, Info, Loader2 } from "lucide-react"
import { getSettlements, createSettlement, updateSettlement, deleteSettlement } from "@/lib/api/settlements"
import type { Settlement } from "@/types"

interface SettlementsSectionProps {
  claimId: string
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

export const SettlementsSection: React.FC<SettlementsSectionProps> = ({ claimId }) => {
  const { toast } = useToast()

  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [isListLoading, setIsListLoading] = useState(false)

  // Form state
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingSettlementId, setEditingSettlementId] = useState<string | null>(null)
  const [formData, setFormData] = useState<SettlementFormData>(initialFormData)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCustomEntityInput, setShowCustomEntityInput] = useState(false)
  const [showFileDescription, setShowFileDescription] = useState(false)
  const [dropZoneActive, setDropZoneActive] = useState(false)
  const [outlookDragActive, setOutlookDragActive] = useState(false)

  // Preview state
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [previewFileName, setPreviewFileName] = useState<string>("")
  const [previewFileType, setPreviewFileType] = useState<"pdf" | "image" | "other">("other")
  const [currentPreviewSettlement, setCurrentPreviewSettlement] = useState<Settlement | null>(null)

  const loadSettlements = useCallback(async () => {
    if (!claimId) return
    setIsListLoading(true)
    try {
      const data = await getSettlements(claimId)
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
  }, [claimId, toast])

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
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setShowFileDescription(true)
    }
  }, [])

  const onFilesDropped = useCallback((files: FileList) => {
    if (files.length > 0) {
      setSelectedFile(files[0])
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

  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null)
    setShowFileDescription(false)
    handleFormChange("documentDescription", "")
  }, [handleFormChange])

  // Cancel edit
  const cancelEdit = useCallback(() => {
    setFormData(initialFormData)
    setSelectedFile(null)
    setShowFileDescription(false)
    setShowCustomEntityInput(false)
    setIsEditing(false)
    setEditingSettlementId(null)
  }, [])

  // Form submission
  const onSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()
      setIsLoading(true)

      try {
        const body = new FormData()
        body.append("eventId", claimId)
        body.append("externalEntity", formData.externalEntity)
        if (formData.customExternalEntity) {
          body.append("customExternalEntity", formData.customExternalEntity)
        }
        if (formData.transferDate) body.append("transferDate", formData.transferDate)
        if (formData.settlementDate) body.append("settlementDate", formData.settlementDate)
        if (formData.settlementAmount)
          body.append("settlementAmount", formData.settlementAmount.toString())
        if (formData.currency) body.append("currency", formData.currency)
        if (formData.status) body.append("status", formData.status)
        if (formData.documentDescription)
          body.append("documentDescription", formData.documentDescription)
        if (selectedFile) {
          body.append("document", selectedFile)
        }

        if (isEditing && editingSettlementId) {
          await updateSettlement(editingSettlementId, body)
          toast({
            title: "Sukces",
            description: "Ugoda została zaktualizowana pomyślnie.",
          })
        } else {
          await createSettlement(body)
          toast({
            title: "Sukces",
            description: "Ugoda została dodana pomyślnie.",
          })
        }

        await loadSettlements()

        // Reset form
        setFormData(initialFormData)
        setSelectedFile(null)
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
    [formData, selectedFile, isEditing, editingSettlementId, claimId, loadSettlements, toast],
  )

  // Edit settlement
  const editSettlement = useCallback((settlement: Settlement) => {
    const isCustom =
      settlement.externalEntity && !["ClaimXpert360"].includes(settlement.externalEntity)
    setFormData({
      externalEntity: isCustom ? "custom" : settlement.externalEntity || "",
      customExternalEntity: isCustom ? settlement.externalEntity || "" : "",
      transferDate: settlement.transferDate || "",
      status: settlement.status || "",
      settlementDate: settlement.settlementDate || "",
      settlementAmount: settlement.settlementAmount || 0,
      currency: settlement.currency || "PLN",
      documentDescription: settlement.description || "",
    })
    setShowCustomEntityInput(isCustom)
    setIsEditing(true)
    setEditingSettlementId(settlement.id!)
    setIsFormVisible(true)
  }, [])

  // Delete settlement
  const removeSettlement = useCallback(
    async (settlementId: string) => {
      if (!window.confirm("Czy na pewno chcesz usunąć tę ugodę?")) return
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
    return ["pdf", "jpg", "jpeg", "png", "gif"].includes(ext || "")
  }, [])

  const previewFile = useCallback((settlement: Settlement) => {
    if (!settlement.documentPath) return

    const fileName = settlement.documentName || "document"
    const ext = fileName.toLowerCase().split(".").pop()

    setPreviewUrl(settlement.documentPath)
    setPreviewFileName(fileName)
    setCurrentPreviewSettlement(settlement)

    if (ext === "pdf") {
      setPreviewFileType("pdf")
    } else if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
      setPreviewFileType("image")
    } else {
      setPreviewFileType("other")
    }

    setIsPreviewVisible(true)
  }, [])

  const closePreview = useCallback(() => {
    setIsPreviewVisible(false)
    setPreviewUrl("")
    setPreviewFileName("")
    setCurrentPreviewSettlement(null)
  }, [])

  const downloadFile = useCallback((settlement: Settlement) => {
    if (!settlement.documentPath || !settlement.documentName) return

    const link = document.createElement("a")
    link.href = settlement.documentPath
    link.download = settlement.documentName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

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
            <h2 className="text-lg font-semibold text-[#1a3a6c]">Ugoda</h2>
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
              <h3 className="text-md font-semibold text-[#1a3a6c]">
                {isEditing ? `Edytuj ugodę #${editingSettlementId}` : "Dodaj nową ugodę"}
              </h3>
              {isEditing && (
                <p className="text-sm text-gray-600 mt-1">
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
                        placeholder="0.00"
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
                </div>

                {/* Document Upload Section */}
                <div className="grid gap-2 mt-5">
                  <Label className="text-[#1a3a6c] text-sm font-medium">Załącz dokument ugody (PDF):</Label>

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

                  {/* Selected file display with description field */}
                  {selectedFile && (
                    <div className="mt-2">
                      {/* File info */}
                      <div className="p-3 bg-gray-50 rounded-t-lg border border-[#d1d9e6] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="text-[#1a3a6c] h-4 w-4" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                          <span className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <Button
                          type="button"
                          onClick={removeSelectedFile}
                          variant="ghost"
                          size="sm"
                          className="p-1 text-gray-500 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* File description field */}
                      {showFileDescription && (
                        <div className="p-3 bg-white rounded-b-lg border-x border-b border-[#d1d9e6]">
                          <Label className="block text-[#1a3a6c] text-sm font-medium mb-1">Opis dokumentu:</Label>
                          <Textarea
                            value={formData.documentDescription}
                            onChange={(e) => handleFormChange("documentDescription", e.target.value)}
                            className="w-full border border-[#d1d9e6] focus:ring-2 focus:ring-[#1a3a6c]/20 focus:border-[#1a3a6c] text-sm"
                            placeholder="Dodaj opis dokumentu (np. 'Umowa ugody', 'Protokół ugody', itp.)"
                            rows={2}
                          />
                          <p className="text-xs text-gray-500 mt-1">
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
                        Suma ugód:{" "}
                        <span className="font-bold">
                          {Object.entries(totalPaymentsByCurrency).map(([currency, amount], index) => (
                            <span key={currency}>
                              {amount.toFixed(2)} {currency}
                              {index < Object.entries(totalPaymentsByCurrency).length - 1 ? ", " : ""}
                            </span>
                          ))}
                          {Object.keys(totalPaymentsByCurrency).length === 0 && "0.00 PLN"}
                        </span>
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
              <h3 className="text-md font-semibold text-[#1a3a6c]">Lista ugód</h3>
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
                        {settlement.documentPath ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">{settlement.documentName}</span>
                            <div className="flex gap-1">
                              {isPreviewable(settlement.documentName) && (
                                <Button
                                  onClick={() => previewFile(settlement)}
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                  title="Podgląd"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
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
                        ) : (
                          <span className="text-gray-500">Brak dokumentu</span>
                        )}
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
                          <Button
                            onClick={() => removeSettlement(settlement.id!)}
                            variant="ghost"
                            size="sm"
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Usuń"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* File Preview Modal */}
      {isPreviewVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="p-4 bg-[#f8fafc] border-b border-[#d1d9e6] flex justify-between items-center">
              <h3 className="text-md font-semibold text-[#1a3a6c]">Podgląd: {previewFileName}</h3>
              <Button
                onClick={closePreview}
                variant="ghost"
                size="sm"
                className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Preview content */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100">
              {/* PDF Preview */}
              {previewFileType === "pdf" && (
                <iframe src={previewUrl} className="w-full h-full border-0" title="PDF Preview" />
              )}

              {/* Image Preview */}
              {previewFileType === "image" && (
                <img
                  src={previewUrl || "/placeholder.svg"}
                  className="max-w-full max-h-[70vh] object-contain"
                  alt="Preview"
                />
              )}

              {/* Other File Types */}
              {previewFileType === "other" && (
                <div className="text-center p-8">
                  <FileText className="mx-auto mb-4 text-gray-400 h-12 w-12" />
                  <p className="text-gray-600">Podgląd niedostępny dla tego typu pliku.</p>
                  <p className="text-gray-500 text-sm mt-2">Możesz pobrać plik, aby go otworzyć.</p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-4 bg-gray-50 border-t border-[#d1d9e6] flex justify-end">
              <Button
                onClick={() => currentPreviewSettlement && downloadFile(currentPreviewSettlement)}
                className="bg-[#1a3a6c] text-white hover:bg-[#15305a] flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Pobierz plik
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
