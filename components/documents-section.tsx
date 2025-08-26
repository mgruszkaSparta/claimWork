"use client"

import React, { useState, useEffect, useCallback, useImperativeHandle } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { renameDocument } from "@/lib/api/documents"
import { authFetch } from "@/lib/auth-fetch"
import { generateId } from "@/lib/constants"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { File, Search, Eye, Download, Upload, X, Trash2, Grid, List, Wand, Plus, FileText, Paperclip, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCw, Maximize2, Minimize2, Pencil, Save, Move } from 'lucide-react'
import type { DocumentsSectionProps, UploadedFile, DocumentsSectionRef } from "@/types"
import JSZip from "jszip"
import { saveAs } from "file-saver"

// Categories that have dedicated sections elsewhere and therefore should
// not appear in the generic documents section for a claim folder.
const DEFAULT_HIDDEN_CATEGORIES = [
  "Decyzje",
  "Decyzja",
  "Decisions",
  "Decision",
  "Regresy",
  "Regres",
  "Odwołania",
  "Odwołanie",
  "Roszczenia klienta",
  "Roszczenia",
  "Rozliczenia",
]

interface Document {
  id: string
  eventId?: string
  damageId?: string
  fileName: string
  originalFileName: string
  contentType: string
  fileSize: number
  filePath: string
  cloudUrl?: string
  description?: string
  status: string
  uploadedBy: string
  createdAt: string
  updatedAt: string
  canPreview: boolean
  previewUrl?: string
  downloadUrl: string
  /** Human readable category name */
  documentType: string
  /** Machine readable category code */
  categoryCode?: string
}
export const DocumentsSection = React.forwardRef<
  DocumentsSectionRef,
  DocumentsSectionProps & { hideRequiredDocuments?: boolean; hiddenCategories?: string[] }
>(
  (
    {
      uploadedFiles,
      setUploadedFiles,
      requiredDocuments,
      setRequiredDocuments,
      eventId,
      damageId,
      pendingFiles = [],
      setPendingFiles,
      hideRequiredDocuments = false,
      storageKey,
      hiddenCategories = DEFAULT_HIDDEN_CATEGORIES,
    }: DocumentsSectionProps & { hideRequiredDocuments?: boolean; hiddenCategories?: string[] },
    ref,
  ) => {
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<"list" | "grid">(() => {
    if (storageKey && typeof window !== "undefined") {
      const stored = localStorage.getItem(`documents-view-${storageKey}`)
      if (stored === "list" || stored === "grid") {
        return stored
      }
    }
    return "list"
  })
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ "Inne dokumenty": true })
  const [uploadingForCategory, setUploadingForCategory] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [dragCategory, setDragCategory] = useState<string | null>(null)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([])
  const [editingDocId, setEditingDocId] = useState<string | number | null>(null)

  // Preview modal states
  const [previewZoom, setPreviewZoom] = useState(1)
  const [previewRotation, setPreviewRotation] = useState(0)
  const [previewFullscreen, setPreviewFullscreen] = useState(false)
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [previewDocuments, setPreviewDocuments] = useState<Document[]>([])

  const previewContainerRef = React.useRef<HTMLDivElement>(null)
  const docxPreviewRef = React.useRef<HTMLDivElement>(null)

  const [docxEditing, setDocxEditing] = useState(false)
  const originalDocxHtml = React.useRef<string>("")

  // Persist view mode per section when storageKey provided
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(`documents-view-${storageKey}`, viewMode)
    }
  }, [viewMode, storageKey])

  const closePreview = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
    if (previewDocument?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewDocument.previewUrl)
    }

    if (docxPreviewRef.current) {
      docxPreviewRef.current.innerHTML = ""
    }

    setDocxEditing(false)
    setPreviewDocument(null)
  }, [previewDocument])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setPreviewFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          closePreview()
        }
      }
    }
    if (previewDocument) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [previewDocument, closePreview])

  const isGuid = (value: string) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)


  const uploadedFileToDocument = (file: UploadedFile): Document => {
    const isPersisted = isGuid(file.id)
    const previewUrl = isPersisted
      ? `/api/documents/${file.id}/preview`
      : file.cloudUrl || file.url
    const downloadUrl = isPersisted
      ? `/api/documents/${file.id}/download`
      : file.cloudUrl || file.url

    return {
      id: file.id,
      fileName: file.name,
      originalFileName: file.name,
      contentType: file.file?.type || "",
      fileSize: file.size,
      filePath: downloadUrl,
      cloudUrl: file.cloudUrl,
      description: file.description,
      status: "pending",
      uploadedBy: "Current User",
      createdAt: file.uploadedAt,
      updatedAt: file.uploadedAt,
      canPreview:
        file.type === "image" ||
        file.type === "pdf" ||
        file.type === "video" ||
        file.type === "doc",
      previewUrl,
      downloadUrl,
      documentType: file.category || "Inne dokumenty",
      categoryCode: file.categoryCode,
    }
  }


  const mapContentTypeToFileType = (
    contentType: string,
  ): UploadedFile["type"] => {
    if (contentType.includes("pdf")) return "pdf"
    if (contentType.includes("image")) return "image"
    if (
      contentType.includes("msword") ||
      contentType.includes("wordprocessingml") ||
      contentType.includes("doc") ||
      contentType.includes("ms-excel") ||
      contentType.includes("spreadsheetml") ||
      contentType.includes("excel")
    )
      return "doc"
    if (contentType.includes("video")) return "video"
    return "other"
  }

  const documentToUploadedFile = (doc: Document): UploadedFile => ({
    id: doc.id,
    name: doc.originalFileName || doc.fileName,
    size: doc.fileSize,
    type: mapContentTypeToFileType(doc.contentType),
    uploadedAt: doc.createdAt,
    url: doc.previewUrl || doc.downloadUrl,
    cloudUrl: doc.cloudUrl,
    category: doc.documentType,
    categoryCode: doc.categoryCode,
    description: doc.description,
  })

  const allDocuments = React.useMemo(
    () => [...documents, ...pendingFiles.map(uploadedFileToDocument)],
    [documents, pendingFiles]
  )

  const visibleDocuments = React.useMemo(
    () => allDocuments.filter((d) => !hiddenCategories.includes(d.documentType)),
    [allDocuments, hiddenCategories],
  )

  useEffect(() => {
    const validIds = selectedDocumentIds.filter((id) =>
      visibleDocuments.some((d) => d.id === id),
    )

    if (validIds.length !== selectedDocumentIds.length) {
      setSelectedDocumentIds(validIds)
    }
  }, [visibleDocuments, selectedDocumentIds])


  // Load documents from API
  useEffect(() => {
    if (!eventId || !isGuid(eventId)) return

    const handler = setTimeout(() => {
      loadDocuments()
    }, 300)
    return () => clearTimeout(handler)
  }, [eventId, damageId])

  const mapCategoryCodeToName = (code?: string) =>
    requiredDocuments.find((d) => d.category === code)?.name || code || "Inne dokumenty"

  const mapCategoryNameToCode = (name?: string | null) =>
    requiredDocuments.find((d) => d.name === name)?.category || name || "Inne dokumenty"

  const loadDocuments = async () => {
    if (!eventId || !isGuid(eventId)) return

    setLoading(true)
    try {
      const params = new URLSearchParams({ eventId })
      if (damageId) {
        params.append("damageId", damageId)
      }
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents?${params.toString()}`,
      )

      if (response.status === 404) {
        setDocuments([])
        toast({
          title: "Brak dokumentów",
          description: "Nie znaleziono dokumentów dla tego zdarzenia.",
        })
      } else if (response.ok) {
        const data: Document[] = await response.json()
        const mappedDocs: Document[] = data.map((d: any) => ({
          ...d,
          documentType: mapCategoryCodeToName(d.documentType || d.category),
          categoryCode: d.documentType || d.category,

          previewUrl: `/api/documents/${d.id}/preview`,
          downloadUrl: `/api/documents/${d.id}/download`,

        }))
        setDocuments(mappedDocs)
        setUploadedFiles(
          mappedDocs.map(documentToUploadedFile).concat(pendingFiles),
        )
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
    const categoriesFromDocuments = [...new Set(visibleDocuments.map((d) => d.documentType))]
    return [
      ...new Set(["Inne dokumenty", ...categoriesFromRequired, ...categoriesFromDocuments]),
    ].filter((c) => !hiddenCategories.includes(c))
  }, [requiredDocuments, visibleDocuments, hiddenCategories])

  const handleFileUpload = async (files: FileList | null, categoryName: string | null) => {

    if (!files || !categoryName) {

      console.error("Missing required parameters:", { files: !!files, category: categoryName })
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
          type: file.type.includes("video")
            ? "video"
            : file.type.includes("image")
            ? "image"
            : file.type.includes("pdf")
            ? "pdf"
            : file.type.includes("msword") ||
              file.type.includes("wordprocessingml") ||
              file.type.includes("ms-excel") ||
              file.type.includes("spreadsheetml") ||
              file.type.includes("excel")
            ? "doc"
            : "other",
          uploadedAt: new Date().toISOString(),
          url: URL.createObjectURL(file),
          category: categoryName || "Inne dokumenty",
          categoryCode: mapCategoryNameToCode(categoryName),
          file: file,
        })
      })

      if (newFiles.length > 0) {
        setPendingFiles?.((prev) => [...prev, ...newFiles])
        toast({
          title: "Dodano pliki",
          description: `Dodano ${newFiles.length} plik(ów) do kategorii "${categoryName}".`,
        })

      }
      return
    }

    setUploading(true)

    const uploadPromises = Array.from(files).map(async (file, index) => {
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
      if (damageId) {
        formData.append("damageId", damageId.toString())
      }
      formData.append("category", mapCategoryNameToCode(categoryName))
      formData.append("uploadedBy", "Current User")

      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/documents/upload`,
          {
            method: "POST",
            body: formData,
          },
        )

        if (response.ok) {
          const documentDto = await response.json()
          const serverCategory = documentDto.documentType || documentDto.category
         const doc: Document = {
           ...documentDto,
           documentType: serverCategory
             ? mapCategoryCodeToName(serverCategory)
             : categoryName || "Inne dokumenty",
           categoryCode: serverCategory || mapCategoryNameToCode(categoryName),
           canPreview:
             documentDto.canPreview ??
             (documentDto.contentType?.startsWith("image/") ||
               documentDto.contentType === "application/pdf" ||
               documentDto.contentType?.startsWith("video/") ||
              documentDto.contentType ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
              documentDto.contentType === "application/msword" ||
              documentDto.contentType?.includes("ms-excel") ||
              documentDto.contentType?.includes("spreadsheetml") ||
              documentDto.contentType?.includes("excel")),

          previewUrl: `/api/documents/${documentDto.id}/preview`,
          downloadUrl: `/api/documents/${documentDto.id}/download`,
        }
        return doc
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
        id: doc.id?.toString() ?? generateId(),
      }))

      if (successfulUploadsWithIds.length > 0) {
        setDocuments((prev) => [...prev, ...successfulUploadsWithIds])
        setUploadedFiles((prev) => [
          ...prev,
          ...successfulUploadsWithIds.map((doc) => ({
            id: doc.id,
            name: doc.originalFileName || doc.fileName,
            size: doc.fileSize,
            type: doc.contentType.includes("video")
              ? "video"
              : doc.contentType.includes("image")
              ? "image"
              : doc.contentType.includes("pdf")
              ? "pdf"
              : doc.contentType.includes("msword") ||
                doc.contentType.includes("wordprocessingml") ||
                doc.contentType.includes("ms-excel") ||
                doc.contentType.includes("spreadsheetml") ||
                doc.contentType.includes("excel")
              ? "doc"
              : "other",
            uploadedAt: doc.createdAt,
            url: doc.previewUrl || doc.downloadUrl,
            cloudUrl: doc.cloudUrl,
            category: doc.documentType,
            categoryCode: doc.categoryCode,
            description: doc.description,
          })),
        ])
        toast({
          title: "Przesłano pliki",
          description: `Pomyślnie dodano ${successfulUploadsWithIds.length} plik(ów) do kategorii "${categoryName}".`,
        })
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
    setUploadingForCategory(category)
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setUploadedFiles((prev) =>
        prev.filter((f) => f.id !== documentId.toString()),
      )
      setSelectedDocumentIds((prev) =>
        prev.filter((id) => id !== documentId.toString()),
      )
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
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}`,
        { method: "DELETE" },
      )

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
        setUploadedFiles((prev) =>
          prev.filter((f) => f.id !== documentId.toString()),
        )
        setSelectedDocumentIds((prev) =>
          prev.filter((id) => id !== documentId.toString()),
        )
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

  const updateFileName = (documentId: string | number, name: string) => {
    const pendingIndex = pendingFiles.findIndex((f) => f.id === documentId)

    if (pendingIndex !== -1) {
      setPendingFiles?.((prev) =>
        prev.map((f) => (f.id === documentId ? { ...f, name } : f)),
      )
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === documentId.toString() ? { ...f, name } : f,
        ),
      )
      setPreviewDocument((prev) =>
        prev?.id === documentId ? { ...prev, originalFileName: name } : prev,
      )
      return
    }

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId ? { ...doc, originalFileName: name } : doc,
      ),
    )
    setPreviewDocument((prev) =>
      prev?.id === documentId ? { ...prev, originalFileName: name } : prev,
    )
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === documentId.toString() ? { ...f, name } : f,
      ),
    )
  }

  const handleFileNameChange = async (documentId: string | number, name: string) => {
    updateFileName(documentId, name)

    try {
      const updatedDocument = await renameDocument(documentId.toString(), name)
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId ? { ...doc, ...updatedDocument } : doc,
        ),
      )
      setPreviewDocument((prev) =>
        prev?.id === documentId ? { ...prev, ...updatedDocument } : prev,
      )
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === documentId.toString()
            ? { ...f, name: updatedDocument.originalFileName }
            : f,
        ),
      )
    } catch (error) {
      console.error("Error updating document name:", error)
    }
  }

  const handleDescriptionChange = async (
    documentId: string | number,
    description: string,
  ) => {
    const pendingIndex = pendingFiles.findIndex((f) => f.id === documentId)

    if (pendingIndex !== -1) {
      setPendingFiles?.((prev) => prev.map((f) => (f.id === documentId ? { ...f, description } : f)))
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === documentId.toString() ? { ...f, description } : f,
        ),
      )
      setPreviewDocument((prev) => (prev?.id === documentId ? { ...prev, description } : prev))
      return
    }

    // Optimistic update to keep document within its category and update preview
    setDocuments((prev) => prev.map((doc) => (doc.id === documentId ? { ...doc, description } : doc)))
    setPreviewDocument((prev) => (prev?.id === documentId ? { ...prev, description } : prev))
    setUploadedFiles((prev) =>
      prev.map((f) =>
        f.id === documentId.toString() ? { ...f, description } : f,
      ),
    )

    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description }),
        },
      )

      if (response.ok) {
        const updatedDocument = await response.json()
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === documentId ? { ...doc, ...updatedDocument } : doc)),
        )
        setPreviewDocument((prev) =>
          prev?.id === documentId ? { ...prev, ...updatedDocument } : prev,
        )
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === documentId.toString()
              ? { ...f, description: updatedDocument.description }
              : f,
          ),
        )
      }
    } catch (error) {
      console.error("Error updating document description:", error)
    }
  }

  const handleGenerateAIDescription = async (documentId: string | number) => {
    const doc = visibleDocuments.find((d) => d.id === documentId)
    if (!doc || doc.status === "pending") return

    try {
      toast({
        title: "Generowanie opisu AI",
        description: `Rozpoczęto generowanie opisu dla pliku: ${doc.originalFileName}`,
      })

      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}/generate-description`,
        { method: "POST" },
      )

      if (response.ok) {
        const updatedDocument = await response.json()
        setDocuments((prev) => prev.map((d) => (d.id === documentId ? updatedDocument : d)))
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === documentId.toString()
              ? { ...f, description: updatedDocument.description }
              : f,
          ),
        )
        toast({
          title: "Sukces",
          description: `Wygenerowano opis dla pliku: ${doc.originalFileName}`,
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

  const handlePreview = async (doc: Document, documentsArray?: Document[]) => {

    const docsToPreview = documentsArray || visibleDocuments
    const index = docsToPreview.findIndex((d) => d.id === doc.id)
    if (previewDocument?.previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewDocument.previewUrl)
    }
    setPreviewDocuments(docsToPreview)
    setCurrentPreviewIndex(index)
    setPreviewZoom(1)
    setPreviewRotation(0)
    setPreviewFullscreen(false)
    setDocxEditing(false)

    try {
      const response = await authFetch(doc.previewUrl || doc.downloadUrl, {
        method: "GET",
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      if (docxPreviewRef.current) {
        docxPreviewRef.current.innerHTML = ""
      }
      setPreviewDocument({ ...doc, previewUrl: objectUrl })
      if (
        doc.contentType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        try {
          const buffer = await blob.arrayBuffer()
          const { renderAsync } = await import("docx-preview")
          if (docxPreviewRef.current) {
            await renderAsync(buffer, docxPreviewRef.current)
          }
        } catch (err) {
          console.error("Error rendering docx preview:", err)
        }
      }
    } catch (error) {
      console.error("Error loading preview:", error)

      toast({
        title: "Błąd podglądu",
        description: "Nie można wyświetlić dokumentu",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      const response = await authFetch(doc.downloadUrl, { method: "GET" })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement("a")
      link.href = url
      link.download = doc.originalFileName
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading file:", error)
      toast({
        title: "Błąd pobierania",

        description: "Nie udało się pobrać pliku.",
        variant: "destructive",
      })
    }
  }

  const startDocxEdit = () => {
    if (docxPreviewRef.current) {
      originalDocxHtml.current = docxPreviewRef.current.innerHTML
      setDocxEditing(true)
    }
  }

  const cancelDocxEdit = () => {
    if (docxPreviewRef.current) {
      docxPreviewRef.current.innerHTML = originalDocxHtml.current
    }
    setDocxEditing(false)
  }

  const saveDocxEdit = async () => {
    if (!docxPreviewRef.current || !previewDocument) return
    const html = docxPreviewRef.current.innerHTML
    // @ts-ignore: library lacks types
    const HTMLDocx = await import("html-docx-js/dist/html-docx")
    const blob = HTMLDocx.default
      ? HTMLDocx.default.asBlob(html)
      : HTMLDocx.asBlob(html)
    saveAs(blob, previewDocument.originalFileName)
    setDocxEditing(false)
  }

  const handleDownloadAll = async (category?: string) => {
    const documentsForCategory = category
      ? visibleDocuments.filter((d) => d.documentType === category)
      : visibleDocuments

    if (documentsForCategory.length === 0) {
      toast({
        title: "Brak plików",
        description: category
          ? "Nie ma plików do pobrania w tej kategorii."
          : "Brak plików do pobrania.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Pobieranie plików",
      description: category
        ? `Rozpoczęto pobieranie ${documentsForCategory.length} plik(ów) z kategorii "${category}".`
        : `Rozpoczęto pobieranie ${documentsForCategory.length} plik(ów).`,
    })

    try {
      const zip = new JSZip()

      for (const doc of documentsForCategory) {
        const response = await authFetch(doc.downloadUrl, { method: "GET" })
        const blob = await response.blob()
        zip.file(doc.originalFileName, blob)
      }

      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, category ? `${category}.zip` : `dokumenty.zip`)

      toast({
        title: "Pobieranie zakończone",
        description: category
          ? `Pliki z kategorii "${category}" zostały pobrane w archiwum zip.`
          : "Wszystkie pliki zostały pobrane w archiwum zip.",
      })
    } catch (error) {
      console.error("Failed to download all documents", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać wszystkich plików.",
        variant: "destructive",
      })
    }
  }

  const handlePreviewAll = () => {
    if (visibleDocuments.length === 0) {
      toast({
        title: "Brak plików",
        description: "Nie ma plików do podglądu.",
        variant: "destructive",
      })
      return
    }
    void handlePreview(visibleDocuments[0], visibleDocuments)
  }

  const handleDownloadSelected = async (category?: string) => {
    const documentsForCategory = visibleDocuments.filter((d) =>
      category
        ? d.documentType === category && selectedDocumentIds.includes(d.id)
        : selectedDocumentIds.includes(d.id),
    )

    if (documentsForCategory.length === 0) {
      toast({
        title: "Brak plików",
        description: category
          ? "Nie wybrano plików do pobrania w tej kategorii."
          : "Nie wybrano plików do pobrania.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Pobieranie plików",
      description: category
        ? `Rozpoczęto pobieranie ${documentsForCategory.length} zaznaczonych plik(ów).`
        : `Rozpoczęto pobieranie ${documentsForCategory.length} zaznaczonych plik(ów).`,
    })

    try {
      const zip = new JSZip()

      for (const doc of documentsForCategory) {
        const response = await authFetch(doc.downloadUrl, { method: "GET" })
        const blob = await response.blob()
        zip.file(doc.originalFileName, blob)
      }

      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, category ? `${category}-wybrane.zip` : `dokumenty-wybrane.zip`)

      toast({
        title: "Pobieranie zakończone",
        description: category
          ? `Zaznaczone pliki z kategorii "${category}" zostały pobrane w archiwum zip.`
          : "Zaznaczone pliki zostały pobrane w archiwum zip.",
      })
    } catch (error) {
      console.error("Failed to download selected documents", error)
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać zaznaczonych plików.",
        variant: "destructive",
      })
    }
  }

  useImperativeHandle(ref, () => ({
    downloadAll: handleDownloadAll,
    downloadSelected: handleDownloadSelected,
    search: (query: string) => setSearchQuery(query),
  }))

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const moveDocument = async (documentId: string, targetCategory: string) => {
    const targetCode = mapCategoryNameToCode(targetCategory)
    const updatedFiles = uploadedFiles.map((f) =>
      f.id === documentId ? { ...f, category: targetCategory, categoryCode: targetCode } : f,
    )
    setUploadedFiles(updatedFiles)

    const existingDoc = documents.find((d) => d.id === documentId)
    const oldCategory = existingDoc
      ? existingDoc.documentType
      : pendingFiles.find((f) => f.id === documentId)?.category || "Inne dokumenty"

    if (existingDoc) {
      const newDocs = documents.map((d) =>
        d.id === documentId
          ? { ...d, documentType: targetCategory, categoryCode: targetCode }
          : d,
      )
      setDocuments(newDocs)

      if (isGuid(documentId) && eventId) {
        try {
          await authFetch(
            `${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ documentType: targetCode }),
            },
          )
        } catch (error) {
          console.error("Error moving document:", error)
          toast({
            title: "Błąd",
            description: "Nie udało się przenieść dokumentu",
            variant: "destructive",
          })
        }
      }
    } else {
      setPendingFiles?.((prev) =>
        prev.map((f) =>
          f.id === documentId ? { ...f, category: targetCategory, categoryCode: targetCode } : f,
        ),
      )
    }

    setRequiredDocuments((prev) =>
      prev.map((rd) => {
        if (rd.name === targetCategory) return { ...rd, uploaded: true }
        if (rd.name === oldCategory)
          return {
            ...rd,
            uploaded: updatedFiles.some(
              (f) => f.id !== documentId && f.category === oldCategory,
            ),
          }
        return rd
      }),
    )
  }

  const handleMoveSelected = (targetCategory: string, fromCategory?: string) => {
    const idsToMove = selectedDocumentIds.filter((id) => {
      const doc = visibleDocuments.find((d) => d.id === id)
      return doc && (!fromCategory || doc.documentType === fromCategory)
    })

    idsToMove.forEach((id) => moveDocument(id, targetCategory))

    setSelectedDocumentIds((prev) => prev.filter((id) => !idsToMove.includes(id)))
  }

  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setDragCategory(null)
    // If the section was collapsed open it so user sees upload progress
    setOpenCategories((prev) => ({ ...prev, [category]: true }))
    const documentId =
      e.dataTransfer.getData("application/x-doc-id") ||
      e.dataTransfer.getData("text/plain")
    if (documentId) {
      moveDocument(documentId, category)
    } else if (e.dataTransfer.files && e.dataTransfer.files[0]) {
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

  const handleRemoveCategory = (category: string) => {
    setRequiredDocuments((prev) =>
      prev.map((doc) => (doc.name === category ? { ...doc, uploaded: false } : doc)),
    )

    setOpenCategories((prev) => {
      const { [category]: _, ...rest } = prev
      return rest
    })

    setSelectedDocumentIds((prev) =>
      prev.filter((id) => {
        const doc = visibleDocuments.find((d) => d.id === id)
        return doc?.documentType !== category
      }),
    )

    toast({
      title: "Kategoria usunięta",
      description: `Kategoria "${category}" została usunięta.`,
      variant: "destructive",
    })
  }

  // Preview navigation functions
  const goToPreviousDocument = () => {
    if (currentPreviewIndex > 0) {
      const newIndex = currentPreviewIndex - 1
      void handlePreview(previewDocuments[newIndex], previewDocuments)
    }
  }

  const goToNextDocument = () => {
    if (currentPreviewIndex < previewDocuments.length - 1) {
      const newIndex = currentPreviewIndex + 1
      void handlePreview(previewDocuments[newIndex], previewDocuments)
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
    const element = previewContainerRef.current
    if (!document.fullscreenElement) {
      element?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
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
    } else if (
      contentType.includes("spreadsheet") ||
      contentType.includes("ms-excel") ||
      contentType.includes("excel")
    ) {
      return <File className="h-5 w-5 text-green-600" />
    } else if (contentType.includes("document") || contentType.includes("word")) {
      return <File className="h-5 w-5 text-blue-700" />
    } else if (contentType.startsWith("video/")) {
      return <File className="h-5 w-5 text-purple-500" />
    } else {
      return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const FileCard = ({ doc, onDelete }: { doc: Document; onDelete: (id: string | number) => void }) => {
    const isSelected = selectedDocumentIds.includes(doc.id)
    return (
      <Card className="overflow-hidden group relative">
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              const value = checked === true
              setSelectedDocumentIds((prev) =>
                value
                  ? [...prev, doc.id]
                  : prev.filter((id) => id !== doc.id),
              )
            }}
          />
          <Badge variant="secondary" className="capitalize">
            {doc.status}
          </Badge>
        </div>
      <div className="aspect-w-16 aspect-h-10 bg-gray-100 flex items-center justify-center min-h-[150px]">
        {doc.contentType.startsWith("image/") ? (
          <img
            src={doc.previewUrl || "/placeholder.svg?height=150&width=200"}
            alt={doc.originalFileName}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => void handlePreview(doc)}
          />
        ) : doc.contentType.startsWith("video/") ? (
          <video
            src={doc.previewUrl || doc.downloadUrl}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => void handlePreview(doc)}
            muted
            preload="metadata"
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-xs text-gray-500 text-center px-2">
              {doc.contentType === "application/pdf"
                ? "PDF"
                : doc.contentType.includes("document")
                  ? "DOC"
                  : doc.contentType.startsWith("video/")
                    ? "VIDEO"
                    : "FILE"}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        {editingDocId === doc.id ? (
          <Input
            value={doc.originalFileName}
            onChange={(e) => updateFileName(doc.id, e.target.value)}
            onBlur={(e) => {
              handleFileNameChange(doc.id, e.target.value)
              setEditingDocId(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }}
            className="text-sm mb-1"
            title={doc.originalFileName}
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm truncate" title={doc.originalFileName}>
              {doc.originalFileName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6"
              onClick={(e) => {
                e.stopPropagation()
                setEditingDocId(doc.id)
              }}
            >
              Edytuj
            </Button>
          </div>
        )}
        <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
        <p className="text-xs text-gray-400">{formatBytes(doc.fileSize)}</p>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={(e) => e.stopPropagation()}
            >
              Przenieś
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {documentCategories
              .filter((c) => c !== doc.documentType)
              .map((c) => (
                <DropdownMenuItem
                  key={c}
                  onClick={(e) => {
                    e.stopPropagation()
                    moveDocument(doc.id, c)
                  }}
                >
                  {c}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            void handlePreview(doc)
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(doc.id)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
  }

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

        <Card className="rounded-md">
          <CardHeader className="p-4">
            <CardTitle className="text-xl">Dokumenty</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-medium text-gray-600">Szybkie filtry:</span>
              <Badge
                variant="secondary"
                className="cursor-pointer px-2 bg-blue-100 text-blue-800"
              >
                Wymagane
              </Badge>
              <Badge variant="secondary" className="cursor-pointer px-2">
                Z plikami
              </Badge>
              <Badge variant="secondary" className="cursor-pointer px-2">
                Puste
              </Badge>
              <Badge variant="secondary" className="cursor-pointer px-2">
                Ostatnie
              </Badge>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviewAll}
            disabled={visibleDocuments.length === 0}
          >
            <Eye className="mr-2 h-4 w-4" /> Podgląd wszystkich
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadAll()}
            disabled={visibleDocuments.length === 0}
          >
            <Download className="mr-2 h-4 w-4" /> Pobierz wszystkie
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadSelected()}
            disabled={selectedDocumentIds.length === 0}
          >
            <Download className="mr-2 h-4 w-4" /> Pobierz zaznaczone
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={selectedDocumentIds.length === 0}
              >
                <Move className="mr-2 h-4 w-4" /> Przenieś zaznaczone
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {documentCategories.map((c) => (
                <DropdownMenuItem key={c} onClick={() => handleMoveSelected(c)}>
                  {c}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {documentCategories.map((category) => {
          const documentsForCategory = visibleDocuments.filter((d) => d.documentType === category)
          const isCategoryOpen = openCategories[category] ?? false

          return (
            <Card
              key={category}
              className="rounded-md"
              onDragEnter={(e) => {
                handleDrag(e)
                setDragCategory(category)
              }}
              onDragOver={(e) => {
                handleDrag(e)
                setDragCategory(category)
              }}
              onDrop={(e) => handleDrop(e, category)}
            >
              <CardHeader
                className="flex flex-row items-center justify-between p-4 cursor-pointer"
                onClick={() => setOpenCategories((prev) => ({ ...prev, [category]: !isCategoryOpen }))}
              >
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold">{category}</h3>
                  <Badge variant="secondary" className="px-2 bg-green-100 text-green-800">
                    {documentsForCategory.length}
                  </Badge>
                  {category !== "Inne dokumenty" && documentsForCategory.length === 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm(`Czy na pewno chcesz usunąć kategorię "${category}"?`)) {
                          handleRemoveCategory(category)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
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
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Wyszukaj w plikach (nazwa, opis, typ, rozmiar, id)..."
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-gray-600">Szybkie filtry:</span>
                      <Badge variant="secondary" className="cursor-pointer px-2">
                        PDF
                      </Badge>
                      <Badge variant="secondary" className="cursor-pointer px-2">
                        Obrazy
                      </Badge>
                      <Badge variant="secondary" className="cursor-pointer px-2">
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
                            <th className="p-3 w-4"></th>
                            <th className="p-3 text-left font-medium text-gray-600 w-2/6">Nazwa pliku</th>
                            <th className="p-3 text-left font-medium text-gray-600 w-2/6">Opis pliku</th>
                            <th className="p-3 text-left font-medium text-gray-600 w-1/6">Rozmiar</th>
                            <th className="p-3 text-left font-medium text-gray-600 w-1/6">Data dodania</th>
                            <th className="p-3 text-left font-medium text-gray-600 w-1/6">Status</th>
                            <th className="p-3 text-left font-medium text-gray-600 w-1/6">Akcja</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documentsForCategory.map((doc, index) => {
                            const isSelected = selectedDocumentIds.includes(doc.id)
                            return (
                              <tr
                                key={doc.id}
                                className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                              >
                                <td className="p-3">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      const value = checked === true
                                      setSelectedDocumentIds((prev) =>
                                        value
                                          ? [...prev, doc.id]
                                          : prev.filter((id) => id !== doc.id),
                                      )
                                    }}
                                  />
                                </td>
                                <td className="p-3 font-medium flex items-center gap-2">
                                  {getFileIcon(doc.contentType)}
                                  {editingDocId === doc.id ? (
                                    <Input
                                      value={doc.originalFileName}
                                      onChange={(e) => updateFileName(doc.id, e.target.value)}
                                      onBlur={(e) => {
                                        handleFileNameChange(doc.id, e.target.value)
                                        setEditingDocId(null)
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault()
                                          e.currentTarget.blur()
                                        }
                                      }}
                                      className="text-sm h-8"
                                      autoFocus
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="truncate">
                                        {doc.originalFileName}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setEditingDocId(doc.id)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => handleGenerateAIDescription(doc.id)}
                                    >
                                      <Wand className="h-4 w-4 text-purple-500" />
                                    </Button>
                                    <Input
                                      value={doc.description || ""}
                                      onChange={(e) => handleDescriptionChange(doc.id, e.target.value)}
                                      className="text-sm h-8"
                                      placeholder="Wprowadź opis pliku..."
                                    />
                                  </div>
                                </td>
                                <td className="p-3 text-gray-600">{formatBytes(doc.fileSize)}</td>
                                <td className="p-3 text-gray-600">{new Date(doc.createdAt).toLocaleDateString()}</td>
                                <td className="p-3 text-gray-600 capitalize">{doc.status}</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-1">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-7">
                                          Przenieś
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        {documentCategories
                                          .filter((c) => c !== doc.documentType)
                                          .map((c) => (
                                            <DropdownMenuItem
                                              key={c}
                                              onClick={() => moveDocument(doc.id, c)}
                                            >
                                              {c}
                                            </DropdownMenuItem>
                                          ))}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => handleDownload(doc)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => void handlePreview(doc, documentsForCategory)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-red-500 hover:text-red-600"
                                      onClick={() => handleFileDelete(doc.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
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
                      {documentsForCategory.map((doc) => (
                        <FileCard
                          key={doc.id}
                          doc={doc}
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
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-500">
                Dodaj kategorię, aby móc załączyć odpowiednie pliki.
              </p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddRequiredCategory(doc.name)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Dodaj
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Preview Modal */}
        {previewDocument && (
          <div
            ref={previewContainerRef}
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

                  {previewDocument.contentType ===
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
                    docxEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={saveDocxEdit}>
                          <Save className="h-4 w-4" />
                          Zapisz
                        </Button>
                        <Button variant="ghost" size="sm" onClick={cancelDocxEdit}>
                          Anuluj
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={startDocxEdit}>
                        <Pencil className="h-4 w-4" />
                        Edytuj
                      </Button>
                    )
                  )}

                  {/* Download button */}
                  <Button variant="outline" size="sm" onClick={() => handleDownload(previewDocument)}>
                    <Download className="h-4 w-4" />
                    Pobierz
                  </Button>

                  {/* Close button */}
                  <Button variant="ghost" size="sm" onClick={closePreview}>
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
                ) : previewDocument.contentType?.startsWith("application/pdf") ? (
                  <object
                    data={previewDocument.previewUrl || previewDocument.downloadUrl}
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <iframe
                      src={previewDocument.previewUrl || previewDocument.downloadUrl}
                      className="w-full h-full"
                      title={previewDocument.originalFileName}
                    />
                  </object>
                ) : previewDocument.contentType?.includes("ms-excel") ||
                  previewDocument.contentType?.includes("spreadsheetml") ||
                  previewDocument.contentType?.includes("excel") ? (
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                      previewDocument.previewUrl || previewDocument.downloadUrl,
                    )}`}
                    className="w-full h-full"
                    title={previewDocument.originalFileName}
                  />
                ) : previewDocument.contentType?.startsWith("application/msword") ? (
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                      previewDocument.previewUrl || previewDocument.downloadUrl,
                    )}`}
                    className="w-full h-full"
                    title={previewDocument.originalFileName}
                  />
                ) : previewDocument.contentType?.startsWith(
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  ) ? (
                  <div className="w-full h-full overflow-auto p-4">
                    <div
                      ref={docxPreviewRef}
                      className={`w-full ${docxEditing ? "border p-2" : ""}`}
                      contentEditable={docxEditing}
                      suppressContentEditableWarning
                    />
                  </div>
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
              {previewDocument.description && (
                <div className="p-4">
                  <p className="text-sm text-gray-600">{previewDocument.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

DocumentsSection.displayName = "DocumentsSection"
