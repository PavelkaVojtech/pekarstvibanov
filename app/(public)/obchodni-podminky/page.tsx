'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'

export default function VopPage() {
  return (
    <div className="bg-background min-h-screen py-16 md:py-24 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <header className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-serif font-extrabold text-foreground tracking-tight">
            Všeobecné obchodní podmínky
          </h1>
          <p className="text-lg text-muted-foreground">
            Smluvní podmínky pro používání e-shopu Pekařství Bánov
          </p>
        </header>

        <div className="space-y-8 text-foreground leading-relaxed">
          
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-400 p-6 rounded-r-lg">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-yellow-600 dark:text-yellow-500 h-6 w-6 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">Důležité upozornění</h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  Tento e-shop je školským projektem vytvořeným pro demonstraci programátorských dovedností.
                  Nejedná se o skutečný komerční web. Veškerý obsah je fiktivní.
                </p>
              </div>
            </div>
          </div>

          <section className="border-b border-border pb-8">
            <h2 className="text-3xl font-serif font-bold mb-4">1. Úvodní ustanovení</h2>
            <p className="mb-4">
              Tyto obchodní podmínky upravují užívání webových stránek e-shopu "Pekařství Bánov". Provozovatelem těchto stránek je student (dále jen „Provozovatel").
            </p>
            <p>
              Tento webový portál byl vytvořen výhradně jako maturitní projekt a slouží pouze k demonstraci programátorských a designových dovedností v rámci školního hodnocení. Web neslouží ke skutečnému komerčnímu prodeji zboží ani služeb.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h2 className="text-3xl font-serif font-bold mb-4">2. Fiktivní charakter e-shopu a vyloučení odpovědnosti</h2>
            <p className="mb-4">
              Veškerý obsah, nabídka produktů, ceny a služby uvedené na těchto webových stránkách jsou čistě fiktivní.
            </p>
            <p className="mb-4 font-semibold">
              Provozovatel se výslovně a v plném rozsahu zříká jakékoliv právní i finanční odpovědnosti za:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
              <li>jakékoliv škody, ztráty nebo nedorozumění vzniklé používáním tohoto webu,</li>
              <li>funkčnost, dostupnost a bezpečnost webových stránek,</li>
              <li>případné domnělé uzavření kupní smlouvy (žádná kupní smlouva zde nevzniká a žádné zboží nebude doručeno).</li>
            </ul>
          </section>

          <section className="border-b border-border pb-8">
            <h2 className="text-3xl font-serif font-bold mb-4">3. Objednávky a platby</h2>
            <p className="mb-4">
              Jakýkoliv proces nákupu, přidávání do košíku a odesílání objednávek je pouze technologickou simulací.
            </p>
            
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="font-semibold text-red-900 dark:text-red-200 mb-2">⚠️ Upozornění na platby:</p>
              <p className="text-red-800 dark:text-red-300 text-sm">
                Pokud web obsahuje integraci platební brány (např. Stripe), nachází se v tzv. „testovacím režimu". 
                Uživatelé jsou přísně varováni, aby v žádném případě nezadávali údaje ke svým skutečným platebním kartám. 
                Pokud tak uživatel přes toto varování učiní, Provozovatel nenese naprosto žádnou odpovědnost za případné 
                finanční transakce, stržení prostředků či zneužití údajů.
              </p>
            </div>
          </section>

          <section className="border-b border-border pb-8">
            <h2 className="text-3xl font-serif font-bold mb-4">4. Uživatelské účty a autorská práva</h2>
            <p className="mb-4">
              Návštěvníci si mohou na webu vytvořit zkušební uživatelský účet za účelem otestování funkcionality projektu. 
              Provozovatel si vyhrazuje právo web, uživatelské účty i veškerá související data kdykoliv bez předchozího upozornění 
              a bez náhrady smazat.
            </p>
            <p>
              Vizuální i technologické zpracování projektu podléhá autorským právům autora maturitní práce.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-serif font-bold mb-4">5. Závěrečná ustanovení</h2>
            <p>
              Používáním tohoto webu uživatel výslovně bere na vědomí, že se jedná o nekomerční studentskou práci a souhlasí s výše uvedeným vyloučením odpovědnosti.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>Poslední aktualizace: březen 2026</p>
            <p>Tento dokument je součástí maturitního projektu</p>
          </div>

        </div>
      </div>
    </div>
  )
}
