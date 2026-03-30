'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// --- VALIDAČNÍ SCHÉMATA ---

const createClosureDaySchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Neplatný formát data'),
  type: z.enum(['CLOSED', 'MODIFIED']),
  altOpeningHours: z.string().optional(),
  note: z.string().optional(),
})

const updateClosureDaySchema = createClosureDaySchema

// --- HELPER FUNKCE ---

/**
 * Ověří, zda je uživatel admin
 */
async function isAdmin() {
  const headersList = await headers()
  const session = await auth.api.getSession({
    headers: headersList,
  })

  if (!session?.user) {
    return false
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  return user?.role === 'ADMIN'
}

// --- PUBLIC AKCE (pro uživatele) ---

/**
 * Získá všechny zavřené dny od TODAY
 */
export async function getUpcomingClosuredDays() {
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

    return closureDays.map((day) => ({
      id: day.id,
      date: day.date,
      type: day.type,
      altOpeningHours: day.altOpeningHours || null,
      note: day.note,
    }))
  } catch (error) {
    console.error('Chyba při načítání zavřených dní:', error)
    return []
  }
}

/**
 * Zkontroluje, zda je pekárna dnes zavřena
 */
export async function isClosedToday() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const closure = await prisma.businessClosureDay.findUnique({
      where: {
        date: today,
      },
    })

    if (!closure) return false
    if (closure.type === 'CLOSED') return true
    return false
  } catch (error) {
    console.error('Chyba při kontrole zavřené dne:', error)
    return false
  }
}

/**
 * Vrátí informaci o dneší zavřeném dni (pokud existuje)
 */
export async function getTodaysClosureInfo() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const closure = await prisma.businessClosureDay.findUnique({
      where: {
        date: today,
      },
    })

    if (!closure) return null

    return {
      id: closure.id,
      date: closure.date,
      type: closure.type,
      altOpeningHours: closure.altOpeningHours || null,
      note: closure.note,
    }
  } catch (error) {
    console.error('Chyba při načítání informace o dnešním dni:', error)
    return null
  }
}

// --- ADMIN AKCE ---

/**
 * Vytvoří nový zavřený/pozměněný den
 */
export async function createClosureDay(data: unknown) {
  try {
    if (!(await isAdmin())) {
      return { success: false, error: 'Nemáte oprávnění' }
    }

    const validated = createClosureDaySchema.parse(data)

    // Převod stringu na Date - DŮLEŽITÉ: přidej 'T00:00:00Z' pro UTC, aby nebyly timezone problémy
    const dateObj = new Date(validated.date + 'T00:00:00Z')

    // Validace dat pro MODIFIED typ - kontrola formátu "HH:MM - HH:MM"
    if (validated.type === 'MODIFIED' && validated.altOpeningHours) {
      const timeFormat = /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/
      if (!timeFormat.test(validated.altOpeningHours.trim())) {
        return { success: false, error: 'Neplatný formát času. Používejte formát: HH:MM - HH:MM (např. 07:00 - 11:00)' }
      }
    }

    const existingClosure = await prisma.businessClosureDay.findUnique({
      where: { date: dateObj },
    })

    if (existingClosure) {
      return { success: false, error: 'Pro tento den již existuje záznam' }
    }

    const created = await prisma.businessClosureDay.create({
      data: {
        date: dateObj,
        type: validated.type,
        altOpeningHours: validated.altOpeningHours || null,
        note: validated.note || null,
      },
    })

    revalidatePath('/') // Znovu načti veřejné stránky
    revalidatePath('/admin/nastaveni') // Znovu načti admin nastavení

    return {
      success: true,
      data: {
        id: created.id,
        date: created.date,
        type: created.type,
        altOpeningHours: created.altOpeningHours || null,
        note: created.note,
      },
    }
  } catch (error) {
    console.error('Chyba při vytváření zavřeného dne:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Chyba validace' }
    }
    return { success: false, error: 'Chyba při vytváření zavřeného dne' }
  }
}

/**
 * Oblaktualizuje existující zavřený/pozměněný den
 */
export async function updateClosureDay(id: string, data: unknown) {
  try {
    if (!(await isAdmin())) {
      return { success: false, error: 'Nemáte oprávnění' }
    }

    const validated = updateClosureDaySchema.parse(data)

    // Převod stringu na Date - DŮLEŽITÉ: přidej 'T00:00:00Z' pro UTC, aby nebyly timezone problémy
    const dateObj = new Date(validated.date + 'T00:00:00Z')

    // Validace dat pro MODIFIED typ
    if (validated.type === 'MODIFIED' && validated.altOpeningHours) {
      try {
        JSON.parse(validated.altOpeningHours)
      } catch {
        return { success: false, error: 'Neplatný formát alternativních otevíracích hodin' }
      }
    }

    // Zkontroluj, zda den již neexistuje pro jiného id
    const existingClosure = await prisma.businessClosureDay.findFirst({
      where: {
        date: dateObj,
        id: { not: id },
      },
    })

    if (existingClosure) {
      return { success: false, error: 'Pro tento den již existuje záznam' }
    }

    const updated = await prisma.businessClosureDay.update({
      where: { id },
      data: {
        date: dateObj,
        type: validated.type,
        altOpeningHours: validated.altOpeningHours || null,
        note: validated.note || null,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin/nastaveni')

    return {
      success: true,
      data: {
        id: updated.id,
        date: updated.date,
        type: updated.type,
        altOpeningHours: updated.altOpeningHours || null,
        note: updated.note,
      },
    }
  } catch (error) {
    console.error('Chyba při aktualizaci zavřeného dne:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || 'Chyba validace' }
    }
    return { success: false, error: 'Chyba při aktualizaci zavřeného dne' }
  }
}

/**
 * Smaže zavřený/pozměněný den
 */
export async function deleteClosureDay(id: string) {
  try {
    if (!(await isAdmin())) {
      return { success: false, error: 'Nemáte oprávnění' }
    }

    await prisma.businessClosureDay.delete({
      where: { id },
    })

    revalidatePath('/')
    revalidatePath('/admin/nastaveni')

    return { success: true }
  } catch (error) {
    console.error('Chyba při mazání zavřeného dne:', error)
    return { success: false, error: 'Chyba při mazání zavřeného dne' }
  }
}

/**
 * Získá všechny zavřené dny (pro admin)
 */
export async function getAllClosureDays() {
  try {
    if (!(await isAdmin())) {
      return { success: false, error: 'Nemáte oprávnění', data: [] }
    }

    const closureDays = await prisma.businessClosureDay.findMany({
      orderBy: {
        date: 'asc',
      },
    })

    return {
      success: true,
      data: closureDays.map((day) => ({
        id: day.id,
        date: day.date,
        type: day.type,
        altOpeningHours: day.altOpeningHours || null,
        note: day.note,
      })),
    }
  } catch (error) {
    console.error('Chyba při načítání zavřených dní:', error)
    return { success: false, error: 'Chyba při načítání zavřených dní', data: [] }
  }
}
