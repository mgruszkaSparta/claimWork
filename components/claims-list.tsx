"use client"

import { useState, useEffect, useMemo, useRef, type ComponentType } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  Loader2,
  X,
  ChevronUp,
  ChevronDown,
  Car,
  Home,
  Truck,
} from "lucide-react"



import { useClaims } from "@/hooks/use-claims"
import { useToast } from "@/hooks/use-toast"
import type { Claim } from "@/types"


const RISK_TYPE_GROUPS: Record<string, string[]> = {
  "1": [
    "OC DZIAŁALNOŚCI",
    "OC SPRAWCY",
    "OC PPM",
    "AC",
    "NAPRAWA WŁASNA",
    "OC W ŻYCIU PRYWATNYM",
    "OC ROLNIKA",
    "INNE",
  ],
  "2": ["MAJĄTKOWE", "NNW", "CPM", "CAR/EAR", "BI", "GWARANCJIE"],
  "3": ["OCPD", "CARGO"],
}

const typeLabelMap: Record<number, string> = {
  1: "Komunikacyjna",
  2: "Majątkowa",
  3: "Transportowa",
}

const typeIconMap: Record<number, ComponentType<{ className?: string }>> = {
  1: Car,
  2: Home,
  3: Truck,
}

interface ClaimsListProps {
  claims?: Claim[]
  onEditClaim?: (claimId: string) => void
  onNewClaim?: () => void
  claimObjectTypeId?: string
}

export function ClaimsList({
  claims: initialClaims,
  onEditClaim,
  onNewClaim,
  claimObjectTypeId,
}: ClaimsListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterBrand, setFilterBrand] = useState("")
  const [filterHandler, setFilterHandler] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{
    field: string
    direction: "asc" | "desc"
  } | null>(null)
  const pageSize = 30
  const [sortBy, setSortBy] = useState<string>("reportDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const {
    claims: fetchedClaims,
    loading,
    error,
    deleteClaim,
    fetchClaims,
    clearError,
    totalCount,
  } = useClaims()
  const { toast } = useToast()

  const claims = initialClaims?.length ? initialClaims : fetchedClaims
  const totalRecords = initialClaims?.length ? initialClaims.length : totalCount

  useEffect(() => {
    setSearchInput(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    if (initialClaims?.length) return

    const loadClaims = async () => {
      try {
        await fetchClaims(
          {
            page,
            pageSize,
            search: searchTerm,
            status: filterStatus !== "all" ? filterStatus : undefined,
            brand: filterBrand || undefined,
            handler: filterHandler || undefined,
            claimObjectTypeId,
            sortBy,
            sortOrder,
          },
          { append: page > 1 },
        )
      } catch (err) {
        toast({
          title: "Błąd",
          description: "Nie udało się pobrać listy szkód.",
          variant: "destructive",
        })
      }
    }
    loadClaims()
  }, [
    fetchClaims,
    toast,
    page,
    pageSize,
    searchTerm,
    filterStatus,
    filterBrand,
    filterHandler,
    claimObjectTypeId,
    sortBy,
    sortOrder,
    initialClaims,

  ])

  // TODO: consider moving this filtering to use-claims or the API to reduce client workload
  const allowedRiskTypes = useMemo(
    () =>
      claimObjectTypeId
        ? RISK_TYPE_GROUPS[claimObjectTypeId]?.map((type) => type.toLowerCase())
        : undefined,
    [claimObjectTypeId],
  )

  const filteredClaims = useMemo(
    () =>
      claims.filter((claim) => {
        const matchesFilter = filterStatus === "all" || claim.status === filterStatus
        const matchesBrand =
          !filterBrand || claim.vehicleNumber?.toLowerCase().includes(filterBrand.toLowerCase())
        const matchesHandler =
          !filterHandler || claim.handler?.toLowerCase().includes(filterHandler.toLowerCase())
        const matchesClaimType =
          !allowedRiskTypes ||
          !claim.riskType ||
          allowedRiskTypes.includes(claim.riskType.toLowerCase())

        return matchesFilter && matchesBrand && matchesHandler && matchesClaimType
      }),
    [claims, filterStatus, filterBrand, filterHandler, allowedRiskTypes],
  )

  const sortedClaims = useMemo(() => {
    if (!sortConfig) return filteredClaims
    const { field, direction } = sortConfig
    return [...filteredClaims].sort((a: any, b: any) => {
      const aVal = a?.[field] ?? 0
      const bVal = b?.[field] ?? 0
      if (aVal < bVal) return direction === "asc" ? -1 : 1
      if (aVal > bVal) return direction === "asc" ? 1 : -1
      return 0
    })
  }, [filteredClaims, sortConfig])

  useEffect(() => {

    if (initialClaims?.length) return

    const node = loaderRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          claims.length < totalRecords
        ) {
          setPage((p) => p + 1)
        }
      },
      { root: containerRef.current || undefined },
    )
    if (node) {
      observer.observe(node)
    }
    return () => {
      if (node) {
        observer.unobserve(node)
      }
    }

  }, [loading, claims.length, totalRecords, initialClaims])


  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "NOWA SZKODA":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "W TRAKCIE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "ZAKOŃCZONA":
        return "bg-green-100 text-green-800 border-green-200"
      case "ODRZUCONA":
        return "bg-red-100 text-red-800 border-red-200"
      case "ZAWIESZONA":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleSort = (field: string) => {

    setSortConfig((prev) => {
      if (prev?.field === field) {
        return {
          field,
          direction: prev.direction === "asc" ? "desc" : "asc",
        }
      }
      return { field, direction: "asc" }
    })

  }

  const renderSortIcon = (field: string) => {
    if (sortConfig?.field !== field) return null
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="inline h-3 w-3 ml-1" />
    ) : (
      <ChevronDown className="inline h-3 w-3 ml-1" />
    )
  }

  const handleDeleteClaim = async (claimId: string | undefined, claimNumber: string | undefined) => {
    if (!claimId) return

    if (window.confirm(`Czy na pewno chcesz usunąć szkodę ${claimNumber}?`)) {
      try {
        const success = await deleteClaim(claimId)
        if (success) {
          toast({
            title: "Szkoda usunięta",
            description: `Szkoda ${claimNumber} została pomyślnie usunięta.`,
          })
        } else {
          toast({
            title: "Błąd",
            description: "Nie udało się usunąć szkody " + claimNumber + ".",
            variant: "destructive",
          })
        }
      } catch (err) {
        toast({
          title: "Błąd",
          description: "Wystąpił problem podczas usuwania szkody " + claimNumber + ".",
          variant: "destructive",
        })
      }
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      setPage(1)
      await fetchClaims(
        {
          page: 1,
          pageSize,
          search: searchTerm,
          status: filterStatus !== "all" ? filterStatus : undefined,
          brand: filterBrand || undefined,
          handler: filterHandler || undefined,
          claimObjectTypeId,
          sortBy,
          sortOrder,
        },
        { append: false },
      )
      toast({
        title: "Odświeżono",
        description: "Lista szkód została odświeżona.",
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nieznany błąd"
      toast({
        title: "Błąd",
        description: "Nie udało się odświeżyć listy szkód: " + message,
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleViewClaim = (claimId: string) => {
    router.push(`/claims/${claimId}/view`)
  }

  const handleEditClaimDirect = (claimId: string) => {
    router.push(`/claims/${claimId}/edit`)
  }

  const handleNewClaimDirect = () => {
    router.push("/claims/new")
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-full bg-white flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Lista Szkód</h1>
          <Button disabled className="bg-[#1a3a6c] hover:bg-[#1a3a6c]/90 text-sm">
            <Plus className="h-3 w-3 mr-1" />
            Nowa Szkoda
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#1a3a6c] mx-auto mb-3" />
            <p className="text-sm text-gray-600">Ładowanie szkód z serwera...</p>
            <p className="text-xs text-gray-400 mt-1">To może potrwać kilka sekund</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold text-gray-900">Lista Szkód</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
            title="Odśwież listę"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalCount} szkód
            </Badge>
          )}
        </div>
        <Button className="bg-[#1a3a6c] hover:bg-[#1a3a6c]/90 text-sm" onClick={onNewClaim || handleNewClaimDirect}>
          <Plus className="h-3 w-3 mr-1" />
          Nowa Szkoda
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-6 pb-0 flex-shrink-0">
          <Alert variant="destructive" className="relative">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="pr-8">
              <strong>Błąd połączenia z serwerem:</strong> {error}
              <br />
              <span className="text-sm">Sprawdź połączenie z API lub konfigurację backendu.</span>
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={clearError}
            >
              <X className="h-3 w-3" />
            </Button>
          </Alert>
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-6 pb-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Szukaj po numerze pojazdu, szkody, kliencie lub likwidatorze..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  setPage(1)
                  setSearchTerm(searchInput)
                }
              }}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a3a6c] focus:border-[#1a3a6c] bg-white"
            >
              <option value="all">Wszystkie statusy</option>
              <option value="NOWA SZKODA">Nowa szkoda</option>
              <option value="W TRAKCIE">W trakcie</option>
              <option value="ZAKOŃCZONA">Zakończona</option>
              <option value="ODRZUCONA">Odrzucona</option>
              <option value="ZAWIESZONA">Zawieszona</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-sm bg-white"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-3 w-3 mr-1" />
              Filtry
            </Button>
          </div>
        </div>
        {showFilters && (
          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Filtruj po numerze rejestracyjnym..."
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="h-9 text-sm"
            />
            <Input
              placeholder="Filtruj po opiekunie..."
              value={filterHandler}
              onChange={(e) => setFilterHandler(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        )}
      </div>

      {/* Claims Table */}
      <div className="flex-1 px-6 pb-4 overflow-hidden">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
          <div ref={containerRef} className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>

                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("objectTypeId")}
                  >
                    Typ
                    {sortConfig?.field === "objectTypeId" && (
                      sortConfig.direction === "asc" ? (
                        <ChevronUp className="inline h-3 w-3 ml-1" />
                      ) : (
                        <ChevronDown className="inline h-3 w-3 ml-1" />
                      )
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nr szkody TU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nr szkody Sparta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nr rejestracyjny
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Likwidator

                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("client")}>
                      Grupa klienta
                      {renderSortIcon("client")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("reportDate")}>
                      Data rejestracji
                      {renderSortIcon("reportDate")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("riskType")}>
                      Ryzyko
                      {renderSortIcon("riskType")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort("status")}>
                      Status
                      {renderSortIcon("status")}
                    </div>

                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors"
                  >


                    <td className="px-6 py-4 whitespace-nowrap">
                      {claim.objectTypeId ? (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = typeIconMap[claim.objectTypeId as number]
                            return Icon ? <Icon className="h-4 w-4" /> : null
                          })()}
                          <span>{typeLabelMap[claim.objectTypeId as number]}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{claim.insurerClaimNumber || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{claim.spartaNumber || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{claim.vehicleNumber || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{claim.handler || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{claim.client || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {claim.reportDate ? new Date(claim.reportDate).toLocaleDateString("pl-PL") : "-"}

                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{claim.riskType || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`text-xs border ${getStatusColor(claim.status ?? "")}`}>
                        {claim.status || "-"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-50"
                          onClick={() => claim.id && handleViewClaim(claim.id)}
                          title="Podgląd"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-green-50"
                          onClick={() =>
                            claim.id && (onEditClaim ? onEditClaim(claim.id) : handleEditClaimDirect(claim.id))
                          }
                          title="Edytuj"
                        >
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          onClick={() => handleDeleteClaim(claim.id, claim.claimNumber)}
                          title="Usuń"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && page > 1 && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-[#1a3a6c]" />
              </div>
            )}
            <div ref={loaderRef} />
          </div>

          {/* Empty State */}
          {sortedClaims.length === 0 && !loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {searchTerm || filterStatus !== "all" ? "Brak szkód spełniających kryteria" : "Brak szkód w systemie"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchTerm || filterStatus !== "all"
                    ? "Spróbuj zmienić kryteria wyszukiwania"
                    : "Dodaj pierwszą szkodę, aby rozpocząć"}
                </p>
                {!searchTerm && filterStatus === "all" && (
                  <Button className="bg-[#1a3a6c] hover:bg-[#1a3a6c]/90" onClick={onNewClaim || handleNewClaimDirect}>
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj pierwszą szkodę
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {sortedClaims.length > 0 && (
        <div className="px-6 pb-6 flex-shrink-0">
          <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
            <span>
              Wyświetlono {sortedClaims.length} z {totalCount} szkód
              {error && " (sprawdź połączenie z API)"}
            </span>
            <span>
              Łączna wartość:{" "}
              {sortedClaims.reduce((sum, claim) => sum + (claim.totalClaim || 0), 0).toLocaleString("pl-PL")} PLN
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
