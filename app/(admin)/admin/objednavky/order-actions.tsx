"use client"

import { Button } from "@/components/ui/button"
import { updateOrderStatus } from "@/app/actions/orders"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export function OrderActions({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "Čeká na schválení"
      case "CONFIRMED": return "Schváleno"
      case "BAKING": return "Ve výrobě"
      case "READY": return "Připraveno"
      case "COMPLETED": return "Dokončeno"
      case "CANCELLED": return "Zrušeno"
      default: return status
    }
  }

  const changeStatus = async (status: string) => {
    setLoading(true)
    try {
      await updateOrderStatus(orderId, status)
      toast({ title: "Stav změněn", description: `Objednávka je nyní: ${getStatusLabel(status)}` })
      router.refresh() 
    } catch {
      toast({ variant: "destructive", title: "Chyba", description: "Nepodařilo se změnit stav" })
    } finally {
      setLoading(false)
    }
  }

  if (currentStatus === "PENDING") {
    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={() => changeStatus("CONFIRMED")} disabled={loading}>
          Schválit
        </Button>
        <Button size="sm" variant="destructive" onClick={() => changeStatus("CANCELLED")} disabled={loading}>
          Zamítnout
        </Button>
      </div>
    )
  }

  if (currentStatus === "CONFIRMED") {
    return (
      <Button size="sm" variant="outline" onClick={() => changeStatus("BAKING")} disabled={loading}>
        Začít výrobu
      </Button>
    )
  }

  if (currentStatus === "BAKING") {
    return (
      <Button size="sm" variant="outline" onClick={() => changeStatus("READY")} disabled={loading}>
        Označit jako připravené
      </Button>
    )
  }

  if (currentStatus === "READY") {
    return (
      <Button size="sm" variant="outline" onClick={() => changeStatus("COMPLETED")} disabled={loading}>
        Dokončit
      </Button>
    )
  }

  return <span className="text-muted-foreground text-sm">-</span>
}