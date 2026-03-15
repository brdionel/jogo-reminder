'use client'

import { useState, useEffect, useRef } from 'react'
import { Shield, Trophy, Flag, Plus, Pencil, Trash2, Upload } from 'lucide-react'
import { useTeams } from '@/hooks/use-teams'
import { useLeagues } from '@/hooks/use-leagues'
import { useCountries } from '@/hooks/use-countries'
import { Header } from '@/components/header'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { Country, League, Team } from '@/lib/types'

export default function EquiposPage() {
  const { teams, createTeam, updateTeam, removeTeam, fetchTeams } = useTeams()
  const { leagues, createLeague, updateLeague, removeLeague, deleteAllLeagues, fetchLeagues } = useLeagues()
  const { countries, createCountry, updateCountry, fetchCountries } = useCountries()

  // Modals: 'closed' = cerrado, null = abierto crear, objeto = abierto editar
  const [countryModal, setCountryModal] = useState<Country | null | 'closed'>('closed')
  const [leagueModal, setLeagueModal] = useState<League | null | 'closed'>('closed')
  const [teamModal, setTeamModal] = useState<Team | null | 'closed'>('closed')

  const isCountryEdit = countryModal !== null && countryModal !== 'closed'
  const isLeagueEdit = leagueModal !== null && leagueModal !== 'closed'
  const isTeamEdit = teamModal !== null && teamModal !== 'closed'

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-3 py-6">
        <h1 className="mb-2 text-xl font-bold uppercase tracking-tight text-foreground">
          Equipos, ligas y países
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Creá o editá países, ligas y equipos desde los botones. Las listas muestran lo que tenés cargado.
        </p>

        {/* ---------- PAÍSES ---------- */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
              <Flag className="h-4 w-4" />
              Países
            </h2>
            <Button size="sm" className="gap-1.5" onClick={() => setCountryModal(null)}>
              <Plus className="h-3.5 w-3.5" />
              Agregar país
            </Button>
          </div>
          {countries.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              No hay países. Agregá uno para poder crear ligas.
            </p>
          ) : (
            <ul className="space-y-2">
              {countries.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {c.flag ? (
                      c.flag.startsWith('http') || c.flag.startsWith('/') ? (
                        <img src={c.flag} alt="" className="h-8 w-10 shrink-0 rounded object-contain bg-muted" />
                      ) : (
                        <span className="text-2xl" role="img" aria-label={c.name}>{c.flag}</span>
                      )
                    ) : (
                      <div className="flex h-8 w-10 shrink-0 items-center justify-center rounded bg-muted">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="font-medium text-foreground">{c.name}</span>
                    {c.code && <span className="text-xs text-muted-foreground">({c.code})</span>}
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setCountryModal(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---------- LIGAS ---------- */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
              <Trophy className="h-4 w-4" />
              Ligas
            </h2>
            <div className="flex gap-2">
              {leagues.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                      Borrar todas
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Borrar todas las ligas?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Se eliminarán todas las ligas, sus equipos y partidos. No se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => { await deleteAllLeagues(); fetchTeams() }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Borrar todas
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button size="sm" className="gap-1.5" onClick={() => setLeagueModal(null)} disabled={countries.length === 0}>
                <Plus className="h-3.5 w-3.5" />
                Crear liga
              </Button>
            </div>
          </div>
          {leagues.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              No hay ligas. Creá una o agregá partidos desde Inicio.
            </p>
          ) : (
            <ul className="space-y-2">
              {leagues.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {l.logo ? (
                      <img src={l.logo} alt="" className="h-10 w-10 shrink-0 rounded object-contain bg-muted" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
                        <Trophy className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-foreground">{l.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {l.country?.flag} {l.country?.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setLeagueModal(l)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Borrar &quot;{l.name}&quot;?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminarán también sus equipos y partidos. No se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => { await removeLeague(l.id); fetchTeams() }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Borrar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---------- EQUIPOS ---------- */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground">
              <Shield className="h-4 w-4" />
              Equipos
            </h2>
            <Button size="sm" className="gap-1.5" onClick={() => setTeamModal(null)} disabled={leagues.length === 0}>
              <Plus className="h-3.5 w-3.5" />
              Agregar equipo
            </Button>
          </div>
          {teams.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              No hay equipos. Agregá uno o creá partidos desde Inicio.
            </p>
          ) : (
            <ul className="space-y-2">
              {teams.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {t.logo ? (
                      <img src={t.logo} alt="" className="h-10 w-10 shrink-0 rounded object-contain bg-muted" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-foreground">{t.name}</span>
                      {t.league && (
                        <span className="ml-2 text-xs text-muted-foreground">{t.league.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setTeamModal(t)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Borrar &quot;{t.name}&quot;?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminarán también los partidos donde participa. No se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => { await removeTeam(t.id) }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Borrar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* ---------- MODAL PAÍS ---------- */}
      <Dialog open={countryModal !== 'closed'} onOpenChange={(open) => !open && setCountryModal('closed')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isCountryEdit ? 'Editar país' : 'Nuevo país'}</DialogTitle>
            <DialogDescription>Nombre, código y bandera (emoji o URL).</DialogDescription>
          </DialogHeader>
          <CountryForm
            initial={isCountryEdit ? countryModal : null}
            onSuccess={() => setCountryModal('closed')}
            onSave={async (data) => {
              if (isCountryEdit && countryModal !== null && countryModal !== 'closed') {
                await updateCountry(countryModal.id, data)
              } else {
                await createCountry(data)
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* ---------- MODAL LIGA ---------- */}
      <Dialog open={leagueModal !== 'closed'} onOpenChange={(open) => !open && setLeagueModal('closed')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isLeagueEdit ? 'Editar liga' : 'Nueva liga'}</DialogTitle>
            <DialogDescription>Nombre, país y logo (ruta o subir imagen).</DialogDescription>
          </DialogHeader>
          <LeagueForm
            initial={isLeagueEdit ? leagueModal : null}
            countries={countries}
            onSuccess={() => setLeagueModal('closed')}
            onSave={async (data) => {
              if (isLeagueEdit && leagueModal !== null && leagueModal !== 'closed') {
                await updateLeague(leagueModal.id, data)
              } else {
                await createLeague(data)
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* ---------- MODAL EQUIPO ---------- */}
      <Dialog open={teamModal !== 'closed'} onOpenChange={(open) => !open && setTeamModal('closed')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isTeamEdit ? 'Editar equipo' : 'Nuevo equipo'}</DialogTitle>
            <DialogDescription>Nombre, liga y escudo (ruta o subir imagen).</DialogDescription>
          </DialogHeader>
          <TeamForm
            initial={isTeamEdit ? teamModal : null}
            leagues={leagues}
            onSuccess={() => setTeamModal('closed')}
            onSave={async (data) => {
              if (isTeamEdit && teamModal !== null && teamModal !== 'closed') {
                await updateTeam(teamModal.id, { name: data.name, logo: data.logo })
              } else {
                await createTeam(data)
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ----- Formulario País (dentro del modal) -----
function CountryForm({
  initial,
  onSuccess,
  onSave,
}: {
  initial: Country | null
  onSuccess: () => void
  onSave: (data: { name: string; code?: string; flag?: string }) => Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
  const [flag, setFlag] = useState(initial?.flag ?? '')

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setCode(initial.code ?? '')
      setFlag(initial.flag ?? '')
    } else {
      setName('')
      setCode('')
      setFlag('')
    }
  }, [initial])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const n = name.trim()
    if (!n) return
    await onSave({ name: n, code: code.trim() || undefined, flag: flag.trim() || undefined })
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        placeholder="Nombre (ej. Argentina)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        placeholder="Código (ej. AR)"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 3))}
      />
      <Input
        placeholder="Bandera: emoji 🇦🇷 o URL"
        value={flag}
        onChange={(e) => setFlag(e.target.value)}
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit">{initial ? 'Guardar' : 'Crear'}</Button>
      </DialogFooter>
    </form>
  )
}

// ----- Formulario Liga (dentro del modal) -----
function LeagueForm({
  initial,
  countries,
  onSuccess,
  onSave,
}: {
  initial: League | null
  countries: Country[]
  onSuccess: () => void
  onSave: (data: { name: string; countryId: string; logo?: string }) => Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [countryId, setCountryId] = useState(initial?.countryId ?? countries[0]?.id ?? '')
  const [logoPath, setLogoPath] = useState(initial?.logo?.startsWith('/') ? initial.logo : '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [logoData, setLogoData] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setCountryId(initial.countryId)
      setLogoPath(initial.logo?.startsWith('/') ? initial.logo : '')
      setLogoData(initial.logo && !initial.logo.startsWith('/') ? initial.logo : undefined)
    } else {
      setName('')
      setCountryId(countries[0]?.id ?? '')
      setLogoPath('')
      setLogoData(undefined)
    }
  }, [initial, countries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const n = name.trim()
    if (!n || !countryId) return
    const logo = logoData || (logoPath.trim().startsWith('/') ? logoPath.trim() : undefined)
    await onSave({ name: n, countryId, logo })
    onSuccess()
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setLogoData(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        placeholder="Nombre de la liga"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">País</label>
        <select
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          value={countryId}
          onChange={(e) => setCountryId(e.target.value)}
          required
        >
          <option value="">Seleccionar país</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>{c.flag ? `${c.flag} ` : ''}{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Logo</label>
        <div className="flex gap-2">
          <Input
            placeholder="/assets/leagues/liga.png"
            value={logoPath}
            onChange={(e) => setLogoPath(e.target.value)}
            className="flex-1"
          />
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFile} />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        {(logoData || (logoPath.startsWith('/') && logoPath)) && (
          <img src={logoData || logoPath} alt="" className="mt-2 h-12 w-12 rounded object-contain bg-muted" />
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit">{initial ? 'Guardar' : 'Crear'}</Button>
      </DialogFooter>
    </form>
  )
}

// ----- Formulario Equipo (dentro del modal) -----
function TeamForm({
  initial,
  leagues,
  onSuccess,
  onSave,
}: {
  initial: Team | null
  leagues: League[]
  onSuccess: () => void
  onSave: (data: { name: string; leagueId: string; logo?: string }) => Promise<void>
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [leagueId, setLeagueId] = useState(initial?.leagueId ?? leagues[0]?.id ?? '')
  const [logoPath, setLogoPath] = useState(initial?.logo?.startsWith('/') ? initial.logo : '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoData, setLogoData] = useState<string | undefined>(initial?.logo && !initial.logo.startsWith('/') ? initial.logo : undefined)

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setLeagueId(initial.leagueId)
      setLogoPath(initial.logo?.startsWith('/') ? initial.logo : '')
      setLogoData(initial.logo && !initial.logo.startsWith('/') ? initial.logo : undefined)
    } else {
      setName('')
      setLeagueId(leagues[0]?.id ?? '')
      setLogoPath('')
      setLogoData(undefined)
    }
  }, [initial, leagues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const n = name.trim()
    if (!n || !leagueId) return
    const logo = logoData || (logoPath.trim().startsWith('/') ? logoPath.trim() : undefined)
    await onSave({ name: n, leagueId, logo })
    onSuccess()
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setLogoData(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        placeholder="Nombre del equipo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Liga</label>
        <select
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
          required
        >
          <option value="">Seleccionar liga</option>
          {leagues.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Escudo</label>
        <div className="flex gap-2">
          <Input
            placeholder="/assets/teams/equipo.png"
            value={logoPath}
            onChange={(e) => setLogoPath(e.target.value)}
            className="flex-1"
          />
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFile} />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        {(logoData || (logoPath.startsWith('/') && logoPath)) && (
          <img src={logoData || logoPath} alt="" className="mt-2 h-12 w-12 rounded object-contain bg-muted" />
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit">{initial ? 'Guardar' : 'Crear'}</Button>
      </DialogFooter>
    </form>
  )
}