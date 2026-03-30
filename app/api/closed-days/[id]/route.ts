import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * PUT /api/closed-days/[id]
 * Aktualizuje zavřený den (admin only)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    const updated = await prisma.businessClosureDay.update({
      where: { id },
      data: {
        date: dateObj,
        type,
        altOpeningHours: altOpeningHours || null,
        note: note || null,
      },
    })

    return NextResponse.json({
      id: updated.id,
      date: updated.date.toISOString().split('T')[0],
      type: updated.type,
      altOpeningHours: updated.altOpeningHours || null,
      note: updated.note,
    })
  } catch (error) {
    console.error('Chyba při aktualizaci zavřeného dne:', error)
    return NextResponse.json(
      { error: 'Chyba při aktualizaci zavřeného dne' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/closed-days/[id]
 * Smaže zavřený den (admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    await prisma.businessClosureDay.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Chyba při mazání zavřeného dne:', error)
    return NextResponse.json(
      { error: 'Chyba při mazání zavřeného dne' },
      { status: 500 }
    )
  }
}
