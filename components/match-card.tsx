'use client'

import { Star, Calendar, ChevronDown, Trash2 } from 'lucide-react'
import { Match } from '@/lib/types'
import { downloadICS, getGoogleCalendarUrl } from '@/lib/calendar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface MatchCardProps {
  match: Match
  isSaved: boolean
  onToggleSave: () => void
  onRemove?: () => void
  dateLabel?: string
  homeTeamLogo?: string
  awayTeamLogo?: string
}

export function MatchCard({ match, isSaved, onToggleSave, onRemove, dateLabel, homeTeamLogo, awayTeamLogo }: MatchCardProps) {
  const handleAddToGoogleCalendar = () => {
    window.open(getGoogleCalendarUrl(match), '_blank')
  }

  const handleDownloadICS = () => {
    downloadICS(match)
  }

  return (
    <div className="group flex items-center gap-2 px-3 py-2 transition-colors hover:bg-muted/50 sm:gap-4">
      {/* Date label */}
      {dateLabel && (
        <div className="hidden w-16 shrink-0 text-xs font-semibold text-muted-foreground sm:block">
          {dateLabel}
        </div>
      )}

      {/* Time */}
      <div className="w-12 shrink-0 text-center font-mono text-sm font-bold text-foreground">
        {match.time}
      </div>

      {/* Teams - Promiedos style: tabular layout */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {homeTeamLogo ? (
          <img src={homeTeamLogo} alt="" className="h-6 w-6 shrink-0 rounded object-contain bg-muted" />
        ) : null}
        <span className="truncate text-sm font-medium text-foreground">
          {typeof match.homeTeam === 'object' && match.homeTeam !== null ? match.homeTeam.name : String(match.homeTeam ?? '')}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">vs</span>
        {awayTeamLogo ? (
          <img src={awayTeamLogo} alt="" className="h-6 w-6 shrink-0 rounded object-contain bg-muted" />
        ) : null}
        <span className="truncate text-sm font-medium text-foreground">
          {typeof match.awayTeam === 'object' && match.awayTeam !== null ? match.awayTeam.name : String(match.awayTeam ?? '')}
        </span>
      </div>

      {/* Mobile date */}
      {dateLabel && (
        <div className="shrink-0 text-xs text-muted-foreground sm:hidden">
          {dateLabel}
        </div>
      )}

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
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

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSave}
          className={cn(
            'h-7 w-7 transition-colors',
            isSaved 
              ? 'text-amber-500 hover:text-amber-600' 
              : 'text-muted-foreground hover:text-amber-500'
          )}
          aria-label={isSaved ? 'Quitar de guardados' : 'Guardar partido'}
        >
          <Star className={cn('h-3.5 w-3.5', isSaved && 'fill-current')} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
            >
              <Calendar className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleAddToGoogleCalendar}>
              Google Calendar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadICS}>
              Descargar .ics
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
