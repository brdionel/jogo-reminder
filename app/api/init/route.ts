import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Create default country if it doesn't exist
    let defaultCountry = await prisma.country.findFirst({
      where: { name: 'Argentina' }
    })

    if (!defaultCountry) {
      defaultCountry = await prisma.country.create({
        data: {
          name: 'Argentina',
          code: 'AR',
          flag: '🇦🇷'
        }
      })
    }

    return NextResponse.json({
      message: 'Database initialized',
      defaultCountryId: defaultCountry.id
    })
  } catch (error) {
    console.error('Error initializing database:', error)
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 })
  }
}