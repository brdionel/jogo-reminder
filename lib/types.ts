export interface Country {
  id: string
  name: string
  code?: string
  flag?: string
  createdAt: string
  updatedAt: string
}

export interface League {
  id: string
  name: string
  logo?: string
  countryId: string
  country?: Country
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: string
  name: string
  logo?: string
  leagueId: string
  league?: League
  countryId?: string
  country?: Country
  createdAt: string
  updatedAt: string
}

export interface Match {
  id: string
  homeTeamId: string
  homeTeam: Team
  awayTeamId: string
  awayTeam: Team
  leagueId: string
  league: League
  date: string
  time: string
  venue?: string
  status: 'scheduled' | 'live' | 'finished'
  createdAt: string
  updatedAt: string
}

export type SavedMatch = Match & { savedAt?: string; reminder?: boolean }
