import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const leagues = await prisma.league.findMany({
      include: { country: true },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(leagues)
  } catch (error) {
    console.error('Error fetching leagues:', error)
    return NextResponse.json({ error: 'Failed to fetch leagues' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, logo, countryId } = body

    if (!name || !countryId) {
      return NextResponse.json({ error: 'Name and countryId are required' }, { status: 400 })
    }

    const league = await prisma.league.create({
      data: { name, logo, countryId },
      include: { country: true }
    })

    return NextResponse.json(league, { status: 201 })
  } catch (error) {
    console.error('Error creating league:', error)
    return NextResponse.json({ error: 'Failed to create league' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, logo, countryId } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const league = await prisma.league.update({
      where: { id },
      data: {
        ...(name != null && { name }),
        ...(logo != null && { logo }),
        ...(countryId != null && { countryId })
      },
      include: { country: true }
    })

    return NextResponse.json(league)
  } catch (error) {
    console.error('Error updating league:', error)
    return NextResponse.json({ error: 'Failed to update league' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const all = searchParams.get('all') === 'true'

    if (all) {
      // Borrar todas las ligas (y sus partidos y equipos)
      const leagues = await prisma.league.findMany({ select: { id: true } })
      for (const league of leagues) {
        await prisma.match.deleteMany({ where: { leagueId: league.id } })
        await prisma.team.deleteMany({ where: { leagueId: league.id } })
        await prisma.league.delete({ where: { id: league.id } })
      }
      return NextResponse.json({ success: true, deleted: leagues.length })
    }

    if (!id) {
      return NextResponse.json({ error: 'ID is required (or ?all=true)' }, { status: 400 })
    }

    await prisma.match.deleteMany({ where: { leagueId: id } })
    await prisma.team.deleteMany({ where: { leagueId: id } })
    await prisma.league.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting league(s):', error)
    return NextResponse.json({ error: 'Failed to delete league(s)' }, { status: 500 })
  }
}