'use client'

import { useEffect, useMemo, useState } from 'react'
import { addDays, format } from 'date-fns'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Header } from '@/components/header'
import { MatchList } from '@/components/match-list'
import { AddMatchForm } from '@/components/add-match-form'
import { Button } from '@/components/ui/button'
import { useMatches } from '@/hooks/use-matches'
import { useTeams } from '@/hooks/use-teams'
import { useLeagues } from '@/hooks/use-leagues'

export default function HomePage() {
  const { matches, addMatch, removeMatch, isLoaded, fetchMatches } = useMatches()
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
          <div className="flex items-center gap-3">
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

          {isLoaded && (
            <AddMatchForm
              onAdd={handleAddMatch}
              teams={teams}
              leagues={leagues}
            />
          )}
        </div>

        {isLoaded && (
          <MatchList
            matches={matchesForSelectedDate}
            teams={teams}
            onRemove={removeMatch}
          />
        )}
      </main>
    </div>
  )
}
