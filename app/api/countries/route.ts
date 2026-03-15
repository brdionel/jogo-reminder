import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(countries)
  } catch (error) {
    console.error('Error fetching countries:', error)
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, code, flag } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const country = await prisma.country.create({
      data: { name, code, flag }
    })

    return NextResponse.json(country, { status: 201 })
  } catch (error) {
    console.error('Error creating country:', error)
    return NextResponse.json({ error: 'Failed to create country' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, code, flag } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const country = await prisma.country.update({
      where: { id },
      data: {
        ...(name != null && { name }),
        ...(code != null && { code }),
        ...(flag != null && { flag })
      }
    })

    return NextResponse.json(country)
  } catch (error) {
    console.error('Error updating country:', error)
    return NextResponse.json({ error: 'Failed to update country' }, { status: 500 })
  }
}