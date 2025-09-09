"use client"

import { useState, useEffect, useMemo, useRef, type ComponentType } from "react"
import type { ClaimsListProps } from "./claims-list.types"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination"

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
import { useAuth } from "@/hooks/use-auth"
import type { Claim } from "@/types"
import { dictionaryService } from "@/lib/dictionary-service"

import HandlerDropdown from "@/components/handler-dropdown"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


const FILTER_STORAGE_KEY = "claimsListFilters"

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


export function ClaimsListDesktop({
  claims: initialClaims,
  onEditClaim,
  onNewClaim,
  claimObjectTypeId,
  totalCount: initialTotalCount,
}: ClaimsListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [filterStatuses, setFilterStatuses] = useState<string[]>([])
  const [claimStatuses, setClaimStatuses] = useState<
    { id: number; code: string; name: string; color?: string }[]
  >([])
  const [filterRisks, setFilterRisks] = useState<string[]>([])
  const [filterObjectTypeId, setFilterObjectTypeId] = useState(
    claimObjectTypeId || "all",
  )
  const [riskTypes, setRiskTypes] = useState<
    { id: number; code: string; name: string; claimObjectTypeId?: number }[]
  >([])
  const [filterRegistration, setFilterRegistration] = useState("")
  const [filterHandlerId, setFilterHandlerId] = useState("")
  const [substituteOptions, setSubstituteOptions] = useState<
    { id: string; name: string }[]
  >([])
  const [selectedSubstituteId, setSelectedSubstituteId] = useState("")
  type DateFilterType =
    | "reportDate"
    | "damageDate"
    | "registrationDate"
    | "insurerReportDate"
  const [dateFilters, setDateFilters] = useState<
    { type: DateFilterType; from: string; to: string }[]
  >([])
  const [showFilters, setShowFilters] = useState(false)
  const [showMyClaims, setShowMyClaims] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 50
  const [sortBy, setSortBy] = useState<string>("spartaNumber")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [initialized, setInitialized] = useState(false)

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        searchInput ||
        filterObjectTypeId !== "all" ||
        filterStatuses.length ||
        filterRisks.length ||
        filterRegistration ||
        filterHandlerId ||
        dateFilters.length ||
        showMyClaims ||
        selectedSubstituteId,
      ),
    [
      searchInput,
      filterObjectTypeId,
      filterStatuses,
      filterRisks,
      filterRegistration,
      filterHandlerId,
      dateFilters,
      showMyClaims,
      selectedSubstituteId,
    ],
  )

  const clearFilters = () => {
    setSearchInput("")
    setSearchTerm("")
    setFilterStatuses([])
    setFilterRisks([])
    setFilterObjectTypeId("all")
    setFilterRegistration("")
    setFilterHandlerId("")
    setDateFilters([])
    setShowFilters(false)
    setShowMyClaims(false)
    setSelectedSubstituteId("")
    setPage(1)
    if (typeof window !== "undefined") {
      localStorage.removeItem(FILTER_STORAGE_KEY)
    }
  }

  const toggleStatus = (value: string) => {
    setFilterStatuses((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    )
  }

  const toggleRisk = (value: string) => {
    setFilterRisks((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    )
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem(FILTER_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSearchTerm(parsed.searchTerm || "")
        setSearchInput(parsed.searchTerm || "")
        setFilterStatuses(parsed.filterStatuses || [])
        setFilterRisks(parsed.filterRisks || [])
        setFilterObjectTypeId(parsed.filterObjectTypeId || "all")
        setFilterRegistration(parsed.filterRegistration || "")
        setFilterHandlerId(parsed.filterHandlerId || "")
        setDateFilters(parsed.dateFilters || [])
        setShowMyClaims(parsed.showMyClaims || false)
        setSelectedSubstituteId(parsed.selectedSubstituteId || "")
        setPage(parsed.page || 1)
        setSortBy(parsed.sortBy || "spartaNumber")
        setSortOrder(parsed.sortOrder || "desc")
      } catch (e) {
        console.error("Failed to load claim filters", e)
      }
    }
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (!initialized || typeof window === "undefined") return
    const data = {
      searchTerm,
      filterStatuses,
      filterRisks,
      filterObjectTypeId,
      filterRegistration,
      filterHandlerId,
      dateFilters,
      showMyClaims,
      selectedSubstituteId,
      page,
      sortBy,
      sortOrder,
    }
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(data))
  }, [
    initialized,
    searchTerm,
    filterStatuses,
    filterRisks,
    filterObjectTypeId,
    filterRegistration,
    filterHandlerId,
    dateFilters,
    showMyClaims,
    selectedSubstituteId,
    page,
    sortBy,
    sortOrder,
  ])

  const {
    claims: fetchedClaims,
    loading,
    error,
    deleteClaim,
    fetchClaims,
    clearError,
    totalCount: fetchedTotalCount,
  } = useClaims()
  const { toast } = useToast()
  const { user } = useAuth()
  const isAdmin = user?.roles?.some((r) => r.toLowerCase() === "admin")

  const claims = initialClaims?.length ? initialClaims : fetchedClaims
  const totalCount = initialClaims?.length
    ? initialTotalCount ?? initialClaims.length
    : fetchedTotalCount

  useEffect(() => {
    setSearchInput(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    const loadStatuses = async () => {
      try {

        const data = await dictionaryService.getClaimStatuses()

        setClaimStatuses(
          (data.items ?? []) as {
            id: number
            code: string
            name: string
            color?: string
          }[],
        )
      } catch (error) {
        console.error("Error loading claim statuses:", error)
      }
    }
    loadStatuses()
  }, [])

  useEffect(() => {
    const loadRiskTypes = async () => {
      try {
        const responses = await Promise.all(
          [1, 2, 3].map(async (type) => {
            const data = await dictionaryService.getRiskTypes(String(type))
            return (data.items ?? []).map((item) => ({
              ...item,
              claimObjectTypeId: type,
            }))
          }),
        )

        const allItems = responses.flat()

        setRiskTypes(
          allItems as {
            id: number
            code: string
            name: string
            claimObjectTypeId?: number
          }[],
        )
      } catch (error) {
        console.error("Error loading risk types:", error)
        setRiskTypes([])
      }
    }
    loadRiskTypes()
  }, [])

  useEffect(() => {
    const loadSubstitutions = async () => {
      if (!user?.id) return
      try {
        const res = await fetch("/api/leaves")
        const leaves = await res.json()
        const today = new Date()
        const options: { id: string; name: string }[] = leaves
          .filter(
            (l: any) =>
              l.substituteId === user.id &&
              l.status === "APPROVED" &&
              new Date(l.startDate) <= today &&
              new Date(l.endDate) >= today,
          )
          .map((l: any) => ({
            id: String(l.caseHandlerId),
            name: `Pokaż szkody ${l.employeeName}`,
          }))

        const myLeaves = leaves.filter(
          (l: any) =>
            l.employeeId === user.id &&
            l.substituteId &&
            l.status === "APPROVED" &&
            new Date(l.startDate) <= today &&
            new Date(l.endDate) >= today,
        )

        const substituteButtons = await Promise.all(
          myLeaves.map(async (l: any) => {
            try {
              const substitute = await apiService.getUser(l.substituteId)
              if (substitute.caseHandlerId) {
                return {
                  id: String(substitute.caseHandlerId),
                  name: `Pokaż szkody ${l.substituteName || substitute.userName}`,
                }
              }
            } catch (error) {
              console.error("Failed to load substitute user", error)
            }
            return null
          }),
        )

        options.push(
          ...substituteButtons.filter((o): o is { id: string; name: string } => Boolean(o)),
        )

        const unique = Array.from(
          new Map(options.map((o: any) => [o.id, o])).values(),
        )
        setSubstituteOptions(unique)
      } catch (err) {
        console.error("Failed to load leaves", err)
      }
    }
    loadSubstitutions()
  }, [user?.id])

  useEffect(() => {
    if (!initialized) return
    if (initialClaims?.length && page === 1) return

    const loadClaims = async () => {
      try {
        const reportFilter = dateFilters.find((f) => f.type === "reportDate")
        const damageFilter = dateFilters.find((f) => f.type === "damageDate")
        const registrationFilter = dateFilters.find(
          (f) => f.type === "registrationDate",
        )
        const insurerReportFilter = dateFilters.find(
          (f) => f.type === "insurerReportDate",
        )
        await fetchClaims({
          page,
          pageSize,
          search: searchTerm,
          status: filterStatuses.length
            ? filterStatuses.join(",")
            : undefined,
          riskType: filterRisks.length
            ? filterRisks.join(",")
            : undefined,
          brand: filterRegistration || undefined,
          caseHandlerId: showMyClaims
            ? user?.caseHandlerId
            : selectedSubstituteId
            ? parseInt(selectedSubstituteId, 10)
            : filterHandlerId
            ? parseInt(filterHandlerId, 10)
            : undefined,
          registeredById:
            showMyClaims && !user?.caseHandlerId ? user?.id : undefined,
          claimObjectTypeId:
            filterObjectTypeId !== "all" ? filterObjectTypeId : undefined,
          sortBy,
          sortOrder,
          reportFromDate: reportFilter?.from || undefined,
          reportToDate: reportFilter?.to || undefined,
          damageFromDate: damageFilter?.from || undefined,
          damageToDate: damageFilter?.to || undefined,
          registrationFromDate: registrationFilter?.from || undefined,
          registrationToDate: registrationFilter?.to || undefined,
          reportToInsurerFromDate: insurerReportFilter?.from || undefined,
          reportToInsurerToDate: insurerReportFilter?.to || undefined,
        })

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
    filterStatuses,
    filterRisks,
    filterRegistration,
    filterHandlerId,
    selectedSubstituteId,
    showMyClaims,
    user?.caseHandlerId,
    user?.id,
    dateFilters,
    filterObjectTypeId,
    sortBy,
    sortOrder,
    initialClaims,
    initialized,

  ])
  const claimStatusMap = useMemo(() => {
    const map: Record<number, { name: string; color?: string }> = {}
    claimStatuses.forEach((s) => {
      map[s.id] = { name: s.name, color: s.color }
    })
    return map
  }, [claimStatuses])

  const riskTypeMap = useMemo(() => {
    const map: Record<string, string> = {}
    riskTypes.forEach((r) => {
      map[String(r.id)] = r.name
    })
    return map
  }, [riskTypes])

  const totalClaimAmount = useMemo(
    () => claims.reduce((sum, claim) => sum + (claim.totalClaim || 0), 0),
    [claims],
  )
  const totalPages = Math.ceil((totalCount || 0) / pageSize)

  const handleSort = (field: string) => {
    setPage(1)
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === "asc" ? (
      <ChevronUp className="inline h-3 w-3 ml-1" />
    ) : (
      <ChevronDown className="inline h-3 w-3 ml-1" />
    )
  }

  const handleDeleteClaim = async (claimId: string | undefined, claimNumber: string | undefined) => {
    if (!claimId) return
    if (!isAdmin) {
      toast({
        title: "Brak uprawnień",
        description: "Tylko administrator może usuwać szkody.",
        variant: "destructive",
      })
      return
    }

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
      const reportFilter = dateFilters.find((f) => f.type === "reportDate")
      const damageFilter = dateFilters.find((f) => f.type === "damageDate")
      const registrationFilter = dateFilters.find(
        (f) => f.type === "registrationDate",
      )
      const insurerReportFilter = dateFilters.find(
        (f) => f.type === "insurerReportDate",
      )
      await fetchClaims(
        {
          page: 1,
          pageSize,
          search: searchTerm,
          status: filterStatuses.length
            ? filterStatuses.join(",")
            : undefined,
          riskType: filterRisks.length
            ? filterRisks.join(",")
            : undefined,
          brand: filterRegistration || undefined,
          caseHandlerId: showMyClaims
            ? user?.caseHandlerId
            : selectedSubstituteId
            ? parseInt(selectedSubstituteId, 10)
            : filterHandlerId
            ? parseInt(filterHandlerId, 10)
            : undefined,
          registeredById:
            showMyClaims && !user?.caseHandlerId ? user?.id : undefined,
          claimObjectTypeId:
            filterObjectTypeId !== "all" ? filterObjectTypeId : undefined,
          sortBy,
          sortOrder,
          reportFromDate: reportFilter?.from || undefined,
          reportToDate: reportFilter?.to || undefined,
          damageFromDate: damageFilter?.from || undefined,
          damageToDate: damageFilter?.to || undefined,
          registrationFromDate: registrationFilter?.from || undefined,
          registrationToDate: registrationFilter?.to || undefined,
          reportToInsurerFromDate: insurerReportFilter?.from || undefined,
          reportToInsurerToDate: insurerReportFilter?.to || undefined,
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
  if (loading && claims.length === 0) {
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
      <div className="p-6 pb-4 flex-shrink-0 sticky top-0 z-20 bg-white">
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
              className="pl-9 pr-9 h-9 text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("")
                  setSearchTerm("")
                  setPage(1)
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Select
              value={filterObjectTypeId}
              onValueChange={(value) => {
                setFilterObjectTypeId(value)
                setPage(1)
              }}
            >
              <SelectTrigger className="h-9 text-sm bg-white w-[160px]">
                <SelectValue placeholder="Typ szkody" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie typy</SelectItem>
                <SelectItem value="1">Komunikacyjna</SelectItem>
                <SelectItem value="2">Majątkowa</SelectItem>
                <SelectItem value="3">Transportowa</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-sm bg-white"
                >
                  {filterStatuses.length
                    ? claimStatuses
                        .filter((s) => filterStatuses.includes(s.id.toString()))
                        .map((s) => s.name)
                        .join(", ")
                    : "Wszystkie statusy"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-64 overflow-y-auto">
                {claimStatuses.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status.id}
                    checked={filterStatuses.includes(status.id.toString())}
                    onCheckedChange={() =>
                      toggleStatus(status.id.toString())
                    }
                  >
                    {status.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-sm bg-white"
                >
                  {filterRisks.length
                    ? riskTypes
                        .filter((r) => filterRisks.includes(r.id.toString()))
                        .map((r) => r.name)
                        .join(", ")
                    : "Wszystkie ryzyka"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-64 overflow-y-auto">
                {[1, 2, 3].map((type) => {
                  const grouped = riskTypes.filter(
                    (r) => r.claimObjectTypeId === type,
                  )
                  if (grouped.length === 0) return null
                  return (
                    <div key={type}>
                      <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground">
                        {typeLabelMap[type]}
                      </DropdownMenuLabel>
                      {grouped.map((risk) => (
                        <DropdownMenuCheckboxItem
                          key={risk.id}
                          checked={filterRisks.includes(risk.id.toString())}
                          onCheckedChange={() =>
                            toggleRisk(risk.id.toString())
                          }
                        >
                          {risk.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                      {type !== 3 && <DropdownMenuSeparator />}
                    </div>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-sm bg-white"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-3 w-3 mr-1" />
              Filtry
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`h-9 text-sm ${showMyClaims ? "bg-[#1a3a6c] text-white hover:bg-[#1a3a6c]/90" : "bg-white"}`}
              onClick={() => {
                setShowMyClaims((prev) => !prev)
                setSelectedSubstituteId("")
                setPage(1)
              }}
            >
              Moje szkody
            </Button>
            {substituteOptions.map((opt) => (
              <Button
                key={opt.id}
                variant="outline"
                size="sm"
                className={`h-9 text-sm ${
                  selectedSubstituteId === opt.id
                    ? "bg-[#1a3a6c] text-white hover:bg-[#1a3a6c]/90"
                    : "bg-white"
                }`}
                onClick={() => {
                  setSelectedSubstituteId(opt.id)
                  setShowMyClaims(false)
                  setPage(1)
                }}
              >
                {opt.name}
              </Button>
            ))}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                aria-label="Wyczyść filtry"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {showFilters && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Filtruj po numerze rejestracyjnym..."
                value={filterRegistration}
                onChange={(e) => setFilterRegistration(e.target.value)}
                className="h-9 text-sm"
              />
              <div className="w-48">
                <HandlerDropdown
                  selectedHandlerId={filterHandlerId}
                  onHandlerSelected={(e) => {
                    setFilterHandlerId(e.handlerId)
                    setPage(1)
                  }}
                  showDetails={false}
                  className="h-9"
                />
              </div>
              <Select
                value=""
                onValueChange={(value) => {
                  if (!dateFilters.find((f) => f.type === value)) {
                    setDateFilters((prev) => [
                      ...prev,
                      { type: value as DateFilterType, from: "", to: "" },
                    ])
                  }
                }}
              >
                <SelectTrigger className="w-48 h-9 text-sm">
                  <SelectValue placeholder="Dodaj filtr daty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reportDate">Data zgłoszenia</SelectItem>
                  <SelectItem value="damageDate">Data szkody</SelectItem>
                  <SelectItem value="registrationDate">Data rejestracji</SelectItem>
                  <SelectItem value="insurerReportDate">Data zgłoszenia do TU</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dateFilters.map((f) => (
              <div key={f.type} className="flex items-center gap-2 flex-wrap">
                <span className="text-sm w-32">
                  {f.type === "reportDate"
                    ? "Data zgłoszenia"
                    : f.type === "damageDate"
                    ? "Data szkody"
                    : f.type === "registrationDate"
                    ? "Data rejestracji"
                    : "Data zgłoszenia do TU"}
                </span>
                <Input
                  type="date"
                  value={f.from}
                  onChange={(e) =>
                    setDateFilters((prev) =>
                      prev.map((df) =>
                        df.type === f.type ? { ...df, from: e.target.value } : df,
                      ),
                    )
                  }
                  className="h-9 text-sm"
                />
                <Input
                  type="date"
                  value={f.to}
                  onChange={(e) =>
                    setDateFilters((prev) =>
                      prev.map((df) =>
                        df.type === f.type ? { ...df, to: e.target.value } : df,
                      ),
                    )
                  }
                  className="h-9 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setDateFilters((prev) => prev.filter((df) => df.type !== f.type))
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
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
                    onClick={() => handleSort("damageType")}
                  >
                    Typ
                    {renderSortIcon("damageType")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("insurerClaimNumber")}
                  >
                    Nr szkody TU
                    {renderSortIcon("insurerClaimNumber")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("spartaNumber")}
                  >
                    Nr szkody Sparta
                    {renderSortIcon("spartaNumber")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("vehicleNumber")}
                  >
                    Nr rejestracyjny
                    {renderSortIcon("vehicleNumber")}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("handler")}
                  >
                    Likwidator
                    {renderSortIcon("handler")}
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
                {claims.map((claim) => (
                  <tr
                    key={claim.id}
                    className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() =>
                      claim.id &&
                      (onEditClaim
                        ? onEditClaim(claim.id)
                        : handleEditClaimDirect(claim.id))
                    }
                  >


                    <td className="px-6 py-4 whitespace-nowrap">
                      {claim.objectTypeId ? (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = typeIconMap[claim.objectTypeId as number]
                            return Icon ? (
                              <Icon
                                className="h-4 w-4 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  claim.id &&
                                    (onEditClaim
                                      ? onEditClaim(claim.id)
                                      : handleEditClaimDirect(claim.id))
                                }}
                                title="Edytuj"
                              />
                            ) : null
                          })()}
                          <span>{typeLabelMap[claim.objectTypeId as number]}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{claim.insurerClaimNumber || "-"}</td>

                    <td className="px-6 py-4 whitespace-nowrap">{claim.spartaNumber || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{claim.victimRegistrationNumber || "-"}</td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {claim.handler ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block max-w-[200px] truncate">{claim.handler}</span>
                            </TooltipTrigger>
                            <TooltipContent>{claim.handler}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {claim.client ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block max-w-[200px] truncate">{claim.client}</span>
                            </TooltipTrigger>
                            <TooltipContent>{claim.client}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {claim.reportDate ? new Date(claim.reportDate).toLocaleDateString("pl-PL") : "-"}

                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {claim.riskType
                        ? riskTypeMap[String(claim.riskType)] ||
                          String(claim.riskType)
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const statusInfo = claim.claimStatusId
                          ? claimStatusMap[claim.claimStatusId]
                          : undefined
                        const colorClass =
                          statusInfo?.color ||
                          "bg-gray-100 text-gray-800 border-gray-200"
                        return (
                          <Badge className={`text-xs border ${colorClass}`}>
                            {statusInfo?.name || "-"}
                          </Badge>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            claim.id && handleViewClaim(claim.id)
                          }}
                          title="Podgląd"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-green-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            claim.id &&
                              (onEditClaim
                                ? onEditClaim(claim.id)
                                : handleEditClaimDirect(claim.id))
                          }}
                          title="Edytuj"
                        >
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteClaim(claim.id, claim.claimNumber)
                            }}
                            title="Usuń"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-[#1a3a6c]" />
              </div>
            )}
          </div>
          {claims.length > 0 && totalPages > 1 && (
            <Pagination className="p-4 border-t">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={page === i + 1}
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          {/* Empty State */}
          {claims.length === 0 && !loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {searchTerm ||
                  filterObjectTypeId !== "all" ||
                  filterStatuses.length > 0 ||
                  filterRisks.length > 0
                    ? "Brak szkód spełniających kryteria"
                    : "Brak szkód w systemie"}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {searchTerm ||
                  filterObjectTypeId !== "all" ||
                  filterStatuses.length > 0 ||
                  filterRisks.length > 0
                    ? "Spróbuj zmienić kryteria wyszukiwania"
                    : "Dodaj pierwszą szkodę, aby rozpocząć"}
                </p>
                {!searchTerm &&
                filterObjectTypeId === "all" &&
                filterStatuses.length === 0 &&
                filterRisks.length === 0 && (
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
      {claims.length > 0 && (
        <div className="px-6 pb-6 flex-shrink-0">
          <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
            <span>
              Wyświetlono {claims.length} z {totalCount} szkód
              {error && " (sprawdź połączenie z API)"}
            </span>
            <span>
              Łączna wartość wszystkich szkód:{" "}
              {totalClaimAmount.toLocaleString("pl-PL")} PLN
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClaimsListDesktop
