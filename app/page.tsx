'use client'

import { useEffect, useMemo, useState } from 'react'
import { addDays, format } from 'date-fns'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Header } from '@/components/header'
import { MatchList } from '@/components/match-list'
import { AddMatchForm } from '@/components/add-match-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useMatches } from '@/hooks/use-matches'
import { useTeams } from '@/hooks/use-teams'
import { useLeagues } from '@/hooks/use-leagues'
import type { Match } from '@/lib/types'

export default function HomePage() {
  const { matches, addMatch, updateMatch, removeMatch, isLoaded, isLoading, fetchMatches } = useMatches()
  const { teams, ensureTeam } = useTeams()
  const { leagues, ensureLeague, getLeagueId, fetchLeagues } = useLeagues()

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })

  const matchesForSelectedDate = useMemo(() => {
    const targetTime = selectedDate.getTime()
    return matches.filter((match) => {
      const [year, month, day] = match.date.split('-').map(Number)
      const matchDate = new Date(year, month - 1, day)
      return matchDate.getTime() === targetTime
    })
  }, [matches, selectedDate])

  // Fetch matches when date changes
  useEffect(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    fetchMatches(dateStr)
  }, [selectedDate, fetchMatches])

  const headerLabel = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = addDays(today, -1)
    const tomorrow = addDays(today, 1)

    if (selectedDate.getTime() === today.getTime()) return 'Partidos de HOY'
    if (selectedDate.getTime() === yesterday.getTime()) return 'Partidos de AYER'
    if (selectedDate.getTime() === tomorrow.getTime()) return 'Partidos de MAÑANA'

    return `Partidos - ${format(selectedDate, "EEE d 'de' MMMM")}`.toUpperCase()
  }, [selectedDate])

  const handlePrevDay = () => setSelectedDate((d) => addDays(d, -1))
  const handleNextDay = () => setSelectedDate((d) => addDays(d, 1))

  const [defaultCountryId, setDefaultCountryId] = useState<string>('')
  const [matchToEdit, setMatchToEdit] = useState<Match | null>(null)
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null)

  // Initialize database and reload leagues/countries created by init
  useEffect(() => {
    fetch('/api/init')
      .then(res => res.json())
      .then(data => {
        setDefaultCountryId(data.defaultCountryId ?? '')
        fetchLeagues()
      })
      .catch(console.error)
  }, [fetchLeagues])

  const handleAddMatch = async (data: {
    homeTeam: string
    awayTeam: string
    competition: string
    date: string
    time: string
  }) => {
    // First ensure/get league (using default country)
    const league = await ensureLeague(data.competition, defaultCountryId)
    if (!league) return

    // Then ensure teams
    const homeTeam = await ensureTeam(data.homeTeam, league.id)
    const awayTeam = await ensureTeam(data.awayTeam, league.id)
    if (!homeTeam || !awayTeam) return

    // Finally add match
    await addMatch({
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      leagueId: league.id,
      date: data.date,
      time: data.time
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-3 py-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={handlePrevDay}
                aria-label="Día anterior"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-bold uppercase tracking-tight text-foreground">
                {headerLabel}
              </h1>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={handleNextDay}
                aria-label="Día siguiente"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground sm:pl-10">
              Todos los partidos del día
            </p>
          </div>

          {isLoaded && (
            <AddMatchForm
              onAdd={handleAddMatch}
              teams={teams}
              leagues={leagues}
            />
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
            <div className="flex h-14 items-center justify-center gap-2 rounded border border-border bg-card">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
              <span className="text-sm text-muted-foreground">Cargando partidos...</span>
            </div>
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex h-12 animate-pulse items-center gap-3 rounded border border-border bg-card px-3">
                  <div className="h-3 w-10 rounded bg-muted" />
                  <div className="h-3 flex-1 rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <MatchList
            matches={matchesForSelectedDate}
            teams={teams}
            onEdit={(match) => setMatchToEdit(match)}
            onRemove={(match) => setMatchToDelete(match)}
          />
        )}
      </main>

      {/* Confirmar eliminar partido */}
      <AlertDialog open={!!matchToDelete} onOpenChange={(open) => !open && setMatchToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar partido?</AlertDialogTitle>
            <AlertDialogDescription>
              {matchToDelete && (
                <>
                  Se eliminará el partido{' '}
                  <strong>
                    {typeof matchToDelete.homeTeam === 'object' && matchToDelete.homeTeam?.name
                      ? matchToDelete.homeTeam.name
                      : 'Local'}{' '}
                    vs{' '}
                    {typeof matchToDelete.awayTeam === 'object' && matchToDelete.awayTeam?.name
                      ? matchToDelete.awayTeam.name
                      : 'Visitante'}
                  </strong>
                  {' '}({matchToDelete.date} {matchToDelete.time}). No se puede deshacer.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMatchToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (matchToDelete) {
                  await removeMatch(matchToDelete.id)
                  setMatchToDelete(null)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal editar partido */}
      <Dialog open={!!matchToEdit} onOpenChange={(open) => !open && setMatchToEdit(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar partido</DialogTitle>
            <DialogDescription>
              Cambiá fecha, hora o sede. Los equipos no se pueden modificar desde aquí.
            </DialogDescription>
          </DialogHeader>
          {matchToEdit && (
            <EditMatchForm
              match={matchToEdit}
              onSave={async (data) => {
                await updateMatch(matchToEdit.id, data)
                setMatchToEdit(null)
                fetchMatches(format(selectedDate, 'yyyy-MM-dd'))
              }}
              onCancel={() => setMatchToEdit(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EditMatchForm({
  match,
  onSave,
  onCancel,
}: {
  match: Match
  onSave: (data: { date: string; time: string; venue?: string }) => Promise<void>
  onCancel: () => void
}) {
  const [date, setDate] = useState(match.date)
  const [time, setTime] = useState(match.time)
  const [venue, setVenue] = useState(match.venue ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date.trim() || !time.trim()) return
    await onSave({
      date: date.trim(),
      time: time.trim(),
      venue: venue.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Fecha</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Hora</label>
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Sede (opcional)</label>
        <Input
          placeholder="Estadio, ciudad..."
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </DialogFooter>
    </form>
  )
}
