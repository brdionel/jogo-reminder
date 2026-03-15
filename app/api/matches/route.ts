import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const matches = await prisma.match.findMany({
      where: date ? { date } : undefined,
      include: {
        homeTeam: { include: { league: true, country: true } },
        awayTeam: { include: { league: true, country: true } },
        league: { include: { country: true } }
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    })

    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { homeTeamId, awayTeamId, leagueId, date, time, venue, status } = body

    if (!homeTeamId || !awayTeamId || !leagueId || !date || !time) {
      return NextResponse.json({
        error: 'homeTeamId, awayTeamId, leagueId, date, and time are required'
      }, { status: 400 })
    }

    const match = await prisma.match.create({
      data: { homeTeamId, awayTeamId, leagueId, date, time, venue, status },
      include: {
        homeTeam: { include: { league: true, country: true } },
        awayTeam: { include: { league: true, country: true } },
        league: { include: { country: true } }
      }
    })

    return NextResponse.json(match, { status: 201 })
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await prisma.match.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting match:', error)
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 })
  }
}