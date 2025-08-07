"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  apiEndpoint?: string
  searchable?: boolean
  sortable?: boolean
  onValueChange?: (value: string) => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, apiEndpoint, searchable, sortable, onValueChange, ...props }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [options, setOptions] = React.useState<Array<{ value: string; label: string; order?: number }>>([])
    const [loading, setLoading] = React.useState(false)
    const [searchTerm, setSearchTerm] = React.useState("")

    React.useEffect(() => {
      if (!apiEndpoint) return

      const fetchOptions = async () => {
        setLoading(true)
        try {
          const url = new URL(apiEndpoint, window.location.origin)
          if (searchTerm) {
            url.searchParams.set("search", searchTerm)
          }
          if (sortable) {
            url.searchParams.set("sortable", "true")
          }

          const response = await fetch(url.toString())
          if (response.ok) {
            const data = await response.json()
            let fetchedOptions = Array.isArray(data) ? data : data.options || []

            // Sort by order if sortable
            if (sortable) {
              fetchedOptions = fetchedOptions.sort((a, b) => (a.order || 0) - (b.order || 0))
            }

            setOptions(fetchedOptions)
          }
        } catch (error) {
          console.error("Failed to fetch options:", error)
          setOptions([])
        } finally {
          setLoading(false)
        }
      }

      fetchOptions()
    }, [apiEndpoint, searchTerm, sortable])

    // If apiEndpoint is provided, render as dropdown
    if (apiEndpoint) {
      const selectedOption = options.find((option) => option.value === props.value)

      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background justify-between font-normal",
                !selectedOption && "text-muted-foreground",
                className,
              )}
            >
              {selectedOption ? selectedOption.label : props.placeholder || "Wybierz opcję..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              {searchable && <CommandInput placeholder="Szukaj..." value={searchTerm} onValueChange={setSearchTerm} />}
              <CommandList>
                <CommandEmpty>{loading ? "Ładowanie..." : "Nie znaleziono opcji."}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        const newValue = currentValue === props.value ? "" : currentValue
                        onValueChange?.(newValue)
                        if (props.onChange) {
                          props.onChange({ target: { value: newValue } } as any)
                        }
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", props.value === option.value ? "opacity-100" : "opacity-0")}
                      />
                      {option.label}
                      {sortable && option.order && (
                        <span className="ml-auto text-xs text-muted-foreground">#{option.order}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )
    }

    // Default input behavior
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  },
)
Input.displayName = "Input"

export { Input }
