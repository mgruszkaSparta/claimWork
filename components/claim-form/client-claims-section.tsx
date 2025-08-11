"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Upload,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  X,
  User,
  Eye,
  Download,
  AlertCircle,
  Minus,
  Loader2,
} from "lucide-react"
import type { ClientClaim } from "@/types"
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

interface ClientClaimsSectionProps {
  clientClaims: ClientClaim[]
  onClientClaimsChange: (claims: ClientClaim[]) => void
  claimId: string
}

export function ClientClaimsSection({ clientClaims, onClientClaimsChange, claimId }: ClientClaimsSectionProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingClaim, setEditingClaim] = useState<ClientClaim | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [outlookDragActive, setOutlookDragActive] = useState(false)
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean
    url: string
    fileName: string
    fileType: string
    claim: ClientClaim | null
  }>({
    isOpen: false,
    url: "",
    fileName: "",
    fileType: "",
    claim: null,
  })

  const [formData, setFormData] = useState({
    claimDate: new Date().toISOString().split("T")[0],
    claimType: "",
    claimAmount: "",
    currency: "PLN",
    status: "Złożone",
    description: "",
    documentDescription: "",
  })

  const claimTypes = [
    "Pojazd - bezsporna",
    "Pojazd - szkoda całkowita",
    "Pojazd - szkoda częściowa",
    "Pojazd zastępczy",
    "Holowanie",
    "Parkowanie",
    "Dopłata - pojazd",
    "Dopłata - pojazd zastępczy",
    "Koszty leczenia",
    "Utrata dochodów",
    "Krzywda moralna",
    "Inne",
  ]

  const statuses = ["Złożone", "W trakcie analizy", "Zaakceptowane", "Odrzucone", "Częściowo zaakceptowane"]

  const currencies = ["PLN", "EUR", "USD", "CHF", "GBP"]

  const resetForm = useCallback(() => {
    setFormData({
      claimDate: new Date().toISOString().split("T")[0],
      claimType: "",
      claimAmount: "",
      currency: "PLN",
      status: "Złożone",
      description: "",
      documentDescription: "",
    })
    setEditingClaim(null)
    setSelectedFile(null)
    setIsEditing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const calculateTotalsByCurrency = useCallback(() => {
    const totals: { [key: string]: number } = {}
    clientClaims.forEach((claim) => {
      if (claim.amount && claim.currency) {
        const currency = claim.currency
        totals[currency] = (totals[currency] || 0) + claim.amount
      }
    })
    return totals
  }, [clientClaims])

  const totalsByCurrency = calculateTotalsByCurrency()

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

    if (!formData.claimDate || !formData.claimType || !formData.claimAmount || !formData.status) {
      toast({
        title: "Błąd",
        description: "Wypełnij wszystkie wymagane pola",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const claimData: ClientClaim = {
        id: editingClaim?.id || crypto.randomUUID(),
        eventId: claimId,
        claimDate: formData.claimDate,
        claimType: formData.claimType,
        amount: Number.parseFloat(formData.claimAmount),
        currency: formData.currency,
        status: formData.status as any,
        description: formData.description,
        documentDescription: formData.documentDescription,
        document: selectedFile
          ? {
              id: crypto.randomUUID(),
              name: selectedFile.name,
              size: selectedFile.size,
              type: selectedFile.type,
              uploadedAt: new Date().toISOString(),
            }
          : editingClaim?.document,
        claimId,
        createdAt: editingClaim?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (editingClaim) {
        onClientClaimsChange(clientClaims.map((claim) => (claim.id === editingClaim.id ? claimData : claim)))
        toast({
          title: "Sukces",
          description: "Roszczenie zostało zaktualizowane",
        })
      } else {
        onClientClaimsChange([...clientClaims, claimData])
        toast({
          title: "Sukces",
          description: "Roszczenie zostało dodane",
        })
      }

      resetForm()
      setIsFormVisible(false)
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Wystąpił błąd podczas zapisywania roszczenia",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (claim: ClientClaim) => {
    setEditingClaim(claim)
    setIsEditing(true)
    setFormData({
      claimDate: claim.claimDate,
      claimType: claim.claimType,
      claimAmount: claim.amount?.toString() || "",
      currency: claim.currency || "PLN",
      status: claim.status,
      description: claim.description || "",
      documentDescription: claim.documentDescription || "",
    })
    setIsFormVisible(true)
  }

  const handleDelete = (claimId: string) => {
    onClientClaimsChange(clientClaims.filter((claim) => claim.id !== claimId))
    toast({
      title: "Sukces",
      description: "Roszczenie zostało usunięte",
    })
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)

    // Check for Outlook drag
    const types = e.dataTransfer?.types || []
    if (types.includes("Files") || types.includes("application/x-moz-file")) {
      setOutlookDragActive(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setOutlookDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setOutlookDragActive(false)

    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          const file = items[i].getAsFile()
          if (file) {
            e.preventDefault()
            setSelectedFile(file)
            return
          }
        }
      }
    }
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Zaakceptowane":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Zaakceptowane
          </Badge>
        )
      case "Odrzucone":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Odrzucone
          </Badge>
        )
      case "W trakcie analizy":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />W trakcie analizy
          </Badge>
        )
      case "Częściowo zaakceptowane":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Częściowo zaakceptowane
          </Badge>
        )
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Złożone
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL")
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} ${currency}`
  }

  const isPreviewable = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    return ["pdf", "jpg", "jpeg", "png", "gif"].includes(extension || "")
  }

  const previewFile = async (claim: ClientClaim) => {
    if (!claim.document) return

    try {
      const response = await fetch(`/api/client-claims/${claim.id}/preview`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const extension = claim.document.name.split(".").pop()?.toLowerCase()
      const fileType = extension === "pdf" ? "pdf" : "image"

      setPreviewModal({
        isOpen: true,
        url,
        fileName: claim.document.name,
        fileType,
        claim,
      })
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wczytać podglądu",
        variant: "destructive",
      })
    }
  }

  const downloadFile = async (claim: ClientClaim) => {
    if (!claim.document) return

    try {
      const response = await fetch(`/api/client-claims/${claim.id}/download`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = claim.document.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać pliku",
        variant: "destructive",
      })
    }
  }

  const closePreview = () => {
    if (previewModal.url) {
      URL.revokeObjectURL(previewModal.url)
    }
    setPreviewModal({
      isOpen: false,
      url: "",
      fileName: "",
      fileType: "",
      claim: null,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-md mb-4 border border-[#d1d9e6]">
        <div className="text-[#1a3a6c]">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#1a3a6c]">Roszczenia klienta</h2>
        </div>
      </div>

      {/* Add/Edit Client Claim Form Toggle Button */}
      <div className="mb-4 flex justify-end">
        <Button
          onClick={toggleForm}
          className="bg-[#1a3a6c] text-white px-4 py-2 rounded hover:bg-[#15305a] transition-colors flex items-center gap-2"
        >
          {isFormVisible ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isFormVisible ? "Ukryj formularz" : "Dodaj nowe roszczenie"}
        </Button>
      </div>

      {/* Add New Client Claim Form */}
      {isFormVisible && (
        <div className="bg-white rounded-lg border border-[#d1d9e6] overflow-hidden mb-6 shadow-sm">
          <div className="p-4 bg-[#f8fafc] border-b border-[#d1d9e6]">
            <h3 className="text-md font-semibold text-[#1a3a6c]">
              {isEditing ? "Edytuj roszczenie" : "Dodaj nowe roszczenie"}
            </h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="claimDate" className="text-sm font-medium text-gray-700">
                    Data złożenia roszczenia *
                  </Label>
                  <Input
                    id="claimDate"
                    type="date"
                    value={formData.claimDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, claimDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="claimType" className="text-sm font-medium text-gray-700">
                    Rodzaj roszczenia *
                  </Label>
                  <Select
                    value={formData.claimType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, claimType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz rodzaj..." />
                    </SelectTrigger>
                    <SelectContent>
                      {claimTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status roszczenia *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="claimAmount" className="text-sm font-medium text-gray-700">
                    Kwota roszczenia *
                  </Label>
                  <Input
                    id="claimAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.claimAmount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, claimAmount: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                    Waluta
                  </Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Opis roszczenia
                </Label>
                <Textarea
                  id="description"
                  placeholder="Szczegółowy opis roszczenia..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Załącz dokumenty roszczenia</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
                  } ${outlookDragActive ? "border-blue-600 bg-blue-100" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {outlookDragActive && (
                    <div className="absolute inset-0 bg-blue-100 flex items-center justify-center rounded-lg">
                      <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                        <Upload className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                        <p className="text-blue-600 font-medium">Upuść załącznik z Outlooka tutaj</p>
                      </div>
                    </div>
                  )}

                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Kliknij, aby wybrać plik lub przeciągnij i upuść</p>
                  <p className="text-xs text-gray-500 mb-4">Obsługiwane formaty: PDF, DOC, DOCX, JPG, PNG</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Wybierz plik
                  </Button>
                </div>

                {selectedFile && (
                  <div className="mt-4 p-3 bg-gray-50 rounded border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={removeSelectedFile}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-2">
                      <Label htmlFor="documentDescription" className="text-sm font-medium text-gray-700">
                        Opis dokumentu
                      </Label>
                      <Input
                        id="documentDescription"
                        placeholder="Dodaj opis dokumentu..."
                        value={formData.documentDescription}
                        onChange={(e) => setFormData((prev) => ({ ...prev, documentDescription: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>Możesz przeciągnąć załącznik bezpośrednio z Outlooka lub wkleić go ze schowka (Ctrl+V)</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="bg-blue-50 p-3 rounded border border-blue-200 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">
                      Suma roszczeń:
                      {Object.keys(totalsByCurrency).length > 0 ? (
                        Object.entries(totalsByCurrency).map(([currency, amount], index) => (
                          <span key={currency} className="ml-1">
                            <span className="font-bold">
                              {amount.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} {currency}
                            </span>
                            {index < Object.keys(totalsByCurrency).length - 1 ? "; " : ""}
                          </span>
                        ))
                      ) : (
                        <span className="font-bold ml-1">0.00 PLN</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={cancelForm} className="px-6 bg-transparent">
                    Anuluj
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isEditing ? "Zapisz zmiany" : "Dodaj roszczenie"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Claims List */}
      {!isFormVisible && (
        <div className="bg-white rounded-lg border border-[#d1d9e6] overflow-hidden shadow-sm">
          <div className="p-4 bg-[#f8fafc] border-b border-[#d1d9e6] flex flex-row items-center justify-between">
            <h3 className="text-md font-semibold text-[#1a3a6c]">Lista roszczeń</h3>
            <div className="text-sm text-gray-500">
              {Object.keys(totalsByCurrency).length > 0 ? (
                <>
                  Łączne kwoty roszczeń:
                  {Object.entries(totalsByCurrency).map(([currency, amount], index) => (
                    <span key={currency} className="ml-1">
                      <span className="font-bold text-primary">
                        {amount.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} {currency}
                      </span>
                      {index < Object.keys(totalsByCurrency).length - 1 ? "; " : ""}
                    </span>
                  ))}
                </>
              ) : (
                <>
                  Łączna kwota roszczeń: <span className="font-bold text-primary">0.00 PLN</span>
                </>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            {clientClaims.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Brak roszczeń do wyświetlenia</p>
                <p className="text-sm text-gray-400">Wyświetlanie 0 z 0 roszczeń</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Data</th>
                    <th className="py-3 px-4 text-left font-medium">Rodzaj</th>
                    <th className="py-3 px-4 text-left font-medium">Kwota</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Opis</th>
                    <th className="py-3 px-4 text-left font-medium">Dokument</th>
                    <th className="py-3 px-4 text-center font-medium">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {clientClaims.map((claim) => (
                    <tr key={claim.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(claim.claimDate)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {claim.claimType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">
                            {formatCurrency(claim.amount || 0, claim.currency || "PLN")}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(claim.status)}</td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs">
                          <p className="text-sm truncate" title={claim.description}>
                            {claim.description || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {claim.document ? (
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-600">
                              {claim.documentDescription || "Załącznik"}
                            </span>
                            <div className="flex gap-1">
                              {isPreviewable(claim.document.name) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => previewFile(claim)}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadFile(claim)}
                                className="text-green-600 hover:text-green-800 p-1"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Brak</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(claim)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                                title="Usuń"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Czy na pewno chcesz usunąć to roszczenie?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Ta akcja nie może być cofnięta. Roszczenie zostanie trwale usunięte.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(claim.id)}
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
            )}
          </div>
          <div className="p-4 bg-muted/50 border-t flex justify-center">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>
                Wyświetlanie {clientClaims.length > 0 ? `1-${clientClaims.length}` : "0"} z {clientClaims.length}{" "}
                roszczeń
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Dialog open={previewModal.isOpen} onOpenChange={closePreview}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Podgląd: {previewModal.fileName}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto flex items-center justify-center bg-muted/50 rounded-lg">
            {previewModal.fileType === "pdf" ? (
              <iframe src={previewModal.url} className="w-full h-[70vh] border-0" title="Document Preview" />
            ) : previewModal.fileType === "image" ? (
              <img
                src={previewModal.url || "/placeholder.svg"}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : (
              <div className="text-center p-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Podgląd niedostępny dla tego typu pliku.</p>
                <p className="text-gray-500 text-sm mt-2">Możesz pobrać plik, aby go otworzyć.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => previewModal.claim && downloadFile(previewModal.claim)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Pobierz plik
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
