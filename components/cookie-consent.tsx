"use client"

import { useEffect } from "react"
import "vanilla-cookieconsent/dist/cookieconsent.css"
import * as CookieConsent from "vanilla-cookieconsent"

declare global {
  interface Window {
    gtag: any
  }
}

export function CookieConsentComponent() {
  useEffect(() => {
    const updateGoogleConsent = () => {
      const analyticsAccepted = CookieConsent.acceptedCategory("analytics")

      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          analytics_storage: analyticsAccepted ? "granted" : "denied",
          ad_storage: analyticsAccepted ? "granted" : "denied",
          ad_user_data: analyticsAccepted ? "granted" : "denied",
          ad_personalization: analyticsAccepted ? "granted" : "denied",
        })
      }
    }

    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: "box",
          position: "bottom right",
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: "bar",
          position: "left",
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
      categories: {
        necessary: {
          readOnly: true,
        },
        analytics: {},
      },
      language: {
        default: "cs",
        translations: {
          cs: {
            consentModal: {
              title: "Používáme cookies",
              description:
                "Tento web potřebuje nezbytné cookies pro své fungování. Analytické cookies používáme jen s vaším souhlasem pro měření návštěvnosti a zlepšování služeb.",
              acceptAllBtn: "Přijmout vše",
              acceptNecessaryBtn: "Odmítnout vše",
              showPreferencesBtn: "Nastavení",
            },
            preferencesModal: {
              title: "Nastavení cookies",
              acceptAllBtn: "Přijmout vše",
              acceptNecessaryBtn: "Odmítnout vše",
              savePreferencesBtn: "Uložit nastavení",
              closeIconLabel: "Zavřít okno",
              sections: [
                {
                  title: "Použití cookies",
                  description:
                    "Vyberte, které kategorie cookies povolujete. Nezbytné cookies jsou vždy aktivní, protože bez nich by web nefungoval správně.",
                },
                {
                  title: "Nezbytné cookies",
                  description:
                    "Tyto cookies zajišťují technické fungování webu, bezpečnost a základní funkce formulářů nebo přihlášení.",
                  linkedCategory: "necessary",
                },
                {
                  title: "Analytické cookies",
                  description:
                    "Pomáhají nám měřit návštěvnost a pochopit, jak návštěvníci web používají, abychom ho mohli neustále zlepšovat.",
                  linkedCategory: "analytics",
                },
              ],
            },
          },
        },
      },
      onConsent: () => {
        updateGoogleConsent()
      },
      onChange: () => {
        updateGoogleConsent()
      },
    })
  }, [])

  return null
}