"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, Phone, Mail, MapPin, Check, Plus, FileText, Hash } from "lucide-react"
import type { Client, ClientSelectionEvent } from "@/types/client"
import { apiService } from "@/lib/api"

interface ClientDropdownProps {
  selectedClientId?: number
  onClientSelected?: (event: ClientSelectionEvent) => void
  onNewClientClick?: () => void
  className?: string
}

interface DropdownPosition {
  top: number
  left: number
  width: number
}

export default function ClientDropdown({
  selectedClientId,
  onClientSelected,
  onNewClientClick,
  className = "",
}: ClientDropdownProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
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
    const load = async () => {
      try {
        const data = await apiService.getClients()
        const sorted = [...data].sort((a, b) =>
          a.name.localeCompare(b.name, "pl", { sensitivity: "base" }),
        )
        setClients(sorted)
        setFilteredClients(sorted)
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find((c) => c.id === selectedClientId)
      if (client) {
        setSelectedClient(client)
      }
    }
  }, [selectedClientId, clients])

  useEffect(() => {
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.nip ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.regon ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredClients(filtered)
  }, [searchTerm, clients])

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

  const selectClient = (client: Client) => {
    setSelectedClient(client)
    setIsDropdownOpen(false)
    setSearchTerm("")

    if (onClientSelected) {
      onClientSelected({
        clientId: client.id,
        clientName: client.name,
      })
    }
  }

  const handleNewClientClick = () => {
    setIsDropdownOpen(false)
    if (onNewClientClick) {
      onNewClientClick()
    }
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
            placeholder="Wyszukaj klienta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        </div>

        {/* Dropdown Items */}
        <div className="dropdown-items">
          {/* New Client Button */}
          <div className="dropdown-item" onClick={handleNewClientClick}>
            <Plus className="h-4 w-4 mr-2 text-green-600" />
            <span className="text-green-600 font-medium">Dodaj nowego klienta</span>
          </div>

          {filteredClients.length === 0 ? (
            <div className="dropdown-no-results">Nie znaleziono klientów spełniających kryteria wyszukiwania</div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={`client-${client.id}`}
                className={`dropdown-item ${selectedClient?.id === client.id ? "selected" : ""}`}
                onClick={() => selectClient(client)}
              >
                {selectedClient?.id === client.id && <Check className="h-4 w-4 mr-2 text-blue-600" />}
                <div className="flex flex-col">
                  <span className="font-medium">{client.name}</span>
                  <span className="text-xs text-gray-500">
                    {client.nip
                      ? `NIP: ${client.nip}`
                      : client.regon
                        ? `REGON: ${client.regon}`
                        : client.email}
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
    <div className={`client-dropdown relative w-full ${className}`}>
      {/* Dropdown Button */}
      <Button
        ref={buttonRef}
        variant="outline"
        onClick={toggleDropdown}
        className="w-full justify-between h-12 px-4 text-left font-normal bg-white hover:bg-gray-50"
        type="button"
      >
        <span className="truncate text-gray-900">{selectedClient ? selectedClient.name : "Wybierz klienta..."}</span>
        <ChevronDown className={`h-4 w-4 transition-transform text-gray-500 ${isDropdownOpen ? "rotate-180" : ""}`} />
      </Button>

      {/* Render dropdown portal */}
      {renderDropdownPortal()}

      {/* Client Details Card */}
      {selectedClient && (
        <Card className="mt-6 border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Phone */}
              <div>
                <h3 className="flex items-center text-sm font-medium mb-2 text-gray-700">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  Numer telefonu
                </h3>
                {hasContactInfo(selectedClient.phoneNumber ?? "") ? (
                  <p className="text-gray-900 text-sm">{selectedClient.phoneNumber}</p>
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
                {hasContactInfo(selectedClient.email) ? (
                  <a
                    href={`mailto:${selectedClient.email}`}
                    className="text-blue-600 hover:underline break-all text-sm"
                  >
                    {selectedClient.email}
                  </a>
                ) : (
                  <p className="text-gray-500 italic text-sm">Brak adresu e-mail</p>
                )}
              </div>

              {/* NIP */}
              <div>
                <h3 className="flex items-center text-sm font-medium mb-2 text-gray-700">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  NIP
                </h3>
                {hasContactInfo(selectedClient.nip ?? "") ? (
                  <p className="text-gray-900 text-sm">{selectedClient.nip}</p>
                ) : (
                  <p className="text-gray-500 italic text-sm">Brak NIP</p>
                )}
              </div>

              {/* REGON */}
              <div>
                <h3 className="flex items-center text-sm font-medium mb-2 text-gray-700">
                  <Hash className="h-4 w-4 mr-2 text-blue-600" />
                  REGON
                </h3>
                {hasContactInfo(selectedClient.regon ?? "") ? (
                  <p className="text-gray-900 text-sm">{selectedClient.regon}</p>
                ) : (
                  <p className="text-gray-500 italic text-sm">Brak REGON</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="flex items-center text-sm font-medium mb-3 text-gray-700">
                <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                Adres
              </h3>
                {hasContactInfo(selectedClient.address ?? "") ? (
                <p className="text-gray-900 text-sm">{selectedClient.address}</p>
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
