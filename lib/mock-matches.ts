import { Match } from './types'

// Helper to get dates relative to today
const getDate = (daysFromNow: number) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split('T')[0]
}

export const mockMatches: Match[] = [
  // Hoy
  {
    id: '1',
    homeTeam: 'Bayer Leverkusen',
    awayTeam: 'Arsenal',
    competition: 'UEFA Champions League',
    date: getDate(0),
    time: '14:45',
    venue: 'BayArena',
    status: 'scheduled',
  },
  {
    id: '2',
    homeTeam: 'Real Madrid',
    awayTeam: 'Manchester City',
    competition: 'UEFA Champions League',
    date: getDate(0),
    time: '17:00',
    venue: 'Santiago Bernabéu',
    status: 'scheduled',
  },
  {
    id: '3',
    homeTeam: 'Barcelona',
    awayTeam: 'PSG',
    competition: 'UEFA Champions League',
    date: getDate(0),
    time: '21:00',
    venue: 'Camp Nou',
    status: 'scheduled',
  },
  // Mañana
  {
    id: '4',
    homeTeam: 'Inter Milan',
    awayTeam: 'Bayern Munich',
    competition: 'UEFA Champions League',
    date: getDate(1),
    time: '17:00',
    venue: 'San Siro',
    status: 'scheduled',
  },
  {
    id: '5',
    homeTeam: 'Liverpool',
    awayTeam: 'Atlético Madrid',
    competition: 'UEFA Champions League',
    date: getDate(1),
    time: '21:00',
    venue: 'Anfield',
    status: 'scheduled',
  },
  // Pasado mañana
  {
    id: '6',
    homeTeam: 'Boca Juniors',
    awayTeam: 'River Plate',
    competition: 'Copa Libertadores',
    date: getDate(2),
    time: '20:00',
    venue: 'La Bombonera',
    status: 'scheduled',
  },
  {
    id: '7',
    homeTeam: 'Juventus',
    awayTeam: 'AC Milan',
    competition: 'Serie A',
    date: getDate(2),
    time: '18:45',
    venue: 'Allianz Stadium',
    status: 'scheduled',
  },
  // Esta semana
  {
    id: '8',
    homeTeam: 'Manchester United',
    awayTeam: 'Chelsea',
    competition: 'Premier League',
    date: getDate(3),
    time: '16:30',
    venue: 'Old Trafford',
    status: 'scheduled',
  },
  {
    id: '9',
    homeTeam: 'Borussia Dortmund',
    awayTeam: 'RB Leipzig',
    competition: 'Bundesliga',
    date: getDate(4),
    time: '15:30',
    venue: 'Signal Iduna Park',
    status: 'scheduled',
  },
  {
    id: '10',
    homeTeam: 'Ajax',
    awayTeam: 'PSV Eindhoven',
    competition: 'Eredivisie',
    date: getDate(5),
    time: '14:30',
    venue: 'Johan Cruyff Arena',
    status: 'scheduled',
  },
]

export const groupMatchesByDate = (matches: Match[]) => {
  const groups: Record<string, Match[]> = {}
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  matches.forEach((match) => {
    const matchDate = new Date(match.date)
    matchDate.setHours(0, 0, 0, 0)
    
    let label: string
    
    if (matchDate.getTime() === today.getTime()) {
      label = 'Hoy'
    } else if (matchDate.getTime() === tomorrow.getTime()) {
      label = 'Mañana'
    } else {
      label = matchDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
      // Capitalize first letter
      label = label.charAt(0).toUpperCase() + label.slice(1)
    }
    
    if (!groups[label]) {
      groups[label] = []
    }
    groups[label].push(match)
  })
  
  // Sort matches within each group by time
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => a.time.localeCompare(b.time))
  })
  
  return groups
}
