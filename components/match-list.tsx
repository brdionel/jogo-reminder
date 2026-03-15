'use client'

import { useState, useEffect } from 'react'
import { Match, Team } from '@/lib/types'
import { MatchCard } from './match-card'
import { useSavedMatches } from '@/hooks/use-saved-matches'
import { Empty } from '@/components/ui/empty'
import { CalendarX } from 'lucide-react'

function groupMatchesByLeague(matches: Match[]): Record<string, Match[]> {
  const groups: Record<string, Match[]> = {}

  for (const match of matches) {
    const leagueName =
      (typeof match.league === 'object' && match.league?.name) ? match.league.name : 'Otros'
    if (!groups[leagueName]) groups[leagueName] = []
    groups[leagueName].push(match)
  }

  // Sort matches within each group by date and time
  for (const key in groups) {
    groups[key].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })
  }

  return groups
}

function formatDateLabel(dateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  const matchDate = new Date(`${dateStr}T00:00:00`)
  matchDate.setHours(0, 0, 0, 0)

  if (matchDate.getTime() === today.getTime()) {
    return 'HOY'
  } else if (matchDate.getTime() === tomorrow.getTime()) {
    return 'MANANA'
  } else {
    return matchDate.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).toUpperCase()
  }
}

interface MatchListProps {
  matches: Match[]
  teams: Team[]
  onRemove?: (id: string) => void
}

export function MatchList({ matches, teams, onRemove }: MatchListProps) {
  const { isSaved, toggleMatch } = useSavedMatches()
  const [groupedMatches, setGroupedMatches] = useState<Record<string, Match[]> | null>(null)

  useEffect(() => {
    setGroupedMatches(groupMatchesByLeague(matches))
  }, [matches])

  if (!groupedMatches) return null

  // Ordenar ligas por nombre para que el orden sea estable
  const leagueNames = Object.keys(groupedMatches).sort((a, b) =>
    (a === 'Otros' ? 1 : 0) - (b === 'Otros' ? 1 : 0) || a.localeCompare(b)
  )

  if (leagueNames.length === 0) {
    return (
      <Empty className="py-16">
        <CalendarX className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">No hay partidos cargados aun.</p>
        <p className="text-sm text-muted-foreground">Usa el boton para agregar el primero.</p>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {leagueNames.map((leagueName) => (
        <section key={leagueName} className="overflow-hidden rounded border border-border bg-card shadow-sm">
          {/* Cabecera por liga */}
          <div className="bg-primary px-3 py-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-primary-foreground">
              {leagueName}
            </h2>
          </div>

          {/* Partidos de esta liga */}
          <div className="divide-y divide-border">
            {groupedMatches[leagueName].map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isSaved={isSaved(match.id)}
                onToggleSave={() => toggleMatch(match)}
                onRemove={onRemove ? () => onRemove(match.id) : undefined}
                dateLabel={formatDateLabel(match.date)}
                homeTeamLogo={typeof match.homeTeam === 'object' ? match.homeTeam?.logo : undefined}
                awayTeamLogo={typeof match.awayTeam === 'object' ? match.awayTeam?.logo : undefined}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
