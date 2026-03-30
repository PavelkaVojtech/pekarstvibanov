import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * GET /api/closed-days
 * Vrátí všechny zavřené dny
 * Public endpoint - vrátí jen budoucí dny
 */
export async function GET(req: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const closureDays = await prisma.businessClosureDay.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json(
      closureDays.map((day) => ({
        id: day.id,
        date: day.date.toISOString().split('T')[0], // Vrátí jen datum YYYY-MM-DD
        type: day.type,
        altOpeningHours: day.altOpeningHours || null,
        note: day.note,
      }))
    )
  } catch (error) {
    console.error('Chyba při načítání zavřených dní:', error)
    return NextResponse.json([], { status: 500 })
  }
}

/**
 * POST /api/closed-days
 * Vytvoří nový zavřený den (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const headersList = await headers()
    const session = await auth.api.getSession({
      headers: headersList,
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Nejste přihlášeni' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nemáte oprávnění' }, { status: 403 })
    }

    const body = await req.json()
    const { date, type, altOpeningHours, note } = body

    if (!date || !type) {
      return NextResponse.json(
        { error: 'Datum a typ jsou povinné' },
        { status: 400 }
      )
    }

    const dateObj = new Date(date)
    dateObj.setHours(0, 0, 0, 0)

    const existingClosure = await prisma.businessClosureDay.findUnique({
      where: { date: dateObj },
    })

    if (existingClosure) {
      return NextResponse.json(
        { error: 'Pro tento den již existuje záznam' },
        { status: 400 }
      )
    }

    const created = await prisma.businessClosureDay.create({
      data: {
        date: dateObj,
        type,
        altOpeningHours: altOpeningHours || null,
        note: note || null,
      },
    })

    return NextResponse.json(
      {
        id: created.id,
        date: created.date.toISOString().split('T')[0],
        type: created.type,
        altOpeningHours: created.altOpeningHours || null,
        note: created.note,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Chyba při vytváření zavřeného dne:', error)
    return NextResponse.json(
      { error: 'Chyba při vytváření zavřeného dne' },
      { status: 500 }
    )
  }
}
