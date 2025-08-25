"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronDown, Search, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { vehicleTypeService } from "@/lib/vehicle-types"
import type { VehicleType, VehicleTypeSelectionEvent } from "@/types/vehicle-type"
import { cn } from "@/lib/utils"

interface VehicleTypeDropdownProps {
  selectedVehicleTypeId?: string
  /**
   * When editing an existing claim we might only have the vehicle type
   * name stored in the database. Allow passing it so the dropdown can
   * preselect the correct option even without an id.
   */
  selectedVehicleTypeName?: string
  onVehicleTypeSelected: (event: VehicleTypeSelectionEvent) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function VehicleTypeDropdown({
  selectedVehicleTypeId,
  selectedVehicleTypeName,
  onVehicleTypeSelected,
  placeholder = "Wybierz rodzaj pojazdu...",
  className,
  disabled = false,
}: VehicleTypeDropdownProps) {
  const [open, setOpen] = useState(false)
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [filteredVehicleTypes, setFilteredVehicleTypes] = useState<VehicleType[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load vehicle types on component mount
  useEffect(() => {
    loadVehicleTypes()
  }, [])

  // Filter vehicle types based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredVehicleTypes(vehicleTypes)
    } else {
      const filtered = vehicleTypes.filter(
        (type) =>
          type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          type.code.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredVehicleTypes(filtered)
    }
  }, [searchTerm, vehicleTypes])

  // Set selected vehicle type when selectedVehicleTypeId or name changes
  useEffect(() => {
    if (vehicleTypes.length === 0) {
      return
    }

    if (selectedVehicleTypeId) {
      const vehicleType = vehicleTypes.find((type) => type.id === selectedVehicleTypeId)
      setSelectedVehicleType(vehicleType || null)
      return
    }

    if (selectedVehicleTypeName) {
      const vehicleType = vehicleTypes.find((type) => type.name === selectedVehicleTypeName)
      setSelectedVehicleType(vehicleType || null)
      return
    }

    setSelectedVehicleType(null)
  }, [selectedVehicleTypeId, selectedVehicleTypeName, vehicleTypes])

  const loadVehicleTypes = async () => {
    setLoading(true)
    try {
      const data = await vehicleTypeService.getVehicleTypes()
      setVehicleTypes(data)
      setFilteredVehicleTypes(data)
    } catch (error) {
      console.error("Error loading vehicle types:", error)
      setVehicleTypes([])
      setFilteredVehicleTypes([])
    } finally {
      setLoading(false)
    }
  }

  const handleVehicleTypeSelect = (vehicleType: VehicleType) => {
    setSelectedVehicleType(vehicleType)
    setOpen(false)
    setSearchTerm("")

    onVehicleTypeSelected({
      vehicleTypeId: vehicleType.id,
      vehicleTypeName: vehicleType.name,
      vehicleTypeCode: vehicleType.code,
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setSearchTerm("")
      // Focus search input when opening
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedVehicleType ? `${selectedVehicleType.name} (${selectedVehicleType.code})` : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                ref={searchInputRef}
                placeholder="Szukaj rodzaju pojazdu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 p-2 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Ładowanie...</span>
                </div>
              ) : (
                <>
                  <CommandEmpty>Nie znaleziono rodzaju pojazdu.</CommandEmpty>
                  <CommandGroup>
                    {filteredVehicleTypes.map((vehicleType) => (
                      <CommandItem
                        key={`vehicle-type-${vehicleType.id}`}
                        value={vehicleType.id}
                        onSelect={() => handleVehicleTypeSelect(vehicleType)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedVehicleType?.id === vehicleType.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{vehicleType.name}</span>
                          <span className="text-sm text-muted-foreground">Kod: {vehicleType.code}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
