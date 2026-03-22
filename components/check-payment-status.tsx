"use client"

import { useEffect, useState } from "react"
import { checkAndUpdatePaymentStatus } from "@/app/actions/orders"

type CheckPaymentStatusProps = {
  orderId: string
  onPaidStatusChange?: (isPaid: boolean) => void
}

export function CheckPaymentStatus({ orderId, onPaidStatusChange }: CheckPaymentStatusProps) {
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (checked) return

    const checkStatus = async () => {
      try {
        const result = await checkAndUpdatePaymentStatus(orderId)
        if (result.isPaid) {
          onPaidStatusChange?.(true)
          // Refresh stránka aby se zobrazil nový status
          window.location.reload()
        }
      } catch (error) {
        console.error("Chyba při kontrole platby:", error)
      }
    }

    // Počkej 2 sekundy než zkontrolusH (aby měl Stripe čas zaregistrovat)
    const timer = setTimeout(checkStatus, 2000)
    setChecked(true)

    return () => clearTimeout(timer)
  }, [orderId, checked, onPaidStatusChange])

  return null
}
