import { NextRequest, NextResponse } from 'next/server'
import { mockMatches } from '@/lib/mock-matches'
import { generateMultipleICS } from '@/lib/calendar'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const matchIds = searchParams.get('matches')

  if (!matchIds) {
    return new NextResponse('No matches specified', { status: 400 })
  }

  const ids = matchIds.split(',').filter(Boolean)
  
  // Filter matches by IDs
  const selectedMatches = mockMatches.filter(match => ids.includes(match.id))

  if (selectedMatches.length === 0) {
    return new NextResponse('No valid matches found', { status: 404 })
  }

  const icsContent = generateMultipleICS(selectedMatches)

  return new NextResponse(icsContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="mis-partidos.ics"',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
}
