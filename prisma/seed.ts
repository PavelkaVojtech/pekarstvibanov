import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Začínám seedování databáze...')

  // Vytvoření výchozího nastavení webu
  const existingSettings = await prisma.siteSettings.findFirst()
  
  if (!existingSettings) {
    const openingHours = JSON.stringify([
      { day: 'Po – Pá', hours: '7:00 – 15:30', closed: false },
      { day: 'Sobota', hours: '7:00 – 10:00', closed: false },
      { day: 'Neděle', hours: 'Zavřeno', closed: true },
    ])

    const aboutCards = JSON.stringify([
      {
        title: 'Tradiční receptury',
        description: 'Vracíme se ke kořenům poctivého pekařského řemesla a používáme osvědčené postupy.',
        icon: 'Wheat',
      },
      {
        title: 'Čerstvé suroviny',
        description: 'Každý den vybíráme ty nejlepší lokální suroviny, protože na kvalitě záleží.',
        icon: 'Leaf',
      },
      {
        title: 'Rodinný přístup',
        description: 'Jsme rodinná pekárna a naši zákazníci jsou pro nás jako součást rodiny.',
        icon: 'Users',
      },
    ])

    const settings = await prisma.siteSettings.create({
      data: {
        // Kontakt
        phone: '+420 735 290 268',
        email: 'info@pekarnabanov.cz',
        address: 'Bánov 52, 687 54, Česká republika',
        mapIframeSrc: 'https://maps.google.com/maps?q=B%C3%A1nov%2052%2C%20687%2054%2C%20%C4%8Cesk%C3%A1%20republika&t=&z=15&ie=UTF8&iwloc=&output=embed',
        openingHours,

        // Hero sekce
        heroTitle: 'Pečeme s láskou',
        heroSubtitle: 'Chléb • Rohlíky • Tradice',
        heroButtonText: 'Naše nabídka',
        heroButtonLink: '/produkty',
        heroImageUrl: null,

        // About sekce
        aboutTitle: 'Vůně, která spojuje generace',
        aboutDescription: 'Naše pekařství z Bánova vzniklo z jedné jednoduché myšlenky – vrátit lidem chuť na opravdové, poctivé pečivo. Každé ráno začínáme dřív než slunce, v naší malé pekárně to voní moukou, kváskem a poctivou prací.',
        aboutCards,

        // Sociální sítě
        facebookUrl: '#',
        instagramUrl: '#',
      },
    })

    console.log('✅ Vytvořeno výchozí nastavení webu:', settings.id)
  } else {
    console.log('ℹ️  Nastavení webu již existuje, přeskakuji...')
  }

  // Vytvoření výchozích kategorií produktů
  const defaultCategories = [
    { name: 'Chléb', slug: 'chleby' },
    { name: 'Běžné pečivo', slug: 'bezne-pecivo' },
    { name: 'Jemné pečivo', slug: 'jemne-pecivo' },
  ]

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
      },
      create: {
        name: category.name,
        slug: category.slug,
        imageUrl: null,
      },
    })
  }

  console.log('✅ Výchozí kategorie jsou připravené.')

  console.log('✅ Seedování dokončeno!')
}

main()
  .catch((e) => {
    console.error('❌ Chyba při seedování:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
