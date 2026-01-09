"use client"

import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { createOrder } from "@/app/actions/orders" // Import server action
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Váš košík je prázdný</h1>
        <Button onClick={() => router.push("/produkty")} className="mt-4">
          Jít nakupovat
        </Button>
      </div>
    )
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    
    // Sestavení dat pro server action
    const orderData = {
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      deliveryAddress: {
        street: formData.get("street"),
        city: formData.get("city"),
        zip: formData.get("zip"),
      },
      paymentType: formData.get("paymentType"),
      orderType: formData.get("orderType"),
      note: formData.get("note"),
      recurrence: formData.get("recurrence") || undefined
    }

    try {
      await createOrder(orderData)
      clearCart()
      toast({ title: "Objednávka odeslána!", description: "Brzy se vám ozveme." })
      router.push("/profil") // Nebo na stránku s poděkováním
    } catch (error: any) {
      toast({ variant: "destructive", title: "Chyba", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8">Dokončení objednávky</h1>
      
      <div className="grid md:grid-cols-2 gap-10">
        {/* Formulář */}
        <form onSubmit={onSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Doručovací údaje</h2>
            <div className="grid gap-2">
              <Label htmlFor="street">Ulice a číslo</Label>
              <Input id="street" name="street" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Město</Label>
                <Input id="city" name="city" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip">PSČ</Label>
                <Input id="zip" name="zip" required />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Typ odběru</h2>
            <RadioGroup defaultValue="ONE_TIME" name="orderType">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ONE_TIME" id="ot-one" />
                <Label htmlFor="ot-one">Jednorázová objednávka</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="RECURRING" id="ot-rec" />
                <Label htmlFor="ot-rec">Pravidelná (Každý týden)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Platba</h2>
            <RadioGroup defaultValue="CASH_ON_DELIVERY" name="paymentType">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CASH_ON_DELIVERY" id="pay-cash" />
                <Label htmlFor="pay-cash">Hotově / Kartou při převzetí</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="INVOICE" id="pay-inv" />
                <Label htmlFor="pay-inv">Na fakturu (Firmy)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Poznámka</Label>
            <Textarea id="note" name="note" placeholder="Např. prosím nekrájet chleba..." />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Odesílám..." : `Objednat za ${totalPrice} Kč`}
          </Button>
        </form>

        {/* Souhrn košíku */}
        <div className="bg-muted p-6 rounded-lg h-fit">
          <h2 className="text-xl font-semibold mb-4">Váš košík</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>{item.price * item.quantity} Kč</span>
              </div>
            ))}
            <div className="border-t pt-4 font-bold flex justify-between text-lg">
              <span>Celkem</span>
              <span>{totalPrice} Kč</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}