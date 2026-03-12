"use client"

import { useTransition } from "react"
import { CreditCard } from "lucide-react"

import { createCheckoutSessionForExistingOrder } from "@/app/actions/orders"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type PayOrderButtonProps = {
  orderId: string
}

export function PayOrderButton({ orderId }: PayOrderButtonProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleClick = () => {
    startTransition(async () => {
      try {
        const result = await createCheckoutSessionForExistingOrder(orderId)
        window.location.href = result.checkoutUrl
      } catch (error) {
        const message = error instanceof Error ? error.message : "Nepodařilo se vytvořit platební bránu."
        toast({
          variant: "destructive",
          title: "Chyba",
          description: message,
        })
      }
    })
  }

  return (
    <Button onClick={handleClick} variant="outline" disabled={isPending}>
      <CreditCard className="mr-2 h-4 w-4" />
      {isPending ? "Připravuji platbu..." : "Zaplatit online"}
    </Button>
  )
}