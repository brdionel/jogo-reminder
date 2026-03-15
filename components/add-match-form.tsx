'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Match, Team, League } from '@/lib/types'

interface AddMatchFormProps {
  onAdd: (data: {
    homeTeam: string
    awayTeam: string
    competition: string
    date: string
    time: string
  }) => void
  teams: Team[]
  leagues: League[]
}

const EMPTY_FORM = {
  homeTeam: '',
  awayTeam: '',
  date: '',
  time: '',
  competition: '',
}

export function AddMatchForm({ onAdd, teams, leagues }: AddMatchFormProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({})

  function validate() {
    const next: Partial<typeof EMPTY_FORM> = {}
    if (!form.homeTeam.trim()) next.homeTeam = 'Requerido'
    if (!form.awayTeam.trim()) next.awayTeam = 'Requerido'
    if (!form.date) next.date = 'Requerido'
    if (!form.time) next.time = 'Requerido'
    if (!form.competition.trim()) next.competition = 'Requerido'
    return next
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onAdd({
      homeTeam: form.homeTeam.trim(),
      awayTeam: form.awayTeam.trim(),
      date: form.date,
      time: form.time,
      competition: form.competition.trim(),
    })
    setForm(EMPTY_FORM)
    setErrors({})
    setOpen(false)
  }

  function handleChange(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => {
      const newForm = { ...prev, [field]: value }
      // Reset teams when competition changes
      if (field === 'competition') {
        newForm.homeTeam = ''
        newForm.awayTeam = ''
      }
      return newForm
    })
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setForm(EMPTY_FORM)
      setErrors({})
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 text-xs uppercase">
          <Plus className="h-3.5 w-3.5" />
          Agregar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo partido</DialogTitle>
          <DialogDescription>
            Completa los datos del partido que queres seguir.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 pt-2">
          {/* Competition */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="competition">
              Campeonato
            </label>
            <Select
              value={form.competition}
              onValueChange={(value) => handleChange('competition', value)}
            >
              <SelectTrigger className={errors.competition ? 'border-destructive' : ''}>
                <SelectValue placeholder="Seleccioná un campeonato" />
              </SelectTrigger>
              <SelectContent>
                {leagues.map((league) => (
                  <SelectItem key={league.id} value={league.name}>
                    {league.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.competition && (
              <p className="text-xs text-destructive">{errors.competition}</p>
            )}
          </div>

          {/* Teams */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="homeTeam">
                Equipo local
              </label>
              <Select
                value={form.homeTeam}
                onValueChange={(value) => handleChange('homeTeam', value)}
                disabled={!form.competition}
              >
                <SelectTrigger className={errors.homeTeam ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Seleccioná equipo local" />
                </SelectTrigger>
                <SelectContent>
                  {teams
                    .filter((team) => team.leagueId === leagues.find(l => l.name === form.competition)?.id)
                    .map((team) => (
                      <SelectItem key={team.id} value={team.name}>
                        {team.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.homeTeam && (
                <p className="text-xs text-destructive">{errors.homeTeam}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="awayTeam">
                Equipo visitante
              </label>
              <Select
                value={form.awayTeam}
                onValueChange={(value) => handleChange('awayTeam', value)}
                disabled={!form.competition}
              >
                <SelectTrigger className={errors.awayTeam ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Seleccioná equipo visitante" />
                </SelectTrigger>
                <SelectContent>
                  {teams
                    .filter((team) => team.leagueId === leagues.find(l => l.name === form.competition)?.id && team.name !== form.homeTeam)
                    .map((team) => (
                      <SelectItem key={team.id} value={team.name}>
                        {team.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.awayTeam && (
                <p className="text-xs text-destructive">{errors.awayTeam}</p>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-foreground" htmlFor="date">
                  Fecha
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <Checkbox
                    id="date-today"
                    checked={form.date === format(new Date(), 'yyyy-MM-dd')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleChange('date', format(new Date(), 'yyyy-MM-dd'))
                      }
                    }}
                  />
                  <span>Hoy</span>
                </label>
              </div>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="time">
                Hora
              </label>
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className={errors.time ? 'border-destructive' : ''}
              />
              {errors.time && (
                <p className="text-xs text-destructive">{errors.time}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
