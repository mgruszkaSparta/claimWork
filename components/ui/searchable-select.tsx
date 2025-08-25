"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Option {
  value: string
  label: string
}

interface SearchableSelectProps {
  apiEndpoint: string
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
}

export function SearchableSelect({
  apiEndpoint,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<Option[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true)
      try {
        const response = await fetch(apiEndpoint, {
          method: "GET",
          credentials: "omit",
        })
        if (response.ok) {
          const data = await response.json()
          // Handle both array format and object format with options property
          if (Array.isArray(data)) {
            setOptions(data)
          } else if (data.options && Array.isArray(data.options)) {
            setOptions(data.options)
          } else {
            console.error("Invalid API response format:", data)
            setOptions([])
          }
        }
      } catch (error) {
        console.error("Failed to fetch options:", error)
        setOptions([])
      } finally {
        setLoading(false)
      }
    }

    fetchOptions()
  }, [apiEndpoint])

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{loading ? "Loading..." : emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
