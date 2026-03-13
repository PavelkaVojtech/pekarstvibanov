"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import * as CookieConsent from "vanilla-cookieconsent"

const GA_MEASUREMENT_ID = "G-XJG31751S1"

export function AnalyticsScripts() {
  const [canLoadAnalytics, setCanLoadAnalytics] = useState(false)

  useEffect(() => {
    const updateConsent = () => {
      setCanLoadAnalytics(CookieConsent.acceptedCategory("analytics"))
    }

    updateConsent()

    window.addEventListener("cc:onConsent", updateConsent as EventListener)
    window.addEventListener("cc:onChange", updateConsent as EventListener)

    return () => {
      window.removeEventListener("cc:onConsent", updateConsent as EventListener)
      window.removeEventListener("cc:onChange", updateConsent as EventListener)
    }
  }, [])

  if (!canLoadAnalytics) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  )
}
