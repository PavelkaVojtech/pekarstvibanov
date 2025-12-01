# 🍞 Informační systém pro pekárnu – webová část

**Autor:** Vojtěch Pavelka

Projekt je maturitní prací zaměřenou na vývoj komplexní webové aplikace, která pokrývá potřeby moderní pekárny v oblasti online prezentace a e-commerce.

---

## 🎯 Cíle Projektu

Hlavním cílem této práce je vytvořit **moderní a plně responzivní informační systém**, který zefektivní komunikaci se zákazníky a automatizuje proces objednávání.

### Klíčové Funkce Systému

* **Prezentační Web:** Moderní firemní vizitka s intuitivním designem, včetně sekcí O nás a Kontakt.
* **Katalog Produktů (Sortiment):** Ucelený přehled výrobků rozdělený do kategorií (chleby, jemné pečivo, běžné pečivo) s detailními informacemi o složení a alergenech.
* **Objednávkový Systém:** Podpora **jednorázových i pravidelných** objednávek s možností doručení nebo osobního vyzvednutí.
* **Uživatelská Zóna:** Správa zákaznického profilu, historie objednávek a automatické e-mailové notifikace.
* **Podpora pro Zaměstnance:** Sekce pro přihlášení zaměstnanců a přístup k interním nástrojům (např. přehled odpracovaných hodin).

## 💻 Technologický Stack (The MERN Stack++)

Projekt je implementován s využitím následujících nejmodernějších webových technologií, které zajišťují rychlost, spolehlivost a škálovatelnost:

| Oblast | Technologie | Účel |
| :--- | :--- | :--- |
| **Základ Frameworku** | Next.js (App Router) | Výkonný React framework pro rychlé full-stack aplikace. |
| **Jazyk** | TypeScript | Statická typová kontrola pro bezpečnější a udržitelnější kód. |
| **Styling** | Tailwind CSS | Utility-first framework pro rychlou a flexibilní implementaci designu. |
| **Správa Dat** | TanStack Query (React Query) | Efektivní správa, cachování a synchronizace dat. |
| **Globální Stav** | Zustand / Redux Toolkit | Optimalizovaná správa stavu aplikace (např. obsah košíku). |
| **Formuláře/Validace** | React Hook Form + Zod | Výkonná práce s formuláři a validace schématu. |
| **Platby (Plán)** | Stripe / ČSOB / Comgate | Integrace online platebních bran. |
| **Lokalizace (Plán)** | react-i18next | Příprava na podporu vícejazyčnosti (i18n). |

---

## 🛠️ Instalace a Spuštění

Tento projekt byl inicializován pomocí `create-next-app`.

### 1. Klonování Repozitáře

```bash
git clone [URL_VAŠEHO_REPOZITÁŘE]
cd web_pro_pekarnu
```

### 2. Instalace Závislostí
Použijte preferovaný správce balíčků (npm, yarn, pnpm, bun)

```bash
npm install
```

### 3. Spuštění Vývojového Serveru
```bash
npm run dev
```

Otevřete http://localhost:3000 ve vašem prohlížeči. Aplikace se automaticky aktualizuje při změnách kódu.

