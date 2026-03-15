'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { useSavedMatches } from '@/hooks/use-saved-matches'
import { downloadAllICS } from '@/lib/calendar'
import { Button } from '@/components/ui/button'
import { Calendar, Copy, Check, Download, Link2, ExternalLink } from 'lucide-react'

export default function CalendarioPage() {
  const { savedMatches, isLoaded } = useSavedMatches()
  const [copied, setCopied] = useState(false)
  const [calendarUrl, setCalendarUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create a unique calendar URL based on saved match IDs
      const matchIds = savedMatches.map(m => m.id).join(',')
      const baseUrl = window.location.origin
      setCalendarUrl(`${baseUrl}/api/calendar?matches=${encodeURIComponent(matchIds)}`)
    }
  }, [savedMatches])

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(calendarUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  const handleSubscribeGoogle = () => {
    const webcalUrl = calendarUrl.replace('https://', 'webcal://').replace('http://', 'webcal://')
    window.open(`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`, '_blank')
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Mi Calendario
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sincroniza tus partidos guardados con tu calendario favorito
          </p>
        </div>

        {savedMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">No tienes partidos guardados</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Guarda algunos partidos primero para crear tu calendario personal
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{savedMatches.length}</p>
                    <p className="text-sm text-muted-foreground">Partidos en calendario</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Link2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">URL de suscripcion</p>
                    <p className="text-sm text-muted-foreground">Sincronizacion automatica</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar URL */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                URL de tu Calendario Personal
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Copia esta URL y agregala a tu aplicacion de calendario favorita para mantener tus partidos sincronizados automaticamente.
              </p>
              
              <div className="mb-4 flex gap-2">
                <div className="flex-1 overflow-hidden rounded-lg border border-border bg-secondary/50 px-4 py-3">
                  <code className="block truncate text-sm text-foreground">
                    {calendarUrl || 'Generando URL...'}
                  </code>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUrl}
                  className="h-12 w-12 shrink-0"
                  disabled={!calendarUrl}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleSubscribeGoogle}
                  className="gap-2"
                  disabled={!calendarUrl}
                >
                  <ExternalLink className="h-4 w-4" />
                  Suscribir en Google Calendar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadAllICS(savedMatches)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar archivo .ics
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Como usar
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Google Calendar</h3>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en {'"'}Suscribir en Google Calendar{'"'} o ve a Configuracion → Agregar calendario → Desde URL
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Apple Calendar</h3>
                    <p className="text-sm text-muted-foreground">
                      Ve a Archivo → Nueva suscripcion de calendario y pega la URL
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Outlook</h3>
                    <p className="text-sm text-muted-foreground">
                      Ve a Agregar calendario → Suscribirse desde la web y pega la URL
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Saved matches preview */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Partidos en tu calendario
              </h2>
              <div className="space-y-2">
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
                        className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-primary">
                            {formattedDate} {match.time}
                          </span>
                          <span className="text-sm text-foreground">
                            {match.homeTeam} vs {match.awayTeam}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {match.competition}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
