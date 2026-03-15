import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leagueId = searchParams.get('leagueId')

    const teams = await prisma.team.findMany({
      where: leagueId ? { leagueId } : undefined,
      include: { league: true, country: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, logo, leagueId, countryId } = body

    if (!name || !leagueId) {
      return NextResponse.json({ error: 'Name and leagueId are required' }, { status: 400 })
    }

    const team = await prisma.team.create({
      data: { name, logo, leagueId, countryId },
      include: { league: true, country: true }
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, logo, leagueId } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const team = await prisma.team.update({
      where: { id },
      data: {
        ...(name != null && { name }),
        ...(logo != null && { logo }),
        ...(leagueId != null && { leagueId }),
      },
      include: { league: true, country: true }
    })

    return NextResponse.json(team)
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    await prisma.match.deleteMany({ where: { OR: [{ homeTeamId: id }, { awayTeamId: id }] } })
    await prisma.team.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 })
  }
}