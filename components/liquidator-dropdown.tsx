"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Phone, Mail, MapPin, Check } from "lucide-react"
import type { Liquidator, LiquidatorSelectionEvent } from "@/types/liquidator"
import { getLiquidators } from "@/lib/api/liquidators"

interface LiquidatorDropdownProps {
  selectedLiquidatorName?: string
  onLiquidatorSelected?: (event: LiquidatorSelectionEvent) => void
  className?: string
}

interface DropdownPosition {
  top: number
  left: number
  width: number
}

export default function LiquidatorDropdown({
  selectedLiquidatorName,
  onLiquidatorSelected,
  className = "",
}: LiquidatorDropdownProps) {
  const [liquidators, setLiquidators] = useState<Liquidator[]>([])
  const [filteredLiquidators, setFilteredLiquidators] = useState<Liquidator[]>([])
  const [selectedLiquidator, setSelectedLiquidator] = useState<Liquidator | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLiquidators()
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name, "pl", { sensitivity: "base" }))
        setLiquidators(sorted)
        setFilteredLiquidators(sorted)
      } catch (e) {
        console.error("Error loading liquidators:", e)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (selectedLiquidatorName) {
      const liquidator = liquidators.find((l) => l.name === selectedLiquidatorName)
      if (liquidator) {
        setSelectedLiquidator(liquidator)
      }
    }
  }, [selectedLiquidatorName, liquidators])

  useEffect(() => {
    const filtered = liquidators.filter(
      (l) =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredLiquidators(filtered)
  }, [searchTerm, liquidators])

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

    const handleScroll = () => {
      if (isDropdownOpen) {
        updateDropdownPosition()
      }
    }

    const handleResize = () => {
      if (isDropdownOpen) {
        updateDropdownPosition()
      }
    }

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
    if (!isDropdownOpen) {
      updateDropdownPosition()
    }
    setIsDropdownOpen(!isDropdownOpen)
  }

  const selectLiquidator = (liquidator: Liquidator) => {
    setSelectedLiquidator(liquidator)
    setIsDropdownOpen(false)
    setSearchTerm("")

    if (onLiquidatorSelected) {
      onLiquidatorSelected({
        liquidatorId: liquidator.id,
        liquidatorName: liquidator.name,
      })
    }
  }

  const hasContactInfo = (info?: string | null): boolean => {
    return info !== null && info !== undefined && info !== "brak" && info.trim() !== ""
  }

  const renderDropdownPortal = () => {
    if (!mounted || !isDropdownOpen) return null

    return createPortal(
      <div
        ref={dropdownRef}
        className="dropdown-portal"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
        }}
      >
        {/* Search Input */}
        <div className="dropdown-search">
          <Input
            type="text"
            placeholder="Wyszukaj likwidatora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        </div>

        {/* Dropdown Items */}
        <div className="dropdown-items">
          {filteredLiquidators.length === 0 ? (
            <div className="dropdown-no-results">Nie znaleziono likwidatorów spełniających kryteria wyszukiwania</div>
          ) : (
            filteredLiquidators.map((liquidator) => (
              <div
                key={`liquidator-${liquidator.id}`}
                className={`dropdown-item ${selectedLiquidator?.id === liquidator.id ? "selected" : ""}`}
                onClick={() => selectLiquidator(liquidator)}
              >
                {selectedLiquidator?.id === liquidator.id && <Check className="h-4 w-4 mr-2 text-blue-600" />}
                <div className="flex flex-col">
                  <span className="font-medium">{liquidator.name}</span>
                  {liquidator.email && <span className="text-xs text-gray-500">{liquidator.email}</span>}
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
    <div className={`liquidator-dropdown relative w-full ${className}`}>
      {/* Dropdown Button */}
      <Button
        ref={buttonRef}
        variant="outline"
        onClick={toggleDropdown}
        className="w-full justify-between h-12 px-4 text-left font-normal bg-white hover:bg-gray-50"
        type="button"
      >
        <span className="truncate text-gray-900">
          {selectedLiquidator ? selectedLiquidator.name : "Wybierz likwidatora..."}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform text-gray-500 ${isDropdownOpen ? "rotate-180" : ""}`} />
      </Button>

      {/* Render dropdown portal */}
      {renderDropdownPortal()}

      {/* Liquidator Details Card */}
      {selectedLiquidator && (
        <Card className="mt-6 border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Phone */}
              <div>
                <h3 className="flex items-center text-sm font-medium mb-2 text-gray-700">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  Numer telefonu
                </h3>
                {hasContactInfo(selectedLiquidator.phone) ? (
                  <p className="text-gray-900 text-sm">{selectedLiquidator.phone}</p>
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
                {hasContactInfo(selectedLiquidator.email) ? (
                  <a
                    href={`mailto:${selectedLiquidator.email}`}
                    className="text-blue-600 hover:underline break-all text-sm"
                  >
                    {selectedLiquidator.email}
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
              {hasContactInfo(selectedLiquidator.address) ? (
                <p className="text-gray-900 text-sm">{selectedLiquidator.address}</p>
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
