"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Plus, Minus, Edit, Trash2, Download, Eye, Upload, X, FileText, Loader2, Gavel, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Decision } from "@/types"
import type { DocumentDto } from "@/lib/api"
import {
  getDecisions as apiGetDecisions,
  createDecision as apiCreateDecision,
  updateDecision as apiUpdateDecision,
  deleteDecision as apiDeleteDecision,
} from "@/lib/api/decisions"
import { API_BASE_URL } from "@/lib/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DecisionsSectionProps {
  claimId?: string
  onChange?: (decisions: Decision[]) => void
}

export function DecisionsSection({ claimId, onChange }: DecisionsSectionProps) {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingDecisionId, setEditingDecisionId] = useState<string | null>(null)
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [showFileDescription, setShowFileDescription] = useState(false)
  const [dropZoneActive, setDropZoneActive] = useState(false)
  const [outlookDragActive, setOutlookDragActive] = useState(false)

  // Preview modal state
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewFileName, setPreviewFileName] = useState("")
  const [previewFileType, setPreviewFileType] = useState("")
  const [currentPreviewDecision, setCurrentPreviewDecision] = useState<Decision | null>(null)
  const [currentPreviewDoc, setCurrentPreviewDoc] = useState<DocumentDto | null>(null)
  const [previewDocs, setPreviewDocs] = useState<DocumentDto[]>([])
  const [previewIndex, setPreviewIndex] = useState(0)

  // Form state
  const [formData, setFormData] = useState({
    decisionDate: new Date().toISOString().split("T")[0],
    status: "",
    amount: "",
    currency: "PLN",
    compensationTitle: "",
    documentDescription: "",
  })

  const [totalPaymentsByCurrency, setTotalPaymentsByCurrency] = useState<Record<string, number>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadDecisions()
  }, [claimId])

  useEffect(() => {
    calculateTotalsByCurrency()
  }, [decisions])

  const loadDecisions = async () => {
    if (!claimId) {
      console.warn("Missing claim ID, skipping decisions fetch")
      toast({
        title: "Brak ID roszczenia",
        description: "Nie można załadować decyzji bez ID roszczenia",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const data = await apiGetDecisions(claimId)
      setDecisions(data)
      onChange?.(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error("Error loading decisions:", message)
      toast({
        title: "Błąd",
        description: `Błąd podczas ładowania decyzji: ${message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotalsByCurrency = () => {
    const totals: Record<string, number> = {}

    decisions.forEach((decision) => {
      if (decision.amount && decision.currency) {
        if (totals[decision.currency]) {
          totals[decision.currency] += decision.amount
        } else {
          totals[decision.currency] = decision.amount
        }
      }
    })

    setTotalPaymentsByCurrency(totals)
  }

  const resetForm = () => {
    setFormData({
      decisionDate: new Date().toISOString().split("T")[0],
      status: "",
      amount: "",
      currency: "PLN",
      compensationTitle: "",
      documentDescription: "",
    })
    setSelectedFiles([])
    setShowFileDescription(false)
    setIsEditing(false)
    setEditingDecisionId(null)
    setCurrentDecision(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible)
    if (!isFormVisible) {
      resetForm()
    }
  }

  const cancelForm = () => {
    resetForm()
    setIsFormVisible(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const newFiles = Array.from(files)
      setSelectedFiles((prev) => [...prev, ...newFiles])
      setShowFileDescription(true)
      toast({
        title: "Pliki dodane",
        description: `Dodano ${newFiles.length} plik(ów)`,
      })
    }
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    if (selectedFiles.length === 1) {
      setShowFileDescription(false)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setDropZoneActive(true)

    if (event.dataTransfer.types.includes("Files")) {
      setOutlookDragActive(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setDropZoneActive(false)
    setOutlookDragActive(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setDropZoneActive(false)
    setOutlookDragActive(false)

    const files = event.dataTransfer.files
    if (files.length > 0) {
      const newFiles = Array.from(files)
      setSelectedFiles((prev) => [...prev, ...newFiles])
      setShowFileDescription(true)
      toast({
        title: "Pliki dodane",
        description: `Przeciągnięto ${newFiles.length} plik(ów)`,
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.status || !formData.decisionDate) {
      toast({
        title: "Błąd",
        description: "Formularz zawiera błędy. Sprawdź wszystkie pola.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        decisionDate: formData.decisionDate,
        status: formData.status,
        amount: formData.amount ? Number(formData.amount) : undefined,
        currency: formData.currency,
        compensationTitle: formData.compensationTitle ?? undefined,
        documentDescription: formData.documentDescription || undefined,
      }

      if (isEditing && editingDecisionId) {
        await apiUpdateDecision(claimId, editingDecisionId, payload, selectedFiles)
        toast({ title: "Sukces", description: "Decyzja została zaktualizowana" })
      } else {
        await apiCreateDecision(claimId, payload, selectedFiles)
        toast({ title: "Sukces", description: "Decyzja została dodana" })
      }

      resetForm()
      setIsFormVisible(false)
      loadDecisions()
    } catch (error) {
      console.error("Error saving decision:", error)
      toast({
        title: "Błąd",
        description: isEditing ? "Błąd podczas aktualizacji decyzji" : "Błąd podczas dodawania decyzji",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const editDecision = (decision: Decision) => {
    setIsEditing(true)
    setEditingDecisionId(decision.id!)
    setIsFormVisible(true)
    setCurrentDecision(decision)
    setShowFileDescription(!!(decision.documentPath || decision.documents?.length))

    const decisionDate = new Date(decision.decisionDate)
    const year = decisionDate.getFullYear()
    const month = (decisionDate.getMonth() + 1).toString().padStart(2, "0")
    const day = decisionDate.getDate().toString().padStart(2, "0")
    const formattedDate = `${year}-${month}-${day}`

    setFormData({
      decisionDate: formattedDate,
      status: decision.status,
      amount: decision.amount?.toString() || "",
      currency: decision.currency || "PLN",
      compensationTitle: decision.compensationTitle ?? "",
      documentDescription: decision.documentDescription || "",
    })

    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const deleteDecision = async (id: string) => {
    setIsLoading(true)
    try {
      await apiDeleteDecision(claimId, id)
      toast({
        title: "Sukces",
        description: "Decyzja została usunięta",
      })
      loadDecisions()
    } catch (error) {
      console.error("Error deleting decision:", error)
      toast({
        title: "Błąd",
        description: "Błąd podczas usuwania decyzji",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadFile = async (decision: Decision, doc?: DocumentDto) => {
    if (!claimId) {
      toast({
        title: "Brak ID roszczenia",
        description: "Nie można pobrać pliku bez ID roszczenia",
        variant: "destructive",
      })
      return
    }

    const fileName = doc?.originalFileName || doc?.fileName || getDisplayFileName(decision)

    try {
      const url =
        doc?.downloadUrl ??
        (doc
          ? `${API_BASE_URL}/documents/${doc.id}/download`
          : `${API_BASE_URL}/claims/${claimId}/decisions/${decision.id}/download`)

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      })
      if (response.ok) {
        const blob = await response.blob()
        const objectUrl = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = objectUrl
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(objectUrl)
        document.body.removeChild(a)
      } else {
        throw new Error("Failed to download file")
      }
    } catch (error) {
      console.error("Error downloading file:", error)
      toast({
        title: "Błąd",
        description: "Błąd podczas pobierania pliku",
        variant: "destructive",
      })
    }
  }

  const loadPreview = async (decision: Decision, doc: DocumentDto) => {
    if (!claimId) return
    const url = doc.previewUrl ?? `${API_BASE_URL}/documents/${doc.id}/preview`
    const response = await fetch(url, { method: "GET", credentials: "include" })
    if (!response.ok) throw new Error("Failed to preview file")
    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)
    const name = doc.originalFileName || doc.fileName
    setPreviewUrl(objectUrl)
    setPreviewFileName(name)
    setPreviewFileType(getFileType(name))
    setCurrentPreviewDoc(doc)
  }

  const previewFile = async (decision: Decision, doc?: DocumentDto) => {
    if (!claimId) {
      toast({
        title: "Brak ID roszczenia",
        description: "Nie można wyświetlić podglądu bez ID roszczenia",
        variant: "destructive",
      })
      return
    }

    const docs = decision.documents || []
    if (docs.length === 0) {
      // fallback for single file
      try {
        const url = `${API_BASE_URL}/claims/${claimId}/decisions/${decision.id}/preview`
        const response = await fetch(url, { method: "GET", credentials: "include" })
        if (!response.ok) throw new Error("Failed to preview file")
        const blob = await response.blob()
        const objectUrl = window.URL.createObjectURL(blob)
        const name = getDisplayFileName(decision)
        setPreviewDocs([])
        setPreviewUrl(objectUrl)
        setPreviewFileName(name)
        setPreviewFileType(getFileType(name))
        setCurrentPreviewDecision(decision)
        setCurrentPreviewDoc(null)
        setIsPreviewVisible(true)
      } catch (error) {
        console.error("Error previewing file:", error)
        toast({
          title: "Błąd",
          description: "Błąd podczas wczytywania podglądu",
          variant: "destructive",
        })
      }
      return
    }

    const startIndex = doc ? docs.findIndex((d) => d.id === doc.id) : 0
    const index = startIndex >= 0 ? startIndex : 0
    setPreviewDocs(docs)
    setPreviewIndex(index)
    setCurrentPreviewDecision(decision)
    try {
      await loadPreview(decision, docs[index])
      setIsPreviewVisible(true)
    } catch (error) {
      console.error("Error previewing file:", error)
      toast({
        title: "Błąd",
        description: "Błąd podczas wczytywania podglądu",
        variant: "destructive",
      })
    }
  }

  const showNextDoc = async () => {
    if (!currentPreviewDecision || previewDocs.length === 0) return
    const next = (previewIndex + 1) % previewDocs.length
    setPreviewIndex(next)
    try {
      await loadPreview(currentPreviewDecision, previewDocs[next])
    } catch (error) {
      console.error("Error previewing file:", error)
    }
  }

  const showPrevDoc = async () => {
    if (!currentPreviewDecision || previewDocs.length === 0) return
    const prev = (previewIndex - 1 + previewDocs.length) % previewDocs.length
    setPreviewIndex(prev)
    try {
      await loadPreview(currentPreviewDecision, previewDocs[prev])
    } catch (error) {
      console.error("Error previewing file:", error)
    }
  }

  const closePreview = () => {
    setIsPreviewVisible(false)
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setCurrentPreviewDecision(null)
    setCurrentPreviewDoc(null)
    setPreviewDocs([])
  }

  const getFileNameFromPath = (path: string): string => {
    return path.split("/").pop()?.split("?")[0] || "document"
  }

  const getDisplayFileName = (decision: Decision): string => {
    return decision.documentName || (decision.documentPath ? getFileNameFromPath(decision.documentPath) : "document")
  }

  const getFileType = (fileName: string): string => {
    const extension = fileName.split("?")[0].split(".").pop()?.toLowerCase()
    if (["pdf"].includes(extension || "")) return "pdf"
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(extension || "")) return "image"
    return "other"
  }

  const isPreviewable = (fileName: string): boolean => {
    const fileType = getFileType(fileName)
    return ["pdf", "image"].includes(fileType)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Wypłata":
        return "default" // green
      case "Odmowa":
        return "destructive" // red
      case "Podtrzymanie":
        return "secondary" // blue
      case "Ugoda":
        return "outline" // yellow
      default:
        return "secondary"
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return (
      new Intl.NumberFormat("pl-PL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) +
      " " +
      currency
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#d1d9e6] overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-md mb-4 border border-[#d1d9e6]">
          <div className="text-[#1a3a6c]">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#1a3a6c]">Decyzje</h2>
          </div>
        </div>

        {/* Add/Edit Decision Form Toggle Button */}
        <div className="mb-4 flex justify-end">
          <Button
            onClick={toggleForm}
            className="bg-[#1a3a6c] text-white px-4 py-2 rounded hover:bg-[#15305a] transition-colors flex items-center gap-2"
          >
            {isFormVisible ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isFormVisible ? "Ukryj formularz" : "Dodaj nową decyzję"}
          </Button>
        </div>

      {/* Add New Decision Form */}
      {isFormVisible && (
        <div className="bg-white rounded-lg border border-[#d1d9e6] overflow-hidden mb-6 shadow-sm">
          <div className="p-4 bg-[#f8fafc] border-b border-[#d1d9e6]">
            <h3 className="text-sm font-semibold text-[#1a3a6c]">
              {isEditing ? `Edytuj decyzję #${editingDecisionId}` : "Dodaj nową decyzję"}
            </h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="decisionDate" className="text-sm font-medium text-gray-700">
                    Data wydania decyzji *
                  </Label>
                  <Input
                    id="decisionDate"
                    type="date"
                    value={formData.decisionDate}
                    onChange={(e) => handleInputChange("decisionDate", e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status/rozstrzygnięcie *
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Wybierz status --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wypłata">Wypłata</SelectItem>
                      <SelectItem value="Odmowa">Odmowa</SelectItem>
                      <SelectItem value="Podtrzymanie">Podtrzymanie stanowiska</SelectItem>
                      <SelectItem value="Ugoda">Ugoda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                    Kwota wypłaty
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      className="flex-1"
                      placeholder="0.00"
                    />
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                      <SelectTrigger className="w-24">
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

                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <Label htmlFor="compensationTitle" className="text-sm font-medium text-gray-700">
                    Tytuł odszkodowania
                  </Label>
                  <Select
                    value={formData.compensationTitle}
                    onValueChange={(value) => handleInputChange("compensationTitle", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Wybierz tytuł --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pojazd - bezsporna">Pojazd - bezsporna</SelectItem>
                      <SelectItem value="Pojazd - szkoda całkowita">Pojazd - szkoda całkowita</SelectItem>
                      <SelectItem value="Pojazd - szkoda częściowa">Pojazd - szkoda częściowa</SelectItem>
                      <SelectItem value="Pojazd zastępczy">Pojazd zastępczy</SelectItem>
                      <SelectItem value="Holowanie">Holowanie</SelectItem>
                      <SelectItem value="Parkowanie">Parkowanie</SelectItem>
                      <SelectItem value="Dopłata - pojazd">Dopłata - pojazd</SelectItem>
                      <SelectItem value="Dopłata - pojazd zastępczy">Dopłata - pojazd zastępczy</SelectItem>
                      <SelectItem value="Inne">Inne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Załącz dokumenty decyzji</Label>

                {isEditing && currentDecision?.documents?.length ? (
                  <div className="space-y-2 mb-4">
                    {currentDecision.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-muted rounded-lg border flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">
                            {doc.originalFileName || doc.fileName}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {isPreviewable(doc.originalFileName || doc.fileName || "") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => previewFile(currentDecision, doc)}
                              title="Podgląd"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadFile(currentDecision, doc)}
                            title="Pobierz"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Drop zone for drag and drop */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 transition-all relative ${
                    dropZoneActive ? "border-primary bg-primary/5" : "border-gray-300"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {/* Outlook drag indicator */}
                  {outlookDragActive && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center rounded-lg">
                      <div className="bg-background p-4 rounded-lg shadow-lg text-center">
                        <Upload className="mx-auto mb-2 h-10 w-10 text-primary" />
                        <p className="text-primary font-medium">Upuść załączniki z Outlooka tutaj</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col items-center justify-center text-center">
                    <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Kliknij, aby wybrać pliki</span> lub przeciągnij i upuść
                    </p>
                    <p className="text-xs text-muted-foreground">Obsługiwane formaty: PDF, DOC, DOCX, JPG, PNG</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Możesz wybrać wiele plików jednocześnie</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      multiple
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 bg-transparent"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Wybierz pliki
                    </Button>
                  </div>
                </div>

                {/* Selected files display */}
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="p-3 bg-muted rounded-lg border flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSelectedFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showFileDescription && (
                  <div className="p-3 bg-background rounded-b-lg border-x border-b">
                    <Label htmlFor="documentDescription" className="text-sm font-medium">
                      Opis dokumentu
                    </Label>
                    <Textarea
                      id="documentDescription"
                      value={formData.documentDescription}
                      onChange={(e) => handleInputChange("documentDescription", e.target.value)}
                      rows={2}
                      className="mt-0.5"
                    />
                    {selectedFiles.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Opis pomoże w łatwiejszej identyfikacji dokumentu w przyszłości.
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    💡 Możesz przeciągnąć załączniki bezpośrednio z Outlooka lub wybrać wiele plików jednocześnie
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="text-sm font-medium text-blue-600">
                  {Object.keys(totalPaymentsByCurrency).length > 0 ? (
                    <div>
                      Suma wypłat:
                      <ul className="list-none ml-2 mt-0.5">
                        {Object.entries(totalPaymentsByCurrency).map(([currency, amount]) => (
                          <li key={currency} className="font-bold">
                            {formatCurrency(amount, currency)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <span>
                      Suma wypłat: <span className="font-bold">0.00 PLN</span>
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={cancelForm} className="px-6 bg-transparent">
                    Anuluj
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isEditing ? "Zapisz zmiany" : "Zapisz decyzję"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decision List */}
      {!isFormVisible && (
        <div className="bg-white rounded-lg border border-[#d1d9e6] overflow-hidden shadow-sm">
          <div className="p-4 bg-[#f8fafc] border-b border-[#d1d9e6] flex flex-row items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1a3a6c]">Lista decyzji</h3>
            <div className="text-sm text-gray-500">
              {Object.keys(totalPaymentsByCurrency).length > 0 ? (
                <div>
                  Łączne kwoty wypłat:{" "}
                  {Object.entries(totalPaymentsByCurrency).map(([currency, amount], index) => (
                    <span key={currency}>
                      <span className="font-bold text-primary">{formatCurrency(amount, currency)}</span>
                      {index < Object.entries(totalPaymentsByCurrency).length - 1 ? "; " : ""}
                    </span>
                  ))}
                </div>
              ) : (
                <span>
                  Łączna kwota wypłat: <span className="font-bold text-primary">0.00 PLN</span>
                </span>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Data</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Kwota</th>
                  <th className="py-3 px-4 text-left font-medium">Waluta</th>
                  <th className="py-3 px-4 text-left font-medium">Tytuł</th>
                  <th className="py-3 px-4 text-left font-medium">Dokumenty</th>
                  <th className="py-3 px-4 text-center font-medium">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && decisions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Ładowanie danych...
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && decisions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      <div className="space-y-2">
                        <Gavel className="h-8 w-8 mx-auto text-gray-300" />
                        <p>Brak decyzji do wyświetlenia</p>
                      </div>
                    </td>
                  </tr>
                )}
                {decisions.map((decision) => (
                  <tr key={decision.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm">{new Date(decision.decisionDate).toLocaleDateString("pl-PL")}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusBadgeVariant(decision.status)}>{decision.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {decision.amount ? formatCurrency(decision.amount, decision.currency) : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">{decision.currency || "PLN"}</td>
                    <td className="py-3 px-4 text-sm">{decision.compensationTitle ?? "-"}</td>
                    <td className="py-3 px-4">
                      {(() => {
                        const docs = decision.documents
                        if (docs && docs.length > 0) {
                          return (
                            <ul className="space-y-1">
                              {docs.map((doc) => (
                                <li key={doc.id} className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium">
                                    {doc.originalFileName || doc.fileName}
                                  </span>
                                  <div className="flex gap-1">
                                    {isPreviewable(doc.originalFileName || doc.fileName || "") && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => previewFile(decision, doc)}
                                        title="Podgląd"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => downloadFile(decision, doc)}
                                      title="Pobierz"
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )
                        }

                        if (decision.documentPath) {
                          const name = getDisplayFileName(decision)
                          return (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">{name}</span>
                              <div className="flex gap-1">
                                {isPreviewable(name) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => previewFile(decision)}
                                    title="Podgląd"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadFile(decision)}
                                  title="Pobierz"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        }

                        return <span className="text-sm text-muted-foreground">Brak dokumentów</span>
                      })()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => editDecision(decision)} title="Edytuj">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Usuń" className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Czy na pewno chcesz usunąć tę decyzję?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ta akcja nie może być cofnięta. Decyzja zostanie trwale usunięta.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anuluj</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteDecision(decision.id!)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Usuń
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-muted/50 border-t flex justify-center">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>
                Wyświetlanie {decisions.length > 0 ? `1-${decisions.length}` : "0"} z {decisions.length} decyzji
              </span>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      <Dialog open={isPreviewVisible} onOpenChange={closePreview}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Podgląd: {previewFileName}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto flex items-center justify-center bg-muted/50 rounded-lg">
            {previewFileType === "pdf" && previewUrl && (
              <iframe src={previewUrl} className="w-full h-[70vh] border-0" title="PDF Preview" />
            )}

            {previewFileType === "image" && previewUrl && (
              <img
                src={previewUrl || "/placeholder.svg"}
                className="max-w-full max-h-[70vh] object-contain"
                alt="Preview"
              />
            )}

            {previewFileType === "other" && (
              <div className="text-center p-8">
                <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Podgląd niedostępny dla tego typu pliku.</p>
                <p className="text-muted-foreground text-sm mt-2">Możesz pobrać plik, aby go otworzyć.</p>
              </div>
            )}
          </div>

      <div className="flex justify-between pt-4">
        {previewDocs.length > 1 && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={showPrevDoc}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Poprzedni</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={showNextDoc}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Następny</span>
            </Button>
          </div>
        )}
        <Button
          onClick={() =>
            currentPreviewDecision &&
            downloadFile(
              currentPreviewDecision,
              previewDocs.length ? previewDocs[previewIndex] : currentPreviewDoc || undefined
            )
          }
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Pobierz plik
        </Button>
      </div>
    </DialogContent>
  </Dialog>
    </div>
  </div>
  )
}
