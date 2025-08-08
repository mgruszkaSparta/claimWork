"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { File, Search, Filter, Eye, Download, Upload, X, Trash2, Grid, List, Wand, Plus, FileText, Paperclip, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCw, Maximize2, Minimize2 } from 'lucide-react'
import type { DocumentsSectionProps, UploadedFile } from "@/types"

interface Document {
  id: string
  eventId?: string
  damageId?: string
  fileName: string
  originalFileName: string
  contentType: string
  fileSize: number
  filePath: string
  description?: string
  status: string
  uploadedBy: string
  createdAt: string
  updatedAt: string
  canPreview: boolean
  previewUrl?: string
  downloadUrl: string
  documentType: string
}

export const DocumentsSection = ({
  uploadedFiles,
  setUploadedFiles,
  requiredDocuments,
  setRequiredDocuments,
  eventId,
  pendingFiles = [],
  setPendingFiles,
  hideRequiredDocuments = false,
}: DocumentsSectionProps & { hideRequiredDocuments?: boolean }) => {
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ "Inne dokumenty": true })
  const [uploadingForCategory, setUploadingForCategory] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [groupPreviewOpen, setGroupPreviewOpen] = useState(false)
  const [groupPreviewCategory, setGroupPreviewCategory] = useState<string>("")
  const [dragActive, setDragActive] = useState(false)
  const [dragCategory, setDragCategory] = useState<string | null>(null)

  // Preview modal states
  const [previewZoom, setPreviewZoom] = useState(1)
  const [previewRotation, setPreviewRotation] = useState(0)
  const [previewFullscreen, setPreviewFullscreen] = useState(false)
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [previewDocuments, setPreviewDocuments] = useState<Document[]>([])


  const uploadedFileToDocument = (file: UploadedFile): Document => ({
    id: file.id,
    fileName: file.name,
    originalFileName: file.name,
    contentType: file.file?.type || "",
    fileSize: file.size,
    filePath: file.url,
    description: file.description,
    status: "pending",
    uploadedBy: "Current User",
    createdAt: file.uploadedAt,
    updatedAt: file.uploadedAt,
    canPreview: file.type === "image" || file.type === "pdf",
    previewUrl: file.url,
    downloadUrl: file.url,
    documentType: file.category || "Inne dokumenty",
  })

  const allDocuments = React.useMemo(
    () => [...documents, ...pendingFiles.map(uploadedFileToDocument)],
    [documents, pendingFiles]
  )


  // Load documents from API
  useEffect(() => {
    if (eventId) {
      loadDocuments()
    }
  }, [eventId])

  const loadDocuments = async () => {
    if (!eventId) return

    setLoading(true)
    try {
      console.log("Loading documents for eventId:", eventId)
      const response = await fetch(`/api/documents/event/${encodeURIComponent(eventId)}`)

      if (response.ok) {
        const data = await response.json()
        console.log("Loaded documents:", data)
        setDocuments(data)
      } else {
        let errorMessage = "Nie udało się załadować dokumentów"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }

        console.error("Failed to load documents:", errorMessage)
        toast({
          title: "Błąd",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading documents:", error)
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas ładowania dokumentów",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const documentCategories = React.useMemo(() => {
    const categoriesFromRequired = requiredDocuments.filter((d) => d.uploaded).map((d) => d.name)
    const categoriesFromDocuments = [...new Set(allDocuments.map((d) => d.documentType))]
    return [...new Set(["Inne dokumenty", ...categoriesFromRequired, ...categoriesFromDocuments])]
  }, [requiredDocuments, allDocuments])

  const handleFileUpload = async (files: FileList | null, category: string | null) => {

    if (!files || !category) {

      console.error("Missing required parameters:", { files: !!files, category })
      toast({
        title: "Błąd",
        description: "Brak wymaganych parametrów do przesłania pliku",
        variant: "destructive",
      })
      return
    }

    // Handle temporary uploads when eventId is not provided
    if (!eventId) {
      const newFiles: UploadedFile[] = []
      Array.from(files).forEach((file, index) => {
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "Plik za duży",
            description: `Plik "${file.name}" jest za duży. Maksymalny rozmiar to 50MB.`,
            variant: "destructive",
          })
          return
        }
        if (file.size === 0) {
          toast({
            title: "Pusty plik",
            description: `Plik "${file.name}" jest pusty.`,
            variant: "destructive",
          })
          return
        }
        newFiles.push({
          id: `temp-${Date.now()}-${index}`,
          name: file.name,
          size: file.size,
          type: file.type.includes("image")
            ? "image"
            : file.type.includes("pdf")
            ? "pdf"
            : file.type.includes("msword") || file.type.includes("wordprocessingml")
            ? "doc"
            : "other",
          uploadedAt: new Date().toISOString(),
          url: URL.createObjectURL(file),
          category: category || "Inne dokumenty",
          file: file,
        })
      })

      if (newFiles.length > 0) {
        setPendingFiles?.((prev) => [...prev, ...newFiles])
        toast({
          title: "Dodano pliki",
          description: `Dodano ${newFiles.length} plik(ów) do kategorii "${category}".`,
        })
      }
      return
    }

    console.log("Starting file upload:", { fileCount: files.length, category, eventId })
    setUploading(true)

    const uploadPromises = Array.from(files).map(async (file, index) => {
      console.log(`Uploading file ${index + 1}/${files.length}:`, {
        name: file.name,
        type: file.type,
        size: file.size,
      })

      // Client-side validation
      if (file.size > 50 * 1024 * 1024) {
        console.error(`File ${file.name} is too large:`, file.size)
        toast({
          title: "Plik za duży",
          description: `Plik "${file.name}" jest za duży. Maksymalny rozmiar to 50MB.`,
          variant: "destructive",
        })
        return null
      }

      if (file.size === 0) {
        console.error(`File ${file.name} is empty`)
        toast({
          title: "Pusty plik",
          description: `Plik "${file.name}" jest pusty.`,
          variant: "destructive",
        })
        return null
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.append("eventId", eventId.toString())
      formData.append("documentType", category)
      formData.append("uploadedBy", "Current User")

      try {
        console.log(`Making upload request for ${file.name}...`)
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        })

        console.log(`Upload response for ${file.name}:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          contentType: response.headers.get("content-type"),
        })

        if (response.ok) {
          const document = await response.json()
          console.log(`File uploaded successfully:`, document)
          return document
        } else {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
            if (errorData.details) {
              errorMessage += ` - ${errorData.details}`
            }
            console.error(`Upload failed for ${file.name}:`, errorData)
          } catch (jsonError) {
            console.error(`Upload failed for ${file.name} with non-JSON error response`)
            const errorText = await response.text()
            console.error(`Error response text:`, errorText.substring(0, 500))
          }
          throw new Error(errorMessage)
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)

        let errorMessage = `Nie udało się przesłać pliku: ${file.name}`
        if (error instanceof Error) {
          errorMessage += ` - ${error.message}`
        }

        toast({
          title: "Błąd przesyłania",
          description: errorMessage,
          variant: "destructive",
        })
        return null
      }
    })

    try {
      const uploadedDocuments = await Promise.all(uploadPromises)
      const successfulUploads = uploadedDocuments.filter(
        (doc): doc is Document => doc !== null,
      )
      const successfulUploadsWithIds = successfulUploads.map((doc) => ({
        ...doc,
        id: doc.id?.toString() ?? crypto.randomUUID(),
      }))

      if (successfulUploadsWithIds.length > 0) {
        setDocuments((prev) => [...prev, ...successfulUploadsWithIds])
        setUploadedFiles((prev) => [
          ...prev,
          ...successfulUploadsWithIds.map((doc) => ({
            id: doc.id,
            name: doc.originalFileName || doc.fileName,
            size: doc.fileSize,
            type: doc.contentType.includes("image")
              ? "image"
              : doc.contentType.includes("pdf")
              ? "pdf"
              : doc.contentType.includes("msword") || doc.contentType.includes("wordprocessingml")
              ? "doc"
              : "other",
            uploadedAt: doc.createdAt,
            url: doc.filePath,
            category: doc.documentType,
            description: doc.description,
          })),
        ])
        toast({
          title: "Przesłano pliki",
          description: `Pomyślnie dodano ${successfulUploadsWithIds.length} plik(ów) do kategorii "${category}".`,
        })
        console.log("All successful uploads:", successfulUploadsWithIds)
      }

      const failedUploads = files.length - successfulUploadsWithIds.length
      if (failedUploads > 0) {
        toast({
          title: "Częściowy błąd",
          description: `${failedUploads} plik(ów) nie zostało przesłanych`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error in upload process:", error)
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas przesyłania plików",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const triggerUpload = (category: string) => {
    console.log("Triggering upload for category:", category)
    setUploadingForCategory(category)
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed:", e.target.files?.length, "files selected")
    const files = e.target.files
    if (!files || files.length === 0) {
      setUploadingForCategory(null)
      if (e.target) e.target.value = ""
      return
    }
    if (!uploadingForCategory) {
      toast({
        title: "Błąd",
        description: "Brak kategorii.",
        variant: "destructive",
      })
      setUploadingForCategory(null)
      if (e.target) e.target.value = ""
      return
    }
    handleFileUpload(files, uploadingForCategory)
    setUploadingForCategory(null)
    if (e.target) e.target.value = ""
  }

  const handleFileDelete = async (documentId: string | number) => {

    const isPending = pendingFiles.some((f) => f.id === documentId)
    if (isPending) {
      if (!window.confirm("Czy na pewno chcesz usunąć ten dokument?")) return
      setPendingFiles?.((prev) => prev.filter((f) => f.id !== documentId))
      toast({
        title: "Plik usunięty",
        description: "Dokument został pomyślnie usunięty.",
      })
      return
    }


    if (!window.confirm("Czy na pewno chcesz usunąć ten dokument?")) {
      return
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
        toast({
          title: "Plik usunięty",
          description: "Dokument został pomyślnie usunięty.",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete document")
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć dokumentu",
        variant: "destructive",
      })
    }
  }

  const handleDescriptionChange = async (documentId: string | number, description: string) => {

    const pendingIndex = pendingFiles.findIndex((f) => f.id === documentId)
    if (pendingIndex !== -1) {
      setPendingFiles?.((prev) => prev.map((f) => (f.id === documentId ? { ...f, description } : f)))
      return
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      })

      if (response.ok) {
        const updatedDocument = await response.json()
        setDocuments((prev) => prev.map((doc) => (doc.id === documentId ? updatedDocument : doc)))
      }
    } catch (error) {
      console.error("Error updating document description:", error)
    }
  }

  const handleGenerateAIDescription = async (documentId: string | number) => {
    const document = allDocuments.find((d) => d.id === documentId)
    if (!document || document.status === "pending") return

    try {
      toast({
        title: "Generowanie opisu AI",
        description: `Rozpoczęto generowanie opisu dla pliku: ${document.originalFileName}`,
      })

      const response = await fetch(`/api/documents/${documentId}/generate-description`, {
        method: "POST",
      })

      if (response.ok) {
        const updatedDocument = await response.json()
        setDocuments((prev) => prev.map((doc) => (doc.id === documentId ? updatedDocument : doc)))
        toast({
          title: "Sukces",
          description: `Wygenerowano opis dla pliku: ${document.originalFileName}`,
        })
      } else {
        throw new Error("Failed to generate AI description")
      }
    } catch (error) {
      console.error("Error generating AI description:", error)
      toast({
        title: "Błąd",
        description: "Nie udało się wygenerować opisu AI",
        variant: "destructive",
      })
    }
  }

  const handlePreview = (document: Document, documentsArray?: Document[]) => {

    const docsToPreview = documentsArray || allDocuments

    const index = docsToPreview.findIndex((d) => d.id === document.id)

    setPreviewDocuments(docsToPreview)
    setCurrentPreviewIndex(index)
    setPreviewDocument(document)
    setPreviewZoom(1)
    setPreviewRotation(0)
    setPreviewFullscreen(false)
  }

  const handleDownload = (document: Document) => {
    const link = window.document.createElement("a")
    link.href = document.downloadUrl
    link.download = document.originalFileName
    link.target = "_blank"
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  const handleDownloadAll = async (category: string) => {
    const documentsForCategory = allDocuments.filter((d) => d.documentType === category)

    if (documentsForCategory.length === 0) {
      toast({
        title: "Brak plików",
        description: "Nie ma plików do pobrania w tej kategorii.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Pobieranie plików",
      description: `Rozpoczęto pobieranie ${documentsForCategory.length} plik(ów) z kategorii "${category}".`,
    })

    documentsForCategory.forEach((document, index) => {
      setTimeout(() => {
        handleDownload(document)
      }, index * 500)
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setDragCategory(null)

    console.log("Files dropped:", e.dataTransfer.files.length, "files for category:", category)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files, category)
    }
  }

  const handleAddRequiredCategory = (docName: string) => {
    setRequiredDocuments((prev) => prev.map((doc) => (doc.name === docName ? { ...doc, uploaded: true } : doc)))
    setOpenCategories((prev) => ({ ...prev, [docName]: true }))
    toast({
      title: "Dodano kategorię",
      description: `Kategoria "${docName}" jest gotowa do dodania plików.`,
    })
  }

  // Preview navigation functions
  const goToPreviousDocument = () => {
    if (currentPreviewIndex > 0) {
      const newIndex = currentPreviewIndex - 1
      setCurrentPreviewIndex(newIndex)
      setPreviewDocument(previewDocuments[newIndex])
      setPreviewZoom(1)
      setPreviewRotation(0)
    }
  }

  const goToNextDocument = () => {
    if (currentPreviewIndex < previewDocuments.length - 1) {
      const newIndex = currentPreviewIndex + 1
      setCurrentPreviewIndex(newIndex)
      setPreviewDocument(previewDocuments[newIndex])
      setPreviewZoom(1)
      setPreviewRotation(0)
    }
  }

  const handleZoomIn = () => {
    setPreviewZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setPreviewZoom((prev) => Math.max(prev - 0.25, 0.25))
  }

  const handleRotate = () => {
    setPreviewRotation((prev) => (prev + 90) % 360)
  }

  const toggleFullscreen = () => {
    setPreviewFullscreen((prev) => !prev)
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  }

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith("image/")) {
      return <File className="h-5 w-5 text-blue-500" />
    } else if (contentType === "application/pdf") {
      return <File className="h-5 w-5 text-red-500" />
    } else if (contentType.includes("document") || contentType.includes("word")) {
      return <File className="h-5 w-5 text-blue-700" />
    } else if (contentType.startsWith("video/")) {
      return <File className="h-5 w-5 text-purple-500" />
    } else {
      return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const FileCard = ({ document, onDelete }: { document: Document; onDelete: (id: string | number) => void }) => (
    <Card className="overflow-hidden group relative">
      <div className="aspect-w-16 aspect-h-10 bg-gray-100 flex items-center justify-center min-h-[150px]">
        {document.contentType.startsWith("image/") ? (
          <img
            src={document.previewUrl || "/placeholder.svg?height=150&width=200"}
            alt={document.originalFileName}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => handlePreview(document)}
          />
        ) : document.contentType.startsWith("video/") ? (
          <video
            src={document.previewUrl || document.downloadUrl}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => handlePreview(document)}
            muted
            preload="metadata"
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-xs text-gray-500 text-center px-2">
              {document.contentType === "application/pdf"
                ? "PDF"
                : document.contentType.includes("document")
                  ? "DOC"
                  : document.contentType.startsWith("video/")
                    ? "VIDEO"
                    : "FILE"}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-800 truncate" title={document.originalFileName}>
          {document.originalFileName}
        </p>
        <p className="text-xs text-gray-500">{new Date(document.createdAt).toLocaleDateString()}</p>
        <p className="text-xs text-gray-400">{formatBytes(document.fileSize)}</p>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(document.id)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )

  const missingRequiredDocs = requiredDocuments.filter((doc) => !doc.uploaded)

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie dokumentów...</p>
        </div>
      </div>
    )
  }

  return (
    <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag}>
      <div className="space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*,application/pdf,video/*,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
          onChange={handleFileInputChange}
        />

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Wyszukaj dokumenty (nazwa typu, nazwa pliku, opis)..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtry
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Szybkie filtry:</span>
              <Badge variant="secondary" className="cursor-pointer bg-blue-100 text-blue-800">
                Wymagane
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Z plikami
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Puste
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Ostatnie
              </Badge>
            </div>
          </CardContent>
        </Card>

        {documentCategories.map((category) => {
          const documentsForCategory = allDocuments.filter((d) => d.documentType === category)
          const isCategoryOpen = openCategories[category] ?? false

          return (
            <Card key={category}>
              <CardHeader
                className="flex flex-row items-center justify-between p-4 cursor-pointer"
                onClick={() => setOpenCategories((prev) => ({ ...prev, [category]: !isCategoryOpen }))}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{category}</h3>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {documentsForCategory.length}
                  </Badge>
                  {category !== "Inne dokumenty" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm(`Czy na pewno chcesz usunąć kategorię "${category}"?`)) {
                          toast({
                            title: "Kategoria usunięta",
                            description: `Kategoria "${category}" została usunięta.`,
                            variant: "destructive",
                          })
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setGroupPreviewCategory(category)
                      setGroupPreviewOpen(true)
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Grupowy podgląd
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownloadAll(category)
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Pobierz wszystko
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      triggerUpload(category)
                    }}
                    disabled={uploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "PRZESYŁANIE..." : "UPLOAD"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 data-[state=open]:rotate-180 transition-transform"
                    data-state={isCategoryOpen ? "open" : "closed"}
                  >
                    <X className="h-4 w-4 transform rotate-45" />
                  </Button>
                </div>
              </CardHeader>
              {isCategoryOpen && (
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Wyszukaj w plikach (nazwa, opis, typ, rozmiar, id)..." className="pl-10" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Szybkie filtry:</span>
                      <Badge variant="secondary" className="cursor-pointer">
                        PDF
                      </Badge>
                      <Badge variant="secondary" className="cursor-pointer">
                        Obrazy
                      </Badge>
                      <Badge variant="secondary" className="cursor-pointer">
                        Dokumenty
                      </Badge>
                      <div className="flex items-center rounded-md border bg-muted">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewMode("list")}
                          className={`h-8 w-8 ${viewMode === "list" ? "bg-background shadow-sm" : ""}`}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewMode("grid")}
                          className={`h-8 w-8 ${viewMode === "grid" ? "bg-background shadow-sm" : ""}`}
                        >
                          <Grid className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {viewMode === "list" ? (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-3 text-left font-medium text-gray-600 w-2/6">Nazwa pliku</th>
                            <th className="p-3 text-left font-medium text-gray-600 w-2/6">Opis pliku</th>
                            <th className="p-3 text-left font-medium text-gray-600 w-1/6">Rozmiar</th>
                            <th className="p-3 text-left font-medium text-gray-600 w-1/6">Data dodania</th>
                            <th className="p-3 text-left font-medium text-gray-600 w-1/6">Akcja</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documentsForCategory.map((document, index) => (
                            <tr
                              key={document.id}
                              className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                            >
                              <td className="p-3 font-medium flex items-center gap-2">
                                {getFileIcon(document.contentType)}
                                <span className="truncate">{document.originalFileName}</span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleGenerateAIDescription(document.id)}
                                  >
                                    <Wand className="h-4 w-4 text-purple-500" />
                                  </Button>
                                  <Input
                                    value={document.description || ""}
                                    onChange={(e) => handleDescriptionChange(document.id, e.target.value)}
                                    className="text-sm h-8"
                                    placeholder="Wprowadź opis pliku..."
                                  />
                                </div>
                              </td>
                              <td className="p-3 text-gray-600">{formatBytes(document.fileSize)}</td>
                              <td className="p-3 text-gray-600">{new Date(document.createdAt).toLocaleDateString()}</td>
                              <td className="p-3">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleDownload(document)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handlePreview(document, documentsForCategory)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-600"
                                    onClick={() => handleFileDelete(document.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {documentsForCategory.length === 0 && (
                        <div
                          className={`flex flex-col items-center justify-center text-center py-12 text-gray-500 border-2 border-dashed rounded-lg cursor-pointer transition-colors m-4 ${
                            dragActive && dragCategory === category
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => triggerUpload(category)}
                          onDragEnter={(e) => {
                            handleDrag(e)
                            setDragCategory(category)
                          }}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={(e) => handleDrop(e, category)}
                        >
                          <Upload className="h-8 w-8 mb-2 text-gray-400" />
                          <p className="font-semibold">Brak plików</p>
                          <p className="text-sm">Kliknij lub przeciągnij pliki tutaj, aby je dodać.</p>
                        </div>
                      )}
                    </div>
                  ) : documentsForCategory.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {documentsForCategory.map((document) => (
                        <FileCard
                          key={document.id}
                          document={document}
                          onDelete={handleFileDelete}
                        />
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`flex flex-col items-center justify-center text-center py-12 text-gray-500 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        dragActive && dragCategory === category
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => triggerUpload(category)}
                      onDragEnter={(e) => {
                        handleDrag(e)
                        setDragCategory(category)
                      }}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={(e) => handleDrop(e, category)}
                    >
                      <Upload className="h-8 w-8 mb-2 text-gray-400" />
                      <p className="font-semibold">Brak plików</p>
                      <p className="text-sm">Kliknij lub przeciągnij pliki tutaj, aby je dodać.</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}

        {/* Lista wymaganych dokumentów */}
        {!hideRequiredDocuments && missingRequiredDocs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Wymagane dokumenty</CardTitle>
              <p className="text-sm text-gray-500">Dodaj kategorię, aby móc załączyć odpowiednie pliki.</p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                {missingRequiredDocs.map((doc, index, arr) => (
                  <div
                    key={`required-${doc.id ?? doc.name}`}
                    className={`flex items-center justify-between p-4 ${index < arr.length - 1 ? "border-b" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-800">{doc.name}</span>
                      <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Brakujący"></div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleAddRequiredCategory(doc.name)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Dodaj
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Group Preview Modal */}
        {groupPreviewOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-auto w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Grupowy podgląd - {groupPreviewCategory}</h3>
                <Button variant="ghost" onClick={() => setGroupPreviewOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allDocuments
                  .filter((d) => d.documentType === groupPreviewCategory)
                  .map((document) => (
                    <Card key={document.id} className="overflow-hidden">
                      <div className="aspect-w-16 aspect-h-12 bg-gray-100 flex items-center justify-center min-h-[200px]">
                        {document.contentType.startsWith("image/") ? (
                          <img
                            src={document.previewUrl || "/placeholder.svg?height=200&width=300"}
                            alt={document.originalFileName}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => {
                              setGroupPreviewOpen(false)
                              handlePreview(
                                document,
                                allDocuments.filter((d) => d.documentType === groupPreviewCategory),
                              )
                            }}
                          />
                        ) : document.contentType.startsWith("video/") ? (
                          <video
                            src={document.previewUrl || document.downloadUrl}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => {
                              setGroupPreviewOpen(false)
                              handlePreview(
                                document,
                                allDocuments.filter((d) => d.documentType === groupPreviewCategory),
                              )
                            }}
                            muted
                            preload="metadata"
                          />
                        ) : document.contentType === "application/pdf" ? (
                          <div className="flex flex-col items-center justify-center text-center p-4">
                            <FileText className="w-16 h-16 text-red-500 mb-2" />
                            <p className="text-sm font-medium text-gray-700 mb-2">PDF Document</p>
                            <Button
                              size="sm"
                              onClick={() => {
                                setGroupPreviewOpen(false)
                                handlePreview(
                                  document,
                                  allDocuments.filter((d) => d.documentType === groupPreviewCategory),
                                )
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Podgląd
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-4">
                            <FileText className="w-16 h-16 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700">
                              {document.contentType.includes("document") || document.contentType.includes("word")
                                ? "Dokument Word"
                                : document.contentType.startsWith("video/")
                                  ? "Plik wideo"
                                  : "Plik"}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h4
                          className="font-medium text-sm text-gray-800 truncate mb-2"
                          title={document.originalFileName}
                        >
                          {document.originalFileName}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>{formatBytes(document.fileSize)}</span>
                          <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                        </div>

                        {document.description && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{document.description}</p>
                        )}

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => handleDownload(document)}
                          >
                            <Download className="mr-1 h-3 w-3" />
                            Pobierz
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => {
                              setGroupPreviewOpen(false)
                              handlePreview(
                                document,
                                allDocuments.filter((d) => d.documentType === groupPreviewCategory),
                              )
                            }}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Podgląd
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>

              {allDocuments.filter((d) => d.documentType === groupPreviewCategory).length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Brak plików w tej kategorii</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Preview Modal */}
        {previewDocument && (
          <div
            className={`fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 ${previewFullscreen ? "p-0" : "p-4"}`}
          >
            <div
              className={`bg-white rounded-lg overflow-hidden ${previewFullscreen ? "w-full h-full" : "max-w-6xl max-h-[95vh] w-full"}`}
            >
              {/* Header with controls */}
              <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold truncate max-w-md">{previewDocument.originalFileName}</h3>
                  <Badge variant="secondary">{previewDocument.documentType}</Badge>
                  <div className="text-sm text-gray-500">
                    {currentPreviewIndex + 1} z {previewDocuments.length}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Navigation buttons */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousDocument}
                    disabled={currentPreviewIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Poprzedni
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextDocument}
                    disabled={currentPreviewIndex === previewDocuments.length - 1}
                  >
                    Następny
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  {/* Zoom controls for images */}
                  {previewDocument.contentType.startsWith("image/") && (
                    <>
                      <Button variant="outline" size="sm" onClick={handleZoomOut}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-600 min-w-[60px] text-center">
                        {Math.round(previewZoom * 100)}%
                      </span>
                      <Button variant="outline" size="sm" onClick={handleZoomIn}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleRotate}>
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* Fullscreen toggle */}
                  <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                    {previewFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>

                  {/* Download button */}
                  <Button variant="outline" size="sm" onClick={() => handleDownload(previewDocument)}>
                    <Download className="h-4 w-4" />
                    Pobierz
                  </Button>

                  {/* Close button */}
                  <Button variant="ghost" size="sm" onClick={() => setPreviewDocument(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content area */}
              <div
                className={`flex justify-center items-center overflow-auto ${previewFullscreen ? "h-[calc(100vh-80px)]" : "max-h-[calc(95vh-80px)]"} bg-gray-100`}
              >
                {previewDocument.contentType.startsWith("image/") ? (
                  <div className="flex justify-center items-center w-full h-full p-4">
                    <img
                      src={previewDocument.previewUrl || "/placeholder.svg?height=500&width=700"}
                      alt={previewDocument.originalFileName}
                      className="max-w-full max-h-full object-contain transition-transform duration-200"
                      style={{
                        transform: `scale(${previewZoom}) rotate(${previewRotation}deg)`,
                      }}
                    />
                  </div>
                ) : previewDocument.contentType.startsWith("video/") ? (
                  <div className="flex justify-center items-center w-full h-full p-4">
                    <video
                      src={previewDocument.previewUrl || previewDocument.downloadUrl}
                      className="max-w-full max-h-full"
                      controls
                      preload="metadata"
                    >
                      Twoja przeglądarka nie obsługuje odtwarzania wideo.
                    </video>
                  </div>
                ) : previewDocument.contentType === "application/pdf" ? (
                  <iframe
                    src={previewDocument.previewUrl || previewDocument.downloadUrl}
                    className="w-full h-full"
                    title={previewDocument.originalFileName}
                  />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Podgląd niedostępny dla tego typu pliku</p>
                    <Button onClick={() => handleDownload(previewDocument)}>
                      <Download className="mr-2 h-4 w-4" />
                      Pobierz plik
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
