'use client'

import { Star, Calendar, Trash2, Download, Clock, Bell, BellOff } from 'lucide-react'
import { useSavedMatches } from '@/hooks/use-saved-matches'
import { downloadICS, downloadAllICS, getGoogleCalendarUrl } from '@/lib/calendar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SavedMatches() {
  const { savedMatches, removeMatch, toggleReminder, isLoaded } = useSavedMatches()

  if (!isLoaded) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (savedMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Star className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">No tienes partidos guardados</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Usa el boton de estrella para guardar partidos que quieras ver
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with bulk actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-primary text-primary" />
          <span className="text-lg font-semibold text-foreground">
            {savedMatches.length} partido{savedMatches.length !== 1 ? 's' : ''} guardado{savedMatches.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadAllICS(savedMatches)}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Descargar todos (.ics)
        </Button>
      </div>

      {/* Saved matches list */}
      <div className="flex flex-col gap-3">
        {savedMatches
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`)
            const dateB = new Date(`${b.date}T${b.time}`)
            return dateA.getTime() - dateB.getTime()
          })
          .map((match) => {
            const matchDate = new Date(match.date)
            const formattedDate = matchDate.toLocaleDateString('es-ES', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })

            return (
              <div
                key={match.id}
                className="flex flex-col gap-4 rounded-xl border border-primary/30 bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-primary">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono text-sm font-medium">
                        {formattedDate} - {match.time}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {typeof match.homeTeam === 'object' && match.homeTeam?.name
                      ? match.homeTeam.name
                      : String(match.homeTeam ?? '')}{' '}
                    vs{' '}
                    {typeof match.awayTeam === 'object' && match.awayTeam?.name
                      ? match.awayTeam.name
                      : String(match.awayTeam ?? '')}
                  </h3>
                  <span className="w-fit rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    {(match as { league?: { name?: string }; competition?: string }).league?.name ??
                      (match as { competition?: string }).competition ??
                      ''}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleReminder(match.id)}
                    className={cn(
                      'h-9 w-9',
                      match.reminder
                        ? 'text-primary hover:text-primary/80'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    title={match.reminder ? 'Desactivar recordatorio' : 'Activar recordatorio'}
                  >
                    {match.reminder ? (
                      <Bell className="h-4 w-4 fill-current" />
                    ) : (
                      <BellOff className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(getGoogleCalendarUrl(match), '_blank')}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    title="Agregar a Google Calendar"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => downloadICS(match)}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    title="Descargar .ics"
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMatch(match.id)}
                    className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
