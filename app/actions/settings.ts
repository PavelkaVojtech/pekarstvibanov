'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Schéma pro validaci nastavení
const openingHoursSchema = z.array(
  z.object({
    day: z.string(),
    hours: z.string(),
    closed: z.boolean().optional(),
  })
)

const aboutCardsSchema = z.array(
  z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
  })
)

const siteSettingsSchema = z.object({
  // Kontakt
  phone: z.string().min(1, 'Telefon je povinný'),
  email: z.string().email('Neplatný email'),
  address: z.string().min(1, 'Adresa je povinná'),
  mapIframeSrc: z.string().url('Neplatná URL mapy'),
  openingHours: z.string().transform((val) => {
    const parsed = JSON.parse(val)
    return openingHoursSchema.parse(parsed)
  }),

  // Hero sekce
  heroTitle: z.string().min(1, 'Nadpis je povinný'),
  heroSubtitle: z.string().min(1, 'Podnadpis je povinný'),
  heroButtonText: z.string().min(1, 'Text tlačítka je povinný'),
  heroButtonLink: z.string().min(1, 'Odkaz tlačítka je povinný'),
  heroImageUrl: z.string().nullable().optional(),

  // About sekce
  aboutTitle: z.string().min(1, 'Nadpis je povinný'),
  aboutDescription: z.string().min(1, 'Popis je povinný'),
  aboutCards: z.string().transform((val) => {
    const parsed = JSON.parse(val)
    return aboutCardsSchema.parse(parsed)
  }),

  // Sociální sítě
  facebookUrl: z.string().nullable().optional(),
  instagramUrl: z.string().nullable().optional(),
})

// Výchozí hodnoty, pokud neexistují nastavení v DB
const defaultSettings = {
  phone: '+420 735 290 268',
  email: 'info@pekarnabanov.cz',
  address: 'Bánov 52, 687 54, Česká republika',
  mapIframeSrc:
    'https://maps.google.com/maps?q=B%C3%A1nov%2052%2C%20687%2054%2C%20%C4%8Cesk%C3%A1%20republika&t=&z=15&ie=UTF8&iwloc=&output=embed',
  openingHours: JSON.stringify([
    { day: 'Po – Pá', hours: '7:00 – 15:30', closed: false },
    { day: 'Sobota', hours: '7:00 – 10:00', closed: false },
    { day: 'Neděle', hours: 'Zavřeno', closed: true },
  ]),
  heroTitle: 'Pečeme s láskou',
  heroSubtitle: 'Chléb • Rohlíky • Tradice',
  heroButtonText: 'Naše nabídka',
  heroButtonLink: '/produkty',
  heroImageUrl: null,
  aboutTitle: 'Vůně, která spojuje generace',
  aboutDescription:
    'Naše pekařství z Bánova vzniklo z jedné jednoduché myšlenky – vrátit lidem chuť na opravdové, poctivé pečivo. Každé ráno začínáme dřív než slunce, v naší malé pekárně to voní moukou, kváskem a poctivou prací.',
  aboutCards: JSON.stringify([
    {
      title: 'Tradiční receptury',
      description:
        'Vracíme se ke kořenům poctivého pekařského řemesla a používáme osvědčené postupy.',
      icon: 'Wheat',
    },
    {
      title: 'Čerstvé suroviny',
      description:
        'Každý den vybíráme ty nejlepší lokální suroviny, protože na kvalitě záleží.',
      icon: 'Leaf',
    },
    {
      title: 'Rodinný přístup',
      description:
        'Jsme rodinná pekárna a naši zákazníci jsou pro nás jako součást rodiny.',
      icon: 'Users',
    },
  ]),
  facebookUrl: '#',
  instagramUrl: '#',
}

/**
 * Získá nastavení webu z databáze
 * Pokud neexistuje, vrátí výchozí hodnoty
 */
export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst()
    
    if (!settings) {
      return {
        ...defaultSettings,
        id: null,
        createdAt: null,
        updatedAt: null,
      }
    }

    return settings
  } catch (error) {
    console.error('Chyba při načítání nastavení:', error)
    return {
      ...defaultSettings,
      id: null,
      createdAt: null,
      updatedAt: null,
    }
  }
}

/**
 * Aktualizuje nastavení webu
 * Pouze pro ADMIN uživatele
 */
export async function updateSiteSettings(data: unknown) {
  try {
    // Ověření přihlášení
    const headersList = await headers()
    const session = await auth.api.getSession({
      headers: headersList,
    })

    if (!session?.user) {
      return { success: false, error: 'Nejste přihlášeni' }
    }

    // Ověření role ADMIN
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Nemáte oprávnění ke změně nastavení' }
    }

    // Validace dat
    const validatedData = siteSettingsSchema.parse(data)

    // Převedení zpět na JSON stringy (protože transformace vrací parsovaná data)
    const dataToSave = {
      ...validatedData,
      openingHours: JSON.stringify(validatedData.openingHours),
      aboutCards: JSON.stringify(validatedData.aboutCards),
    }

    // Hledání existujícího nastavení
    const existingSettings = await prisma.siteSettings.findFirst()

    let settings
    if (existingSettings) {
      // Aktualizace existujícího
      settings = await prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: dataToSave,
      })
    } else {
      // Vytvoření nového
      settings = await prisma.siteSettings.create({
        data: dataToSave,
      })
    }

    // Revalidace cache pro všechny stránky
    revalidatePath('/', 'layout')

    return { success: true, data: settings }
  } catch (error) {
    console.error('Chyba při aktualizaci nastavení:', error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Neplatná data formuláře', details: error.issues }
    }

    return { success: false, error: 'Nepodařilo se uložit nastavení' }
  }
}
