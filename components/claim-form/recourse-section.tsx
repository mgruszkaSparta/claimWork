"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useDragDrop } from "@/hooks/use-drag-drop"
import InsuranceDropdown from "@/components/insurance-dropdown"
import { InsuranceCompaniesService } from "@/lib/insurance-companies"
import {
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Plus,
  Trash2,
  Upload,
  X,
  AlertTriangle,
  Minus,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
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

import {
  getRecourses as fetchRecourses,
  createRecourse as createRecourseApi,
  updateRecourse as updateRecourseApi,
  deleteRecourse as deleteRecourseApi,
  type Recourse,
  type RecourseUpsert,
} from "@/lib/api/recourses"
import { API_BASE_URL } from "@/lib/api"
import type { DocumentDto } from "@/lib/api"

interface RecourseSectionProps {
  eventId: string
}

export function RecourseSection({ eventId }: RecourseSectionProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [recourses, setRecourses] = useState<Recourse[]>([])
  const [formLoading, setFormLoading] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingRecourseId, setEditingRecourseId] = useState<string | null>(null)
  const [currentRecourse, setCurrentRecourse] = useState<Recourse | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [showFileDescription, setShowFileDescription] = useState(false)
  const [totalRecourseAmounts, setTotalRecourseAmounts] = useState<Record<string, number>>({})

  // Form state
  const [formData, setFormData] = useState({
    isJustified: true,
    filingDate: new Date().toISOString().split("T")[0],
    insuranceCompany: "",
    insuranceCompanyId: "",
    obtainDate: "",
    amount: "",
    currency: "PLN",
    documentDescription: "",
  })

  // Preview state
  const [previewRecourse, setPreviewRecourse] = useState<Recourse | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [previewFileName, setPreviewFileName] = useState("")
  const [previewFileType, setPreviewFileType] = useState("")
  const [previewDoc, setPreviewDoc] = useState<DocumentDto | null>(null)
  const [previewDocs, setPreviewDocs] = useState<DocumentDto[]>([])
  const [previewIndex, setPreviewIndex] = useState(0)

  // Move this function before the useDragDrop hook
  function handleFilesDropped(files: FileList) {
    if (files.length > 0) {
      Array.from(files).forEach((file) => processOutlookAttachment(file))
    }
  }

  const { isDragOver, isOutlookDrag, dragDropProps } = useDragDrop({
    onFilesDropped: handleFilesDropped,
    onOutlookDropDetected: (isOutlook) => {
      // Handle Outlook drag detection if needed
    },
    acceptedTypes: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
  })

  const loadRecourses = useCallback(async () => {
    if (!eventId) return
    setListLoading(true)
    try {
      const data = await fetchRecourses(eventId)
      setRecourses(data)
      const totals: Record<string, number> = {}
      data.forEach((r) => {
        const currency = r.currencyCode || "PLN"
        if (r.amount) {
          totals[currency] = (totals[currency] || 0) + r.amount
        }
      })
      setTotalRecourseAmounts(totals)
    } catch (error) {
      console.error("Error loading recourses:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się załadować regresów",
        variant: "destructive",
      })
    } finally {
      setListLoading(false)
    }
  }, [eventId, toast])

  useEffect(() => {
    loadRecourses()
  }, [loadRecourses])


  const processOutlookAttachment = async (file: File) => {
    console.log("Processing potential Outlook attachment:", file.name)

    setFormLoading(true)
    try {
      // Process the file (in a real implementation, you might need special handling for Outlook files)
      setSelectedFiles((prev) => [...prev, file])
      setShowFileDescription(true)

      const isLikelyOutlook = isOutlookAttachment(file)

      if (isLikelyOutlook) {
        toast({
          title: "Załącznik z Outlooka dodany",
          description: `Plik "${file.name}" został dodany`,
        })
      } else {
        toast({
          title: "Plik dodany",
          description: `Plik "${file.name}" został dodany`,
        })
      }
    } catch (error) {
      console.error("Error processing attachment:", error)
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas przetwarzania załącznika",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const isOutlookAttachment = (file: File): boolean => {
    const name = file.name.toLowerCase()
    return (
      name.includes("outlook") ||
      name.includes("att") ||
      name.includes("winmail") ||
      name.includes("image") ||
      file.type.includes("application/octet-stream") ||
      file.type.includes("message")
    )
  }

  const resetForm = () => {
    setFormData({
      isJustified: true,
      filingDate: new Date().toISOString().split("T")[0],
      insuranceCompany: "",
      insuranceCompanyId: "",
      obtainDate: "",
      amount: "",
      currency: "PLN",
      documentDescription: "",
    })
    setSelectedFiles([])
    setShowFileDescription(false)
    setIsEditing(false)
    setEditingRecourseId(null)
    setCurrentRecourse(null)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setFormLoading(true)
    try {
      if (!formData.filingDate || !formData.insuranceCompany) {
        toast({
          title: "Błąd",
          description: "Data wniesienia regresu i nazwa towarzystwa są wymagane",
          variant: "destructive",
        })
        setFormLoading(false)
        return
      }

      const payload: RecourseUpsert = {
        eventId,
        isJustified: formData.isJustified,
        filingDate: formData.filingDate,
        insuranceCompany: formData.insuranceCompany,
        obtainDate: formData.obtainDate || undefined,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        currencyCode: formData.currency,
        documentDescription: formData.documentDescription || undefined,
      }

      const result = isEditing
        ? await updateRecourseApi(editingRecourseId!, payload, selectedFiles)
        : await createRecourseApi(payload, selectedFiles)

      console.log("Recourse saved successfully:", result)
      toast({
        title: "Sukces",
        description: isEditing ? "Regres został zaktualizowany" : "Regres został dodany",
      })
      resetForm()
      setIsFormVisible(false)
      await loadRecourses()
    } catch (error) {
      console.error("Error saving recourse:", error)
      toast({
        title: "Błąd",
        description: `Nie udało się zapisać regresu: ${error instanceof Error ? error.message : error}`,
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const editRecourse = (recourse: Recourse) => {
    setIsEditing(true)
    setEditingRecourseId(recourse.id)
    setIsFormVisible(true)
    setCurrentRecourse(recourse)

    // Format dates for input fields
    const formatDateForInput = (dateString?: string): string => {
      if (!dateString) return ""

      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.error("Invalid date provided:", dateString)
        return ""
      }

      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()

      const monthPadded = month.toString().padStart(2, "0")
      const dayPadded = day.toString().padStart(2, "0")

      return `${year}-${monthPadded}-${dayPadded}`
    }

    const company = InsuranceCompaniesService.getCompanies().find(
      (c) => c.name === recourse.insuranceCompany,
    )

    setFormData({
      isJustified: recourse.isJustified,
      filingDate: formatDateForInput(recourse.filingDate),
      insuranceCompany: recourse.insuranceCompany || "",
      insuranceCompanyId: company ? company.id.toString() : "",
      obtainDate: formatDateForInput(recourse.obtainDate),
      amount: recourse.amount?.toString() || "",
      currency: recourse.currencyCode || "PLN",
      documentDescription: recourse.documentDescription || "",
    })
    setSelectedFiles([])
    setShowFileDescription(!!recourse.documents?.length)

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const removeRecourse = async (recourseId: string) => {
    setListLoading(true)
    try {
      await deleteRecourseApi(recourseId)
      toast({
        title: "Sukces",
        description: "Regres został usunięty",
      })
      await loadRecourses()
    } catch (error) {
      console.error("Error deleting recourse:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć regresu",
        variant: "destructive",
      })
    } finally {
      setListLoading(false)
    }
  }

  const downloadFile = async (recourse: Recourse, doc?: DocumentDto) => {
    const fileName = doc?.originalFileName || doc?.fileName || recourse.documentName || "document"
    const url = doc
      ? `${API_BASE_URL}/recourses/${recourse.id}/documents/${doc.id}/download`
      : `${API_BASE_URL}/recourses/${recourse.id}/download`

    try {
      const response = await fetch(url, { method: "GET", credentials: "include" })
      if (!response.ok) throw new Error("Failed to download")
      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error("Error downloading file:", error)
      toast({ title: "Błąd", description: "Nie udało się pobrać pliku", variant: "destructive" })
    }
  }

  const loadPreview = async (recourse: Recourse, doc: DocumentDto) => {
    const url = `${API_BASE_URL}/recourses/${recourse.id}/documents/${doc.id}/preview`
    const response = await fetch(url, { method: "GET", credentials: "include" })
    if (!response.ok) throw new Error("Failed to preview")
    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)
    setPreviewUrl(objectUrl)
    const name = doc.originalFileName || doc.fileName || ""
    setPreviewFileName(name)
    setPreviewFileType(getFileType(name))
    setPreviewDoc(doc)
  }

  const previewFile = async (recourse: Recourse, doc?: DocumentDto) => {
    const docs = recourse.documents || []
    if (docs.length === 0) {
      // single file fallback
      const url = `${API_BASE_URL}/recourses/${recourse.id}/preview`
      try {
        const response = await fetch(url, { method: "GET", credentials: "include" })
        if (!response.ok) throw new Error("Failed to preview")
        const blob = await response.blob()
        const objectUrl = window.URL.createObjectURL(blob)
        const name = recourse.documentName || ""
        setPreviewDocs([])
        setPreviewUrl(objectUrl)
        setPreviewFileName(name)
        setPreviewFileType(getFileType(name))
        setPreviewRecourse(recourse)
        setPreviewDoc(null)
        setIsPreviewVisible(true)
      } catch (error) {
        console.error("Error previewing file:", error)
        toast({ title: "Błąd", description: "Nie udało się wczytać podglądu", variant: "destructive" })
      }
      return
    }

    const startIndex = doc ? docs.findIndex((d) => d.id === doc.id) : 0
    const index = startIndex >= 0 ? startIndex : 0
    setPreviewDocs(docs)
    setPreviewIndex(index)
    setPreviewRecourse(recourse)
    try {
      await loadPreview(recourse, docs[index])
      setIsPreviewVisible(true)
    } catch (error) {
      console.error("Error previewing file:", error)
      toast({ title: "Błąd", description: "Nie udało się wczytać podglądu", variant: "destructive" })
    }
  }

  const showNextDoc = async () => {
    if (!previewRecourse || previewDocs.length === 0) return
    const next = (previewIndex + 1) % previewDocs.length
    setPreviewIndex(next)
    try {
      await loadPreview(previewRecourse, previewDocs[next])
    } catch (error) {
      console.error("Error previewing file:", error)
    }
  }

  const showPrevDoc = async () => {
    if (!previewRecourse || previewDocs.length === 0) return
    const prev = (previewIndex - 1 + previewDocs.length) % previewDocs.length
    setPreviewIndex(prev)
    try {
      await loadPreview(previewRecourse, previewDocs[prev])
    } catch (error) {
      console.error("Error previewing file:", error)
    }
  }

  const closePreview = () => {
    setIsPreviewVisible(false)
    setPreviewUrl(null)
    setPreviewRecourse(null)
    setPreviewDoc(null)
    setPreviewDocs([])
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)])
      setShowFileDescription(true)
    }
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      if (updated.length === 0) {
        setShowFileDescription(false)
      }
      return updated
    })
    setFormData({ ...formData, documentDescription: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handlePaste = (e: ClipboardEvent) => {
    if (isFormVisible && e.clipboardData?.files && e.clipboardData.files.length > 0) {
      Array.from(e.clipboardData.files).forEach((file) => processOutlookAttachment(file))
    }
  }

  useEffect(() => {
    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [isFormVisible])

  const isPreviewable = (fileName?: string) => {
    if (!fileName) return false
    const ext = fileName.split(".").pop()?.toLowerCase()
    return ["pdf", "jpg", "jpeg", "png", "gif", "bmp"].includes(ext || "")
  }

  const getFileNameFromPath = (path: string): string => {
    return path.split("/").pop()?.split("?")[0] || "document"
  }

  const getFileType = (fileName: string): string => {
    if (!fileName) return "other"
    const ext = fileName.split(".").pop()?.toLowerCase()
    if (ext === "pdf") return "pdf"
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext || "")) return "image"
    return "other"
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#d1d9e6] overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-md mb-4 border border-[#d1d9e6]">
          <div className="text-[#1a3a6c]">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1a3a6c]">Regres</h2>
          </div>
        </div>

        {/* Add/Edit Recourse Form Toggle Button */}
        <div className="mb-4 flex justify-end">
          <Button
            onClick={toggleForm}
            className="bg-[#1a3a6c] text-white px-4 py-2 rounded hover:bg-[#15305a] transition-colors flex items-center gap-2"
          >
            {isFormVisible ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isFormVisible ? "Ukryj formularz" : "Dodaj nowy regres"}
          </Button>
        </div>

      {/* Add New Recourse Form */}
      {isFormVisible && (
        <div className="bg-white rounded-lg border border-[#d1d9e6] overflow-hidden mb-6 shadow-sm">
          <div className="p-4 bg-[#f8fafc] border-b border-[#d1d9e6]">
            <h3 className="text-md font-semibold text-[#1a3a6c]">
              {isEditing ? `Edytuj regres #${editingRecourseId}` : "Dodaj nowy regres"}
            </h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Czy regres zasadny</Label>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="recourseJustifiedYes"
                        name="isJustified"
                        checked={formData.isJustified === true}
                        onChange={() => setFormData({ ...formData, isJustified: true })}
                        className="w-4 h-4 text-[#1a3a6c] focus:ring-[#1a3a6c] border-gray-300"
                      />
                      <Label htmlFor="recourseJustifiedYes" className="ml-2 text-sm text-gray-700">
                        TAK
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="recourseJustifiedNo"
                        name="isJustified"
                        checked={formData.isJustified === false}
                        onChange={() => setFormData({ ...formData, isJustified: false })}
                        className="w-4 h-4 text-[#1a3a6c] focus:ring-[#1a3a6c] border-gray-300"
                      />
                      <Label htmlFor="recourseJustifiedNo" className="ml-2 text-sm text-gray-700">
                        NIE
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Data wniesienia regresu do Ubezpieczyciela *
                  </Label>
                  <Input
                    type="date"
                    value={formData.filingDate}
                    onChange={(e) => setFormData({ ...formData, filingDate: e.target.value })}
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2 relative z-10">
                  <Label className="text-sm font-medium text-gray-700">Nazwa towarzystwa ubezpieczeniowego *</Label>
                  <InsuranceDropdown
                    selectedCompanyId={
                      formData.insuranceCompanyId ? parseInt(formData.insuranceCompanyId) : undefined
                    }
                    onCompanySelected={(event) =>
                      setFormData({
                        ...formData,
                        insuranceCompany: event.companyName,
                        insuranceCompanyId: event.companyId.toString(),
                      })
                    }
                    className="relative z-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Data uzyskania regresu</Label>
                  <Input
                    type="date"
                    value={formData.obtainDate}
                    onChange={(e) => setFormData({ ...formData, obtainDate: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-gray-700">Kwota otrzymanego regresu</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="flex-1"
                      placeholder="0.00"
                    />
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
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
              </div>

              <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">Załącz dokument regresu</Label>

                {isEditing && selectedFiles.length === 0 && currentRecourse?.documents?.length ? (
                  <div className="space-y-2 mb-4">
                    {currentRecourse.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#1a3a6c]" />
                          <span className="text-sm font-medium">
                            {doc.originalFileName || doc.fileName}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {isPreviewable(doc.originalFileName || doc.fileName || "") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => previewFile(currentRecourse, doc)}
                              title="Podgląd"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadFile(currentRecourse, doc)}
                            title="Pobierz"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {showFileDescription && (
                      <div className="p-3 bg-white rounded-b-lg border-x border-b">
                        <Label htmlFor="documentDescription" className="text-sm font-medium">
                          Opis dokumentu
                        </Label>
                        <Textarea
                          id="documentDescription"
                          value={formData.documentDescription}
                          onChange={(e) =>
                            setFormData({ ...formData, documentDescription: e.target.value })
                          }
                          rows={2}
                          className="mt-0.5"
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Drop zone for drag and drop */}
                <div
                  {...dragDropProps}
                  className={`border-2 border-dashed rounded-lg p-6 transition-all relative ${
                    isDragOver ? "border-[#1a3a6c] bg-[#1a3a6c]/5" : "border-gray-300"
                  }`}
                >
                  {/* Outlook drag indicator */}
                  {isOutlookDrag && (
                    <div className="absolute inset-0 bg-[#1a3a6c]/10 flex items-center justify-center rounded-lg">
                      <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                        <Upload className="mx-auto mb-2 h-10 w-10 text-[#1a3a6c]" />
                        <p className="text-[#1a3a6c] font-medium">Upuść załącznik z Outlooka tutaj</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col items-center justify-center text-center">
                    <FileText className="mb-3 h-10 w-10 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Kliknij, aby wybrać plik</span> lub przeciągnij i upuść
                    </p>
                    <p className="text-xs text-gray-400">Obsługiwane formaty: PDF, DOC, DOCX, JPG, PNG</p>

                    <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    multiple
                  />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 bg-transparent"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Wybierz plik
                    </Button>
                  </div>
                </div>

                {/* Selected files display with description field */}
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="p-3 bg-muted rounded-t-lg border flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
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

                    {showFileDescription && (
                      <div className="p-3 bg-background rounded-b-lg border-x border-b">
                        <Label htmlFor="documentDescription" className="text-sm font-medium">
                          Opis dokumentu
                        </Label>
                        <Textarea
                          id="documentDescription"
                          value={formData.documentDescription}
                          onChange={(e) =>
                            setFormData({ ...formData, documentDescription: e.target.value })
                          }
                          placeholder="Dodaj opis dokumentu (np. 'Pismo w sprawie regresu', 'Potwierdzenie wpłaty', itp.)"
                          rows={2}
                          className="mt-0.5"
                        />
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Opis pomoże w łatwiejszej identyfikacji dokumentu w przyszłości.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Możesz przeciągnąć załącznik bezpośrednio z Outlooka lub wkleić go ze schowka (Ctrl+V)</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="text-sm font-medium text-blue-600">
                  {Object.keys(totalRecourseAmounts).length > 0 ? (
                    <div>
                      Łączna kwota regresów:
                      <ul className="list-none ml-2 mt-0.5">
                        {Object.entries(totalRecourseAmounts).map(([currency, amount]) => (
                          <li key={currency} className="font-bold">
                            {formatCurrency(amount, currency)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <span>
                      Łączna kwota regresów: <span className="font-bold">0.00 PLN</span>
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={cancelForm} className="px-6 bg-transparent">
                    Anuluj
                  </Button>
                  <Button type="submit" disabled={formLoading} className="flex items-center gap-2 px-6">
                    {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isEditing ? "Zapisz zmiany" : "Dodaj regres"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recourse List */}
      {!isFormVisible && (
        <div className="bg-white rounded-lg border border-[#d1d9e6] overflow-hidden shadow-sm">
          <div className="p-4 bg-[#f8fafc] border-b border-[#d1d9e6] flex flex-row items-center justify-between">
            <h3 className="text-md font-semibold text-[#1a3a6c]">Lista regresów</h3>
            <div className="text-sm text-gray-500">
              {Object.keys(totalRecourseAmounts).length > 0 ? (
                <div>
                  Łączne kwoty regresów:{" "}
                  {Object.entries(totalRecourseAmounts).map(([currency, amount], index) => (
                    <span key={currency}>
                      <span className="font-bold text-primary">{formatCurrency(amount, currency)}</span>
                      {index < Object.entries(totalRecourseAmounts).length - 1 ? "; " : ""}
                    </span>
                  ))}
                </div>
              ) : (
                <span>
                  Łączna kwota regresów: <span className="font-bold text-primary">0.00 PLN</span>
                </span>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Zasadny</th>
                  <th className="py-3 px-4 text-left font-medium">Data wniesienia</th>
                  <th className="py-3 px-4 text-left font-medium">Towarzystwo</th>
                  <th className="py-3 px-4 text-left font-medium">Data uzyskania</th>
                  <th className="py-3 px-4 text-left font-medium">Kwota</th>
                  <th className="py-3 px-4 text-left font-medium">Waluta</th>
                  <th className="py-3 px-4 text-left font-medium">Dokument</th>
                  <th className="py-3 px-4 text-center font-medium">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {listLoading && recourses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Ładowanie danych...
                      </div>
                    </td>
                  </tr>
                )}
                {!listLoading && recourses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      <div className="space-y-2">
                        <DollarSign className="h-8 w-8 mx-auto text-gray-300" />
                        <p>Brak regresów do wyświetlenia</p>
                      </div>
                    </td>
                  </tr>
                )}
                {recourses.map((recourse) => (
                  <tr key={recourse.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <Badge
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          recourse.isJustified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {recourse.isJustified ? "TAK" : "NIE"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {recourse.filingDate ? new Date(recourse.filingDate).toLocaleDateString("pl-PL") : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">{recourse.insuranceCompany}</td>
                    <td className="py-3 px-4 text-sm">
                      {recourse.obtainDate ? new Date(recourse.obtainDate).toLocaleDateString("pl-PL") : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {recourse.amount
                        ? formatCurrency(recourse.amount, recourse.currencyCode || "PLN")
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">{recourse.currencyCode || "PLN"}</td>
                    <td className="py-3 px-4">
                      {(() => {
                        const count = recourse.documents?.length || (recourse.documentPath ? 1 : 0)
                        if (count === 0) {
                          return <span className="text-sm text-muted-foreground">Brak dokumentu</span>
                        }
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Załączniki ({count})</span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => previewFile(recourse)}
                                title="Podgląd"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadFile(recourse)}
                                title="Pobierz"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )
                      })()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => editRecourse(recourse)} title="Edytuj">
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
                              <AlertDialogTitle>Czy na pewno chcesz usunąć ten regres?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ta akcja nie może być cofnięta. Regres zostanie trwale usunięty.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anuluj</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => removeRecourse(recourse.id)}
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
                Wyświetlanie {recourses.length > 0 ? `1-${recourses.length}` : "0"} z {recourses.length} regresów
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
                previewRecourse &&
                downloadFile(
                  previewRecourse,
                  previewDocs.length ? previewDocs[previewIndex] : previewDoc || undefined
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
