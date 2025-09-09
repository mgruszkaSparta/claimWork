"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  FileText,
  X,
  Info,
  Loader2,
  Minus,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDragDrop } from "@/hooks/use-drag-drop"
import { DocumentPreview, type FileType } from "@/components/document-preview"
import {
  getAppeals,
  createAppeal,
  updateAppeal,
  deleteAppeal as apiDeleteAppeal,
  Appeal,
  AppealUpsert,
} from "@/lib/api/appeals"
import { API_BASE_URL, DocumentDto } from "@/lib/api"
import { deleteDocument } from "@/lib/api/documents"
import { authFetch } from "@/lib/auth-fetch"

interface AppealsSectionProps {
  claimId: string
}

export const AppealsSection = ({ claimId }: AppealsSectionProps) => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { dragState, handleDragOver, handleDragLeave, handleDrop, handlePaste } = useDragDrop()

  // State
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [currentAppeal, setCurrentAppeal] = useState<Appeal | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [showFileDescription, setShowFileDescription] = useState(false)
  const [previewAppeal, setPreviewAppeal] = useState<Appeal | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewFileType, setPreviewFileType] = useState<FileType>("other")
  const [previewFileName, setPreviewFileName] = useState("")
  const [previewDoc, setPreviewDoc] = useState<DocumentDto | null>(null)
  const [previewDocs, setPreviewDocs] = useState<DocumentDto[]>([])
  const [previewIndex, setPreviewIndex] = useState(0)

  // Preview for newly selected files
  const [isSelectedPreviewOpen, setIsSelectedPreviewOpen] = useState(false)
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0)
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(null)
  const [selectedPreviewType, setSelectedPreviewType] = useState<FileType>("other")

  // Form data
  const [formData, setFormData] = useState({
    filingDate: "",
    extensionDate: "",
    responseDate: "",
    status: "W toku",
    documentDescription: "",
  })

  // Load appeals on component mount
  useEffect(() => {
    loadAppeals()
  }, [claimId])

  // Handle paste events
  useEffect(() => {
    const handlePasteEvent = (event: ClipboardEvent) => {
      if (isFormVisible) {
        handlePaste(event, (files) => {
          if (files.length > 0) {
            processFiles(files)
          }
        })
      }
    }

    document.addEventListener("paste", handlePasteEvent)
    return () => document.removeEventListener("paste", handlePasteEvent)
  }, [isFormVisible, handlePaste])

  const loadAppeals = async () => {
    setIsLoading(true)
    try {
      const data = await getAppeals(claimId)
      setAppeals(data)
    } catch {
      toast({
        title: "Błąd",
        description: "Nie udało się załadować odwołań",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const processFiles = (files: File[]) => {
    if (!files || files.length === 0) return

    setSelectedFiles((prev) => [...prev, ...files])
    setShowFileDescription(true)

    toast({
      title: "Pliki dodane",
      description: `Dodano ${files.length} plik(ów)`,
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      processFiles(Array.from(files))
    }
  }

  const handleFilesDropped = (files: FileList) => {
    if (files.length > 0) {
      processFiles(Array.from(files))
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
  }

  const previewSelectedFile = (index: number) => {
    const file = selectedFiles[index]
    if (!file) return
    const url = URL.createObjectURL(file)
    setSelectedPreviewIndex(index)
    setSelectedPreviewUrl(url)
    setSelectedPreviewType(getFileType(file.name))
    setIsSelectedPreviewOpen(true)
  }

  const closeSelectedPreview = () => {
    setIsSelectedPreviewOpen(false)
    if (selectedPreviewUrl) {
      URL.revokeObjectURL(selectedPreviewUrl)
    }
    setSelectedPreviewUrl(null)
  }

  const showNextSelected = () => {
    const nextIndex = (selectedPreviewIndex + 1) % selectedFiles.length
    previewSelectedFile(nextIndex)
  }

  const showPrevSelected = () => {
    const prevIndex =
      (selectedPreviewIndex - 1 + selectedFiles.length) % selectedFiles.length
    previewSelectedFile(prevIndex)
  }

  const removeAllFiles = () => {
    setSelectedFiles([])
    setShowFileDescription(false)
    setFormData((prev) => ({ ...prev, documentDescription: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resetForm = () => {
    setFormData({
      filingDate: new Date().toISOString().split("T")[0],
      extensionDate: "",
      responseDate: "",
      status: "W toku",
      documentDescription: "",
    })
    setSelectedFiles([])
    setShowFileDescription(false)
    setIsEditing(false)
    setEditingId(null)
    setCurrentAppeal(null)
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

  const editAppeal = (appeal: Appeal) => {
    setIsFormVisible(true)
    setIsEditing(true)
    setEditingId(appeal.id)
    setCurrentAppeal(appeal)
    setFormData({
      filingDate: appeal.filingDate,
      extensionDate: appeal.extensionDate || "",
      responseDate: appeal.responseDate || "",
      status: appeal.status || "W toku",
      documentDescription: appeal.documentDescription || "",
    })
    setSelectedFiles([])
    setShowFileDescription(!!appeal.documents?.length)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.filingDate) {
      toast({
        title: "Błąd",
        description: "Data złożenia odwołania jest wymagana",
        variant: "destructive",
      })
      return
    }
    if (
      formData.extensionDate &&
      new Date(formData.extensionDate) < new Date(formData.filingDate)
    ) {
      toast({
        title: "Błąd",
        description: "Termin przedłużenia nie może być wcześniejszy niż data złożenia",
        variant: "destructive",
      })
      return
    }
    if (
      formData.responseDate &&
      new Date(formData.responseDate) < new Date(formData.filingDate)
    ) {
      toast({
        title: "Błąd",
        description: "Data odpowiedzi nie może być wcześniejsza niż data złożenia",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const status = formData.responseDate ? "Zamknięte" : formData.status
      const payload: AppealUpsert = {
        filingDate: formData.filingDate,
        extensionDate: formData.extensionDate || undefined,
        decisionDate: formData.responseDate || undefined,
        status,
        documentDescription: formData.documentDescription || undefined,
      }
      if (!isEditing) {
        payload.eventId = claimId
      }

      if (isEditing && editingId) {
        await updateAppeal(editingId, payload, selectedFiles)
        toast({
          title: "Sukces",
          description: "Odwołanie zostało zaktualizowane",
        })
      } else {
        await createAppeal(payload, selectedFiles)
        toast({
          title: "Sukces",
          description: "Odwołanie zostało dodane",
        })
      }

      // Reload appeals list
      await loadAppeals()
      cancelForm()
    } catch (error) {
      toast({
        title: "Błąd",
        description: isEditing ? "Nie udało się zaktualizować odwołania" : "Nie udało się dodać odwołania",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAppeal = async (id: string) => {
    setIsLoading(true)
    try {
      await apiDeleteAppeal(id)
      toast({
        title: "Sukces",
        description: "Odwołanie zostało usunięte",
      })
      await loadAppeals()
    } catch {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć odwołania",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getFileNameFromPath = (path: string): string => {
    return path.split("/").pop()?.split("?")[0] || "document"
  }

  const getFileType = (fileName: string): FileType => {
    if (!fileName) return "other"
    const ext = fileName.split(".").pop()?.toLowerCase()
    if (ext === "pdf") return "pdf"
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext || "")) return "image"
    if (ext === "xls" || ext === "xlsx") return "excel"
    if (ext === "doc" || ext === "docx") return "docx"
    if (ext === "kmz") return "kmz"
    return "other"
  }

  const downloadFile = async (appeal: Appeal, doc?: DocumentDto) => {
    try {
      const url = doc
        ? `${API_BASE_URL}/appeals/${appeal.id}/documents/${doc.id}/download`
        : `${API_BASE_URL}/appeals/${appeal.id}/download`
      const response = await authFetch(url, { method: "GET" })
      if (!response.ok) {
        throw new Error("Failed to download file")
      }
      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = objectUrl
      a.download =
        doc?.originalFileName || doc?.fileName || appeal.documentName || "document"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error("Error downloading file:", error)
      toast({
        title: "Błąd",
        description: "Błąd podczas pobierania pliku",
        variant: "destructive",
      })
    }
  }

  const loadPreview = async (appeal: Appeal, doc: DocumentDto) => {
    const url = `${API_BASE_URL}/appeals/${appeal.id}/documents/${doc.id}/preview`
    const response = await authFetch(url, { method: "GET" })
    if (!response.ok) throw new Error("Failed to preview file")
    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)
    const name = doc.originalFileName || doc.fileName || ""
    const fileType = getFileType(name)
    setPreviewFileName(name)
    setPreviewFileType(fileType)
    if (fileType === "excel") {
      setPreviewUrl(url)
      window.URL.revokeObjectURL(objectUrl)
    } else {
      setPreviewUrl(objectUrl)
    }
    setPreviewDoc(doc)
  }

  const previewFile = async (appeal: Appeal, doc?: DocumentDto) => {
    const docs = appeal.documents || []
    if (docs.length === 0) {
      const url = `${API_BASE_URL}/appeals/${appeal.id}/preview`
      try {
        const response = await authFetch(url, { method: "GET" })
        if (!response.ok) throw new Error("Failed to preview file")
        const blob = await response.blob()
        const objectUrl = window.URL.createObjectURL(blob)
        const name = appeal.documentName || ""
        const fileType = getFileType(name)
        setPreviewDocs([])
        setPreviewFileName(name)
        setPreviewFileType(fileType)
        if (fileType === "excel") {
          setPreviewUrl(url)
          window.URL.revokeObjectURL(objectUrl)
        } else {
          setPreviewUrl(objectUrl)
        }
        setPreviewAppeal(appeal)
        setPreviewDoc(null)
        setIsPreviewOpen(true)
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
    setPreviewAppeal(appeal)
    try {
      await loadPreview(appeal, docs[index])
      setIsPreviewOpen(true)
    } catch (error) {
      console.error("Error previewing file:", error)
      toast({ title: "Błąd", description: "Błąd podczas wczytywania podglądu", variant: "destructive" })
    }
  }

  const showNextDoc = async () => {
    if (!previewAppeal || previewDocs.length === 0) return
    const next = (previewIndex + 1) % previewDocs.length
    setPreviewIndex(next)
    try {
      await loadPreview(previewAppeal, previewDocs[next])
    } catch (error) {
      console.error("Error previewing file:", error)
    }
  }

  const showPrevDoc = async () => {
    if (!previewAppeal || previewDocs.length === 0) return
    const prev = (previewIndex - 1 + previewDocs.length) % previewDocs.length
    setPreviewIndex(prev)
    try {
      await loadPreview(previewAppeal, previewDocs[prev])
    } catch (error) {
      console.error("Error previewing file:", error)
    }
  }

  const closePreview = () => {
    setIsPreviewOpen(false)
    setPreviewAppeal(null)
    setPreviewDoc(null)
    setPreviewDocs([])
    if (previewUrl && previewUrl.startsWith("blob:")) {
      window.URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
  }

  const handleDeleteDocument = async (doc: DocumentDto) => {
    setIsLoading(true)
    try {
      await deleteDocument(doc.id)
      toast({ title: "Sukces", description: "Plik został usunięty" })
      await loadAppeals()
    } catch {
      toast({ title: "Błąd", description: "Nie udało się usunąć pliku", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const isPreviewable = (fileName?: string) => {
    if (!fileName) return false
    const fileType = getFileType(fileName)
    return ["pdf", "image", "excel", "docx", "kmz"].includes(fileType)
  }

  const getStatusBadge = (status: Appeal["status"]) => {
    return status === "W toku" ? (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        W toku
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        Zamknięte
      </Badge>
    )
  }

  const getAlertBadge = (alertDays?: number) => {
    if (!alertDays || alertDays < 30) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          Brak
        </Badge>
      )
    }

    if (alertDays >= 60) {
      return (
        <Badge variant="destructive">MONIT ({alertDays} dni)</Badge>
      )
    }

    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
        MONIT ({alertDays} dni)
      </Badge>
    )
  }

  const getTotalFileSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0)
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
        {/* Header Section */}
        <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-md mb-4 border border-[#d1d9e6]">
          <div className="text-[#1a3a6c]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#1a3a6c]">Odwołanie/Reklamacja</h2>
          </div>
        </div>

        {/* Add/Edit Appeal Form Toggle Button */}
        <div className="mb-4 flex justify-end">
          <Button
            onClick={toggleForm}
            className="bg-[#1a3a6c] text-white px-4 py-2 rounded hover:bg-[#15305a] transition-colors flex items-center gap-2"
          >
            {isFormVisible ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isFormVisible ? "Ukryj formularz" : "Dodaj nowe odwołanie"}
          </Button>
        </div>

      {/* Form Section */}
      {isFormVisible && (
        <div className="bg-white rounded-lg border border-[#d1d9e6] overflow-hidden mb-6 shadow-sm">
          <div className="p-4 bg-[#f8fafc] border-b border-[#d1d9e6]">
            <h3 className="text-sm font-semibold text-[#1a3a6c]">
              {isEditing ? "Edytuj odwołanie" : "Dodaj nowe odwołanie"}
            </h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Data złożenia odwołania *</Label>
                  <Input
                    type="date"
                    value={formData.filingDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, filingDate: e.target.value }))}
                    className="w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Data otrzymania informacji o przedłużeniu</Label>
                  <Input
                    type="date"
                    value={formData.extensionDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, extensionDate: e.target.value }))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Data otrzymania odpowiedzi</Label>
                  <Input
                    type="date"
                    value={formData.responseDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, responseDate: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Załącz dokument odwołania</Label>

                {isEditing &&
                selectedFiles.length === 0 &&
                (currentAppeal?.documents?.length || currentAppeal?.documentName) ? (
                  <div className="space-y-2 mb-4">
                    {currentAppeal?.documents?.length ? (
                      currentAppeal.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#1a3a6c]" />
                            <button
                              type="button"
                              onClick={() => previewFile(currentAppeal, doc)}
                              className="text-sm font-medium truncate max-w-60 text-blue-600 hover:underline text-left"
                              title={doc.originalFileName || doc.fileName}
                            >
                              {doc.originalFileName || doc.fileName}
                            </button>
                          </div>
                          <div className="flex gap-1">
                            {isPreviewable(doc.originalFileName || doc.fileName) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => previewFile(currentAppeal, doc)}
                                title="Podgląd"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadFile(currentAppeal, doc)}
                              title="Pobierz"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc)}
                              title="Usuń"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : currentAppeal?.documentName ? (
                      <div className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-[#1a3a6c]" />
                          <span
                            className="text-sm font-medium truncate max-w-60"
                            title={currentAppeal.documentName}
                          >
                            {currentAppeal.documentName}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {isPreviewable(currentAppeal.documentName) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => previewFile(currentAppeal)}
                              title="Podgląd"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadFile(currentAppeal)}
                            title="Pobierz"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : null}
                    {showFileDescription && (
                      <div className="p-3 bg-white rounded-b-lg border-x border-b">
                        <Label htmlFor="documentDescription" className="text-sm font-medium">
                          Opis dokumentu
                        </Label>
                        <Textarea
                          id="documentDescription"
                          value={formData.documentDescription}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, documentDescription: e.target.value }))
                          }
                          rows={2}
                          className="mt-0.5"
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 transition-all relative ${
                    dragState.isDragOver ? "border-[#1a3a6c] bg-[#1a3a6c]/5" : "border-gray-300"
                  }`}
                  onDragOver={(e) => handleDragOver(e.nativeEvent)}
                  onDragLeave={(e) => handleDragLeave(e.nativeEvent)}
                  onDrop={(e) => handleDrop(e.nativeEvent, handleFilesDropped)}
                >
                  {dragState.isOutlookDrag && (
                    <div className="absolute inset-0 bg-[#1a3a6c]/10 flex items-center justify-center rounded-lg">
                      <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                        <FileText className="h-10 w-10 mx-auto mb-2 text-[#1a3a6c]" />
                        <p className="text-[#1a3a6c] font-medium">Upuść załącznik z Outlooka tutaj</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <Upload className="h-10 w-10 text-gray-400" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Kliknij, aby wybrać plik</span> lub przeciągnij i upuść
                      </p>
                      <p className="text-xs text-gray-400">Obsługiwane formaty: PDF, DOC, DOCX, JPG, PNG</p>
                      <p className="text-xs text-gray-400">Możesz przesłać wiele plików</p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      multiple
                      onChange={handleFileSelect}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-transparent"
                    >
                      Wybierz plik
                    </Button>
                  </div>
                </div>

                {/* Selected File Display */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#1a3a6c]" />
                        <span className="text-sm font-medium">
                          Wybrane pliki ({selectedFiles.length}) - {formatFileSize(getTotalFileSize())}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeAllFiles}
                        className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="max-h-40 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={`selected-file-${index}`}
                          className="p-2 bg-white border-b last:border-b-0 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => previewSelectedFile(index)}
                              className="h-6 w-6 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSelectedFile(index)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {showFileDescription && (
                      <div className="p-4 bg-white space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Opis dokumentu</Label>
                          <Textarea
                            value={formData.documentDescription}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, documentDescription: e.target.value }))
                            }
                            placeholder="Dodaj opis dokumentu (np. 'Odwołanie od decyzji z dnia 10.05.2023', 'Pismo przewodnie', itp.)"
                            rows={2}
                            className="text-sm"
                          />
                          <p className="text-xs text-gray-500">
                            Opis pomoże w łatwiejszej identyfikacji dokumentu w przyszłości.
                          </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Outlook Integration Hint */}
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
                  <Info className="h-3 w-3 flex-shrink-0" />
                  <span>Możesz przeciągnąć załącznik bezpośrednio z Outlooka lub wkleić go ze schowka (Ctrl+V)</span>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={cancelForm} className="px-6 bg-transparent">
                  Anuluj
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.filingDate || isLoading}
                  className="bg-[#1a3a6c] hover:bg-[#15305a] text-white flex items-center gap-2 px-6"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEditing ? "Zapisz zmiany" : "Dodaj odwołanie"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appeals List */}
      {!isFormVisible && (
        <div className="bg-white rounded-lg border border-[#d1d9e6] overflow-hidden shadow-sm">
          <div className="p-4 bg-[#f8fafc] border-b border-[#d1d9e6]">
            <h3 className="text-sm font-semibold text-[#1a3a6c]">Lista odwołań</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-muted/50 text-[#1a3a6c] text-sm border-b">
                  <th className="py-3 px-4 text-left font-medium">Data złożenia</th>
                  <th className="py-3 px-4 text-left font-medium">Data przedłużenia</th>
                  <th className="py-3 px-4 text-left font-medium">Data odpowiedzi</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Dokumenty</th>
                  <th className="py-3 px-4 text-left font-medium">Opis</th>
                  <th className="py-3 px-4 text-left font-medium">Alerty</th>
                  <th className="py-3 px-4 text-center font-medium">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && appeals.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Ładowanie danych...
                      </div>
                    </td>
                  </tr>
                )}
                {!isLoading && appeals.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      <div className="space-y-2">
                        <Shield className="h-8 w-8 mx-auto text-gray-300" />
                        <p>Brak odwołań do wyświetlenia</p>
                      </div>
                    </td>
                  </tr>
                )}
                {appeals.map((appeal) => {
                  return (
                  <tr key={appeal.id} className="hover:bg-gray-50 text-sm border-b">
                    <td className="py-3 px-4 text-gray-700">
                      {new Date(appeal.filingDate).toLocaleDateString("pl-PL")}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {appeal.extensionDate ? new Date(appeal.extensionDate).toLocaleDateString("pl-PL") : "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {appeal.responseDate ? new Date(appeal.responseDate).toLocaleDateString("pl-PL") : "-"}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(appeal.status)}</td>
                    <td className="py-3 px-4">
                      {appeal.documents && appeal.documents.length > 0 ? (
                        <div className="space-y-1">
                          {(() => {
                            const doc = appeal.documents[0]
                            return (
                              <div key={doc.id} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => previewFile(appeal, doc)}
                                  className="text-gray-700 truncate max-w-32 text-blue-600 hover:underline text-left"
                                  title={doc.originalFileName || doc.fileName}
                                >
                                  {doc.originalFileName || doc.fileName}
                                </button>
                                <div className="flex gap-1">
                                  {isPreviewable(doc.originalFileName || doc.fileName) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => previewFile(appeal, doc)}
                                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                      title="Podgląd"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => downloadFile(appeal, doc)}
                                    className="h-6 w-6 p-0 text-green-600 hover:text-green-800 hover:bg-green-50"
                                    title="Pobierz"
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteDocument(doc)}
                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                                    title="Usuń"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )
                          })()}
                          {appeal.documents.length > 1 && (
                            <span className="text-xs text-gray-500">
                              +{appeal.documents.length - 1} więcej
                            </span>
                          )}
                        </div>
                      ) : appeal.documentName ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="text-gray-700 truncate max-w-32"
                            title={appeal.documentName}
                          >
                            {appeal.documentName}
                          </span>
                          <div className="flex gap-1">
                            {isPreviewable(appeal.documentName) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => previewFile(appeal)}
                                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                title="Podgląd"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadFile(appeal)}
                              className="h-6 w-6 p-0 text-green-600 hover:text-green-800 hover:bg-green-50"
                              title="Pobierz"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Brak dokumentu</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-700 max-w-48">
                      <span className="truncate block" title={appeal.documentDescription}>
                        {appeal.documentDescription || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getAlertBadge(appeal.alertDays)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editAppeal(appeal)}
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="Edytuj"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                              title="Usuń"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Czy na pewno chcesz usunąć to odwołanie?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Ta akcja nie może być cofnięta. Odwołanie zostanie trwale usunięte.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anuluj</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAppeal(appeal.id)}
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
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-muted/50 border-t flex justify-center">
            <div className="text-sm text-gray-600">
              Wyświetlanie {appeals.length > 0 ? `1-${appeals.length}` : "0"} z {appeals.length} odwołań
            </div>
          </div>
        </div>
      )}

      <DocumentPreview
        isOpen={isPreviewOpen}
        url={previewUrl || ""}
        fileName={previewFileName}
        fileType={previewFileType}
        onClose={closePreview}
        onDownload={() =>
          previewAppeal && downloadFile(previewAppeal, previewDoc || undefined)
        }
        canNavigate={previewDocs.length > 1}
        onNext={showNextDoc}
        onPrev={showPrevDoc}
      />

      {/* Selected Files Preview Dialog */}
      <Dialog
        open={isSelectedPreviewOpen}
        onOpenChange={(open) => {
          setIsSelectedPreviewOpen(open)
          if (!open) {
            closeSelectedPreview()
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Podgląd: {selectedFiles[selectedPreviewIndex]?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 rounded p-4 min-h-[400px]">
            {selectedPreviewType === "pdf" && selectedPreviewUrl ? (
              <iframe src={selectedPreviewUrl} className="w-full h-full border-0" title="PDF Preview" />
            ) : selectedPreviewType === "image" && selectedPreviewUrl ? (
              <img
                src={selectedPreviewUrl}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : (
              <div className="text-center p-8 space-y-4">
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                <p className="text-gray-600">Podgląd niedostępny dla tego typu pliku.</p>
              </div>
            )}
          </div>
          {selectedFiles.length > 1 && (
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={showPrevSelected}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Poprzedni
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={showNextSelected}
                className="flex items-center gap-1"
              >
                Następny
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  </div>
  )
}
