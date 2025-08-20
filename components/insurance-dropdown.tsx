"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Phone, Mail, AlertCircle, ExternalLink, Check } from "lucide-react"
import type { InsuranceCompany, InsuranceCompanySelectionEvent } from "@/types/insurance"
import { InsuranceCompaniesService } from "@/lib/insurance-companies"

interface InsuranceDropdownProps {
  selectedCompanyId?: number
  onCompanySelected?: (event: InsuranceCompanySelectionEvent) => void
  className?: string
}

interface DropdownPosition {
  top: number
  left: number
  width: number
}

export default function InsuranceDropdown({
  selectedCompanyId,
  onCompanySelected,
  className = "",
}: InsuranceDropdownProps) {
  const [companies] = useState<InsuranceCompany[]>(
    InsuranceCompaniesService.sortCompaniesAlphabetically(InsuranceCompaniesService.getCompanies()),
  )
  const [filteredCompanies, setFilteredCompanies] = useState<InsuranceCompany[]>(companies)
  const [selectedCompany, setSelectedCompany] = useState<InsuranceCompany | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (selectedCompanyId) {
      const company = InsuranceCompaniesService.getCompanyById(selectedCompanyId)
      if (company) {
        setSelectedCompany(company)
      }
    }
  }, [selectedCompanyId])

  useEffect(() => {
    const filtered = companies.filter((company) => company.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredCompanies(filtered)
  }, [searchTerm, companies])

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
        top: rect.bottom + 4,
        left: rect.left,
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

  const selectCompany = (company: InsuranceCompany) => {
    setSelectedCompany(company)
    setIsDropdownOpen(false)
    setSearchTerm("")

    if (onCompanySelected) {
      onCompanySelected({
        companyId: company.id,
        companyName: company.name,
      })
    }
  }

  const hasFormLink = (link: string): boolean => {
    return link && link !== "brak" && link.trim() !== ""
  }

  const hasContactInfo = (info: string): boolean => {
    return info && info !== "brak" && info.trim() !== ""
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
            placeholder="Wyszukaj firmę..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        </div>

        {/* Dropdown Items */}
        <div className="dropdown-items">
          {filteredCompanies.length === 0 ? (
            <div className="dropdown-no-results">Nie znaleziono firm spełniających kryteria wyszukiwania</div>
          ) : (
            filteredCompanies.map((company) => (
              <div
                key={`insurance-${company.id}`}
                className={`dropdown-item ${selectedCompany?.id === company.id ? "selected" : ""}`}
                onClick={() => selectCompany(company)}
              >
                {selectedCompany?.id === company.id && <Check className="h-4 w-4 mr-2 text-blue-600" />}
                <span>{company.name}</span>
              </div>
            ))
          )}
        </div>
      </div>,
      document.body,
    )
  }

  return (
    <div className={`insurance-dropdown relative w-full ${className}`}>
      {/* Dropdown Button */}
      <Button
        ref={buttonRef}
        variant="outline"
        onClick={toggleDropdown}
        className="w-full justify-between h-12 px-4 text-left font-normal bg-white hover:bg-gray-50"
        type="button"
      >
        <span className="truncate text-gray-900">
          {selectedCompany ? selectedCompany.name : "Wybierz firmę ubezpieczeniową..."}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform text-gray-500 ${isDropdownOpen ? "rotate-180" : ""}`} />
      </Button>

      {/* Render dropdown portal */}
      {renderDropdownPortal()}

      {/* Company Details Card */}
      {selectedCompany && (
        <Card className="mt-6 border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Phone */}
              <div>
                <h3 className="flex items-center text-sm font-medium mb-2 text-gray-700">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  Numer telefonu
                </h3>
                {hasContactInfo(selectedCompany.phone) ? (
                  <p className="text-gray-900 text-sm">{selectedCompany.phone}</p>
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
                {hasContactInfo(selectedCompany.email) ? (
                  <a
                    href={`mailto:${selectedCompany.email}`}
                    className="text-blue-600 hover:underline break-all text-sm"
                  >
                    {selectedCompany.email}
                  </a>
                ) : (
                  <p className="text-gray-500 italic text-sm">Brak adresu e-mail</p>
                )}
              </div>
            </div>

            {/* Form Section */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="flex items-center text-sm font-medium mb-3 text-gray-700">
                <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                Zgłoszenie szkody
              </h3>

              {hasFormLink(selectedCompany.formLink) ? (
                <a
                  href={selectedCompany.formLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Przejdź do formularza zgłoszenia szkody
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              ) : (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-orange-800 text-sm">
                    Brak formularza online. Skontaktuj się telefonicznie lub mailowo.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
