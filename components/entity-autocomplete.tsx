'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

export interface EntityOption {
  id: string
  name: string
  logo?: string
}

interface EntityAutocompleteProps {
  value: string
  onChange: (value: string) => void
  options: EntityOption[]
  placeholder?: string
  id?: string
  error?: boolean
  emptyMessage?: string
  className?: string
}

export function EntityAutocomplete({
  value,
  onChange,
  options,
  placeholder,
  id,
  error,
  emptyMessage = 'Sin resultados. Escribí para agregar uno nuevo.',
  className,
}: EntityAutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState(value)

  React.useEffect(() => {
    setSearch(value)
  }, [value])

  const filtered = React.useMemo(() => {
    if (!search.trim()) return options
    const q = search.trim().toLowerCase()
    return options.filter((o) => o.name.toLowerCase().includes(q))
  }, [options, search])

  const handleSelect = (name: string) => {
    onChange(name)
    setSearch(name)
    setOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setSearch(v)
    onChange(v)
    // Open suggestions while typing (keeps input editable)
    setOpen(v.trim().length > 0)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative flex">
        <Input
          id={id}
          value={search}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(error && 'border-destructive', 'pr-9', className)}
          autoComplete="off"
        />
        <PopoverTrigger asChild>
          <button
            type="button"
            className="absolute right-0 top-0 flex h-full w-9 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-md outline-none"
            aria-label="Ver sugerencias"
          >
            <ChevronDown className="h-4 w-4 shrink-0" />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filtered.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.name}
                  onSelect={() => handleSelect(opt.name)}
                  className="gap-2"
                >
                  {opt.logo ? (
                    <img
                      src={opt.logo}
                      alt=""
                      className="h-6 w-6 shrink-0 rounded object-contain bg-muted"
                    />
                  ) : (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                      ?
                    </span>
                  )}
                  <span>{opt.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
