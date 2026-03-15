import { Match, SavedMatch } from './types'

// Generate ICS file content for a single match
export function generateICS(match: Match | SavedMatch): string {
  const startDateTime = new Date(`${match.date}T${match.time}:00`)
  const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000) // 2 hours duration
  
  // Reminder 30 minutes before
  const reminderMinutes = 30

  const formatDateForICS = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mis Partidos//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${match.id}@mispartidos.app
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(startDateTime)}
DTEND:${formatDateForICS(endDateTime)}
SUMMARY:${match.homeTeam} vs ${match.awayTeam}
DESCRIPTION:${match.competition}${match.venue ? ` - ${match.venue}` : ''}
LOCATION:${match.venue || ''}
BEGIN:VALARM
TRIGGER:-PT${reminderMinutes}M
ACTION:DISPLAY
DESCRIPTION:${match.homeTeam} vs ${match.awayTeam} comienza en ${reminderMinutes} minutos
END:VALARM
END:VEVENT
END:VCALENDAR`

  return icsContent
}

// Generate ICS for multiple matches (calendar subscription)
export function generateMultipleICS(matches: (Match | SavedMatch)[]): string {
  const formatDateForICS = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const events = matches.map((match) => {
    const startDateTime = new Date(`${match.date}T${match.time}:00`)
    const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000)

    return `BEGIN:VEVENT
UID:${match.id}@mispartidos.app
DTSTAMP:${formatDateForICS(new Date())}
DTSTART:${formatDateForICS(startDateTime)}
DTEND:${formatDateForICS(endDateTime)}
SUMMARY:${match.homeTeam} vs ${match.awayTeam}
DESCRIPTION:${match.competition}${match.venue ? ` - ${match.venue}` : ''}
LOCATION:${match.venue || ''}
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:${match.homeTeam} vs ${match.awayTeam} comienza en 30 minutos
END:VALARM
END:VEVENT`
  }).join('\n')

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mis Partidos//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Mis Partidos
${events}
END:VCALENDAR`
}

// Download ICS file
export function downloadICS(match: Match | SavedMatch) {
  const icsContent = generateICS(match)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${match.homeTeam}-vs-${match.awayTeam}.ics`.replace(/\s+/g, '-')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Download all saved matches as ICS
export function downloadAllICS(matches: (Match | SavedMatch)[]) {
  const icsContent = generateMultipleICS(matches)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = 'mis-partidos.ics'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Generate Google Calendar URL
export function getGoogleCalendarUrl(match: Match | SavedMatch): string {
  const startDateTime = new Date(`${match.date}T${match.time}:00`)
  const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000)
  
  const formatForGoogle = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${match.homeTeam} vs ${match.awayTeam}`,
    dates: `${formatForGoogle(startDateTime)}/${formatForGoogle(endDateTime)}`,
    details: match.competition,
    location: match.venue || '',
  })
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
