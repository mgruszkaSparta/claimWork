"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Phone, Mail, MapPin, Check } from "lucide-react"
import type { Handler, HandlerSelectionEvent } from "@/types/handler"
import { useCaseHandlers } from "@/hooks/use-case-handlers"

interface HandlerDropdownProps {
  selectedHandlerId?: string
  onHandlerSelected?: (event: HandlerSelectionEvent) => void
  className?: string
}

interface DropdownPosition {
  top: number
  left: number
  width: number
}

export default function HandlerDropdown({
  selectedHandlerId,
  onHandlerSelected,
  className = "",
}: HandlerDropdownProps) {
  const { handlers, loading, error, refresh } = useCaseHandlers()

  const sortedHandlers = useMemo(
    () =>
      [...handlers].sort((a, b) =>
        a.name.localeCompare(b.name, "pl", { sensitivity: "base" }),
      ),
    [handlers],
  )

  const [filteredHandlers, setFilteredHandlers] = useState<Handler[]>(sortedHandlers)
  const [selectedHandler, setSelectedHandler] = useState<Handler | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Portal mount
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Ustaw preselekt, gdy mamy dane i id
  useEffect(() => {
    if (!selectedHandlerId || sortedHandlers.length === 0) return
    const found = sortedHandlers.find(h => h.id === selectedHandlerId) || null
    setSelectedHandler(found)
  }, [selectedHandlerId, sortedHandlers])

  // Filtrowanie po zmianie searchTerm/danych
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) {
      setFilteredHandlers(sortedHandlers)
      return
    }
    const filtered = sortedHandlers.filter(h =>
      h.name.toLowerCase().includes(term) ||
      (h.code?.toLowerCase().includes(term) ?? false) ||
      (h.email?.toLowerCase().includes(term) ?? false),
    )
    setFilteredHandlers(filtered)
  }, [searchTerm, sortedHandlers])

  // Close/relayout
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    const handleScroll = () => isDropdownOpen && updateDropdownPosition()
    const handleResize = () => isDropdownOpen && updateDropdownPosition()

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      window.addEventListener("scroll", handleScroll, true)
      window.addEventListener("resize", handleResize)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("scroll", handleScroll, true)
      window.removeEventListener("resize", handleResize)
    }
  }, [isDropdownOpen])

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }

  const toggleDropdown = () => {
    if (!isDropdownOpen) updateDropdownPosition()
    setIsDropdownOpen(!isDropdownOpen)
  }

  const selectHandler = (handler: Handler) => {
    setSelectedHandler(handler)
    setIsDropdownOpen(false)
    setSearchTerm("")
    onHandlerSelected?.({ handlerId: handler.id, handlerName: handler.name })
  }

  const hasContactInfo = (info?: string): boolean =>
    !!info && info !== "brak" && info.trim() !== ""

  const renderDropdownPortal = () => {
    if (!mounted || !isDropdownOpen) return null

    return createPortal(
      <div
        ref={dropdownRef}
        className="dropdown-portal z-50 absolute"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
        }}
      >
        {/* Search */}
        <div className="dropdown-search bg-white border border-gray-200 rounded-t-lg">
          <Input
            type="text"
            placeholder="Wyszukaj likwidatora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-0 focus:ring-0 px-3 py-2"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        </div>

        {/* Items */}
        <div className="dropdown-items max-h-72 overflow-auto bg-white border border-t-0 border-gray-200 rounded-b-lg">
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Ładowanie…</div>
          ) : error ? (
            <div className="px-3 py-2 text-sm text-red-600">
              Błąd pobierania.{" "}
              <button className="underline" onClick={(e) => { e.stopPropagation(); refresh() }}>
                Spróbuj ponownie
              </button>
            </div>
          ) : filteredHandlers.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              Nie znaleziono likwidatorów spełniających kryteria
            </div>
          ) : (
            filteredHandlers.map((handler) => (
              <div
                key={`handler-${handler.id}`}
                className={`dropdown-item flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                  selectedHandler?.id === handler.id ? "bg-blue-50" : ""
                }`}
                onClick={() => selectHandler(handler)}
              >
                {selectedHandler?.id === handler.id && (
                  <Check className="h-4 w-4 mr-2 text-blue-600" />
                )}
                <div className="flex flex-col">
                  <span className="font-medium">{handler.name}</span>
                  <span className="text-xs text-gray-500">
                    {handler.code || ""}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>,
      document.body,
    )
  }

  return (
    <div className={`handler-dropdown relative w-full ${className}`}>
      {/* Button */}
      <Button
        ref={buttonRef}
        variant="outline"
        onClick={toggleDropdown}
        className="w-full justify-between h-12 px-4 text-left font-normal bg-white hover:bg-gray-50"
        type="button"
        disabled={loading && !isDropdownOpen}
      >
        <span className="truncate text-gray-900">
          {selectedHandler ? selectedHandler.name :
            loading ? "Ładowanie..." :
            error ? "Błąd ładowania (kliknij by spróbować)" :
            "Wybierz likwidatora..."}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform text-gray-500 ${isDropdownOpen ? "rotate-180" : ""}`} />
      </Button>

      {/* Portal */}
      {renderDropdownPortal()}

      {/* Szczegóły (opcjonalne) */}
      {selectedHandler && (
        <Card className="mt-6 border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Phone */}
              <div>
                <h3 className="flex items-center text-sm font-medium mb-2 text-gray-700">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  Numer telefonu
                </h3>
                {hasContactInfo(selectedHandler.phone) ? (
                  <p className="text-gray-900 text-sm">{selectedHandler.phone}</p>
                ) : (
                  <p className="text-gray-500 italic text-sm">Brak numeru telefonu</p>
                )}
              </div>

              {/* Email */}
              <div>
                <h3 className="flex items-center text-sm font-medium mb-2 text-gray-700">
                  <Mail className="h-4 w-4 mr-2 text-blue-600" />
                  Adres e-mail
                </h3>
                {hasContactInfo(selectedHandler.email) ? (
                  <a href={`mailto:${selectedHandler.email}`} className="text-blue-600 hover:underline break-all text-sm">
                    {selectedHandler.email}
                  </a>
                ) : (
                  <p className="text-gray-500 italic text-sm">Brak adresu e-mail</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="flex items-center text-sm font-medium mb-3 text-gray-700">
                <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                Adres
              </h3>
              {hasContactInfo(selectedHandler.address) ? (
                <p className="text-gray-900 text-sm">{selectedHandler.address}</p>
              ) : (
                <p className="text-gray-500 italic text-sm">Brak adresu</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
