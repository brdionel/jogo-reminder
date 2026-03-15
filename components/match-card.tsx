'use client'

import { Calendar, Trash2, Pencil, ChevronDown } from 'lucide-react'
import { Match } from '@/lib/types'
import { downloadICS, getGoogleCalendarUrl } from '@/lib/calendar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface MatchCardProps {
  match: Match
  isInCalendar: boolean
  onAddToCalendar: () => void
  onRemoveFromCalendar: () => void
  onEdit?: () => void
  onRemove?: () => void
  dateLabel?: string
  homeTeamLogo?: string
  awayTeamLogo?: string
}

export function MatchCard({ match, isInCalendar, onAddToCalendar, onRemoveFromCalendar, onEdit, onRemove, dateLabel, homeTeamLogo, awayTeamLogo }: MatchCardProps) {
  const handleAddToGoogleCalendar = () => {
    window.open(getGoogleCalendarUrl(match), '_blank')
  }

  const handleDownloadICS = () => {
    downloadICS(match)
  }

  const homeName = typeof match.homeTeam === 'object' && match.homeTeam !== null ? match.homeTeam.name : String(match.homeTeam ?? '')
  const awayName = typeof match.awayTeam === 'object' && match.awayTeam !== null ? match.awayTeam.name : String(match.awayTeam ?? '')
  const venue = match.venue?.trim() || null
  const dateTimeLabel = dateLabel ? `${dateLabel} • ${match.time}` : match.time

  return (
    <div className="group flex flex-col gap-2 border-b border-border py-3 last:border-b-0">
      {/* Fila superior: sede (izq) | fecha • hora (der) */}
      <div className="flex items-center justify-center text-xs text-muted-foreground">
        {venue && (
        <span className="truncate">{venue || '—'}</span>
        )}
        <span className="shrink-0 font-medium text-foreground">{dateTimeLabel}</span>
      </div>

      {/* Fila central: equipos con logos y "x" */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {homeTeamLogo ? (
            <img src={homeTeamLogo} alt="" className="h-7 w-7 shrink-0 rounded object-contain bg-muted sm:h-8 sm:w-8" />
          ) : null}
          <span className="truncate text-sm font-medium text-foreground sm:text-base">{homeName}</span>
        </div>
        <span className="shrink-0 text-sm font-medium text-muted-foreground">x</span>
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {awayTeamLogo ? (
            <img src={awayTeamLogo} alt="" className="h-7 w-7 shrink-0 rounded object-contain bg-muted sm:h-8 sm:w-8" />
          ) : null}
          <span className="truncate text-sm font-medium text-foreground sm:text-base">{awayName}</span>
        </div>
      </div>

      {/* Fila inferior: Añadir al calendario (recordatorios) + acciones */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider underline decoration-primary underline-offset-2 transition-colors hover:decoration-2',
                isInCalendar ? 'text-primary' : 'text-primary hover:text-primary/90'
              )}
            >
              {isInCalendar ? 'En mi calendario' : 'Añadir al calendario'}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {!isInCalendar && (
              <DropdownMenuItem onClick={onAddToCalendar}>
                <Calendar className="mr-2 h-4 w-4" />
                Añadir y recibir recordatorios
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleAddToGoogleCalendar}>
              Abrir Google Calendar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadICS}>
              Descargar .ics
            </DropdownMenuItem>
            {isInCalendar && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onRemoveFromCalendar} className="text-destructive focus:text-destructive">
                  Quitar de mi calendario
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-0.5">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
              aria-label="Editar partido"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              aria-label="Eliminar partido"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
