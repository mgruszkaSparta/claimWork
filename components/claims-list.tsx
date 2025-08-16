"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Plus, Filter, Eye, Edit, Trash2, RefreshCw, AlertCircle, Loader2, X } from "lucide-react"
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

const typeIconMap: Record<number, string> = {
  1: "directions_car",
  2: "home",
  3: "local_shipping",
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
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterBrand, setFilterBrand] = useState("")
  const [filterHandler, setFilterHandler] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 30
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
      claims
        .filter((claim) => {
          const lowerCaseSearchTerm = searchTerm.toLowerCase()
          const matchesSearch =
            claim.vehicleNumber?.toLowerCase().includes(lowerCaseSearchTerm) ||
            claim.claimNumber?.toLowerCase().includes(lowerCaseSearchTerm) ||
            claim.spartaNumber?.toLowerCase().includes(lowerCaseSearchTerm) ||
            claim.client?.toLowerCase().includes(lowerCaseSearchTerm) ||
            claim.liquidator?.toLowerCase().includes(lowerCaseSearchTerm) ||
            claim.brand?.toLowerCase().includes(lowerCaseSearchTerm)

          const matchesFilter = filterStatus === "all" || claim.status === filterStatus
          const matchesBrand =
            !filterBrand || claim.brand?.toLowerCase().includes(filterBrand.toLowerCase())
          const matchesHandler =
            !filterHandler || claim.liquidator?.toLowerCase().includes(filterHandler.toLowerCase())
          const matchesClaimType =
            !allowedRiskTypes ||
            !claim.riskType ||
            allowedRiskTypes.includes(claim.riskType.toLowerCase())

          return (
            matchesSearch &&
            matchesFilter &&
            matchesBrand &&
            matchesHandler &&
            matchesClaimType
          )
        }),
    [
      claims,
      searchTerm,
      filterStatus,
      filterBrand,
      filterHandler,
      allowedRiskTypes,
    ],
  )

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              placeholder="Filtruj po marce..."
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="h-9 text-sm"
            />
            <Input
              placeholder="Filtruj po likwidatorze..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pojazd
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numer Szkody
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Klient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Szkody
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wartość
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <mat-icon
                        matTooltip={typeLabelMap[claim.objectTypeId ?? 0] || "Nieznany typ"}
                        aria-label={typeLabelMap[claim.objectTypeId ?? 0] || "Nieznany typ"}
                      >
                        {typeIconMap[claim.objectTypeId ?? 0] || "help_outline"}
                      </mat-icon>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{claim.vehicleNumber || "-"}</div>
                        <div className="text-sm text-gray-500">{claim.brand || "-"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{claim.spartaNumber || "-"}</div>
                        <div className="text-sm text-gray-500">{claim.claimNumber || "-"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={claim.client}>
                        {claim.client || "-"}
                      </div>
                      <div className="text-sm text-gray-500">{claim.liquidator || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`text-xs border ${getStatusColor(claim.status ?? "")}`}>
                        {claim.status || "-"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {claim.damageDate ? new Date(claim.damageDate).toLocaleDateString("pl-PL") : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {claim.totalClaim
                          ? `${claim.totalClaim.toLocaleString("pl-PL")} ${claim.currency || "PLN"}`
                          : "0 PLN"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Wypłata:{" "}
                        {claim.payout ? `${claim.payout.toLocaleString("pl-PL")} ${claim.currency || "PLN"}` : "0 PLN"}
                      </div>
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
                          onClick={() => handleDeleteClaim(claim.id, claim.spartaNumber)}
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
          {filteredClaims.length === 0 && !loading && (
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
      {filteredClaims.length > 0 && (
        <div className="px-6 pb-6 flex-shrink-0">
          <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
            <span>
              Wyświetlono {filteredClaims.length} z {totalCount} szkód
              {error && " (sprawdź połączenie z API)"}
            </span>
            <span>
              Łączna wartość:{" "}
              {filteredClaims.reduce((sum, claim) => sum + (claim.totalClaim || 0), 0).toLocaleString("pl-PL")} PLN
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
