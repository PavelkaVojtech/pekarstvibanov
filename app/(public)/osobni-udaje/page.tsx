'use client'

import React from 'react'
import { AlertCircle, Shield } from 'lucide-react'

export default function OsobniUdajePage() {
  return (
    <div className="bg-background min-h-screen py-16 md:py-24 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <header className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-serif font-extrabold text-foreground tracking-tight">
            Zásady ochrany osobních údajů
          </h1>
          <p className="text-lg text-muted-foreground">
            GDPR - Jak s vašimi údaji zacházíme
          </p>
        </header>

        <div className="space-y-8 text-foreground leading-relaxed">
          
          <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-6 rounded-r-lg">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-red-600 dark:text-red-500 h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-800 dark:text-red-200 mb-3">⚠️ KRITICKÉ UPOZORNĚNÍ PRO NÁVŠTĚVNÍKY</h3>
                <p className="text-red-700 dark:text-red-300 text-sm mb-2">
                  Vzhledem k povaze školního projektu důrazně vyzýváme všechny testující uživatele, aby:
                </p>
                <ul className="space-y-1 text-red-700 dark:text-red-300 text-sm list-disc list-inside">
                  <li><strong>NEZADÁVALI</strong> svoje skutečné osobní údaje</li>
                  <li><strong>NEPOUŽÍVALI</strong> reálná hesla, která používáte u jiných služeb</li>
                  <li><strong>NEZADÁVALI</strong> citlivé nebo důvěrné informace</li>
                </ul>
                <p className="text-red-700 dark:text-red-300 text-sm mt-2">
                  Zadejte prosím pouze vymyšlené údaje (např. Jan Novák, test@test.cz).
                </p>
              </div>
            </div>
          </div>

          <section className="border-b border-border pb-8">
            <h2 className="text-3xl font-serif font-bold mb-4 flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              1. Kdo zpracovává vaše údaje?
            </h2>
            <p>
              Správcem osobních údajů je autor tohoto maturitního projektu (student). Jelikož se jedná o školní projekt, 
              nesplňuje tento web standardní náležitosti běžného komerčního subjektu a není registrován jako osobitý subjekt 
              se zvláštními povinnostmi týkajícími se ochrany osobních údajů.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h2 className="text-3xl font-serif font-bold mb-4">2. Za jakým účelem údaje shromažďujeme?</h2>
            <p className="mb-3">
              Zadané údaje shromažďujeme a ukládáme do databáze výhradně za účelem:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li className="mb-2">Demonstrace a testování funkcionalit e-shopu</li>
              <li className="mb-2">Systém přihlašování a registrace</li>
              <li className="mb-2">Správa uživatelských profilů</li>
              <li className="mb-2">Sledování historie objednávek</li>
              <li>Školního hodnocení maturitní práce</li>
            </ul>
            <p className="mt-4 font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 rounded">
              ✓ Žádné údaje nejsou a nebudou využívány pro marketingové účely, newslettery, ani prodávány třetím stranám.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h2 className="text-3xl font-serif font-bold mb-4">3. Jaké údaje shromažďujeme?</h2>
            <p className="mb-4">
              Zpracováváme pouze ty údaje, které sami dobrovolně zadáte prostřednictvím formulářů na webu:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
              <li>Registrační formulář</li>
              <li>Objednávkový formulář</li>
              <li>Kontaktní formulář</li>
            </ul>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Typické údaje:</p>
              <p className="text-blue-800 dark:text-blue-300 text-sm">
                Jméno, fiktivní e-mailová adresa, fiktivní doručovací adresa, a další informace 
                nezbytné pro demonstraci funkcionalit.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-serif font-bold mb-4">4. Doba uchování a výmaz dat</h2>
            <p className="mb-4">
              Veškerá uživatelská data a záznamy z databáze budou po obhájení maturitní práce a ukončení hodnocení projektu 
              <span className="font-bold"> trvale a nevratně smazána</span>.
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2">Možnosti výmazu vašich údajů:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>Můžete vyžádat výmaz vašeho testovacího účtu přímo v administraci</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>Kontaktujte autora projektu s žádostí o výmaz vašich údajů</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <h3 className="text-xl font-serif font-bold text-orange-900 dark:text-orange-200 mb-3">
              ⚠️ Bezpečnost a prohlášení
            </h3>
            <p className="text-orange-800 dark:text-orange-300 text-sm mb-3">
              Provozovatel <strong>nezaručuje</strong> profesionální zabezpečení databáze proti případným kybernetickým útokům 
              a <strong>zříká se veškeré odpovědnosti</strong> za případný únik nebo zneužití údajů, které jste dobrovolně zadali.
            </p>
            <p className="text-orange-800 dark:text-orange-300 text-sm">
              Jedná se o školský projekt bez komerčního standardu bezpečnosti a ochrany dat.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground space-y-1">
            <p>Poslední aktualizace: březen 2026</p>
            <p>Tento dokument je součástí maturitního projektu</p>
            <p>Projekt je vytvořen bez profitního záměru</p>
          </div>

        </div>
      </div>
    </div>
  )
}
