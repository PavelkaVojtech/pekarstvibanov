"use client"

import { useCart } from "@/components/providers/cart-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { createOrder } from "@/app/actions/orders"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react"

type DeliveryMethod = "DELIVERY" | "PICKUP"
type PaymentType = "CASH_ON_DELIVERY" | "INVOICE" | "ONLINE_CARD"

type SavedAddress = {
  id: string
  street: string
  city: string
  zipCode: string
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, removeItem, setItemQuantity, incrementItem } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderType, setOrderType] = useState<"ONE_TIME" | "RECURRING">("ONE_TIME")
  const [recurrence, setRecurrence] = useState<"WEEKLY" | "BIWEEKLY" | "MONTHLY">("WEEKLY")
  const [paymentType, setPaymentType] = useState<PaymentType>("CASH_ON_DELIVERY")

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("DELIVERY")
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState<string>("")

  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")

  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [zip, setZip] = useState("")
  const [note, setNote] = useState("")

  const router = useRouter()
  const { toast } = useToast()

  const formatPrice = (value: number) => `${new Intl.NumberFormat("cs-CZ").format(Math.round(value))} Kč`

  const minRequestedDate = useMemo(() => {
    const now = new Date()
    const isAfterCutoffToday = now.getHours() > 15 || (now.getHours() === 15 && now.getMinutes() > 0)
    const daysToAdd = isAfterCutoffToday ? 2 : 1
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd)
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }, [])

  useEffect(() => {
    if (!requestedDeliveryDate) setRequestedDeliveryDate(minRequestedDate)
  }, [minRequestedDate, requestedDeliveryDate])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/address")
        if (!res.ok) return
        const data: unknown = await res.json()
        if (!Array.isArray(data) || cancelled) return

        const parsed = data
          .map((row) => {
            if (!row || typeof row !== "object") return null
            const record = row as Record<string, unknown>
            const id = record.id
            const street = record.street
            const city = record.city
            const zipCode = record.zipCode
            if (typeof id !== "string" || typeof street !== "string" || typeof city !== "string" || typeof zipCode !== "string") {
              return null
            }
            return { id, street, city, zipCode } satisfies SavedAddress
          })
          .filter((a): a is SavedAddress => Boolean(a))

        setAddresses(parsed)
        if (parsed.length > 0) {
          const first = parsed[0]
          setSelectedAddressId((current) => current || first.id)
          setStreet((current) => current || first.street)
          setCity((current) => current || first.city)
          setZip((current) => current || first.zipCode)
        }
      } catch {
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

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

    if (!requestedDeliveryDate || requestedDeliveryDate < minRequestedDate) {
      toast({
        variant: "destructive",
        title: "Neplatné datum",
        description: "Objednávky jsou možné pouze do 15:00 předchozího dne.",
      })
      setLoading(false)
      return
    }

    const orderData = {
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      deliveryMethod,
      requestedDeliveryDate,
      deliveryAddress:
        deliveryMethod === "DELIVERY"
          ? {
              street,
              city,
              zip,
            }
          : undefined,
      paymentType,
      orderType,
      recurrence: orderType === "RECURRING" ? recurrence : undefined,
      note: note || undefined,
    }

    try {
      const result = await createOrder(orderData)
      clearCart()
      toast({ title: "Objednávka odeslána!", description: "Ozveme se vám co nejdříve." })
      const orderId = result && typeof result === "object" && "orderId" in result ? String((result as Record<string, unknown>).orderId) : ""
      router.push(orderId ? `/dekujeme?orderId=${encodeURIComponent(orderId)}` : "/dekujeme")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Nepodařilo se odeslat objednávku."
      toast({ variant: "destructive", title: "Chyba", description: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-6xl py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Košík & pokladna</h1>
          <p className="text-sm text-muted-foreground">Zkontrolujte položky a dokončete objednávku.</p>
        </div>

        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link href="/produkty" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Pokračovat v nákupu
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
        {/* KOŠÍK */}
        <Card className="order-1 lg:order-2 lg:sticky lg:top-24">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Váš košík</CardTitle>
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={clearCart}
              >
                Vyprázdnit
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl opacity-50">🥖</div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.price)} / ks</p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Odstranit ${item.name}`}
                      title="Odstranit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-md border bg-background">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => incrementItem(item.productId, -1)}
                        aria-label="Snížit množství"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <Input
                        aria-label="Množství"
                        inputMode="numeric"
                        className="h-9 w-16 border-0 text-center shadow-none focus-visible:ring-0"
                        value={String(item.quantity)}
                        onChange={(e) => {
                          const next = Number(e.target.value)
                          setItemQuantity(item.productId, Number.isFinite(next) ? next : item.quantity)
                        }}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => incrementItem(item.productId, 1)}
                        aria-label="Zvýšit množství"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="shrink-0 font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            ))}

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Mezisoučet</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Doručení</span>
                <span>{deliveryMethod === "PICKUP" ? "Osobní odběr" : "Na adresu"}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t bg-muted/20">
            <span className="text-base font-semibold">Celkem</span>
            <span className="text-lg font-bold text-primary">{formatPrice(totalPrice)}</span>
          </CardFooter>
        </Card>

        {/* FORMULÁŘ */}
        <form onSubmit={onSubmit} className="order-2 lg:order-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Doručení a den</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={deliveryMethod}
                onValueChange={(v) => setDeliveryMethod(v === "PICKUP" ? "PICKUP" : "DELIVERY")}
                className="grid gap-3"
              >
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/40">
                  <RadioGroupItem value="DELIVERY" id="dm-delivery" className="mt-1" />
                  <span className="space-y-1">
                    <span className="font-medium">Doručení na adresu</span>
                    <span className="block text-sm text-muted-foreground">Přivezeme vám pečivo na zvolenou adresu.</span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/40">
                  <RadioGroupItem value="PICKUP" id="dm-pickup" className="mt-1" />
                  <span className="space-y-1">
                    <span className="font-medium">Osobní odběr na prodejně</span>
                    <span className="block text-sm text-muted-foreground">Doručovací údaje nejsou potřeba.</span>
                  </span>
                </label>
              </RadioGroup>

              <div className="grid gap-2">
                <Label htmlFor="requestedDate">Na kdy to chcete?</Label>
                <Input
                  id="requestedDate"
                  type="date"
                  value={requestedDeliveryDate}
                  min={minRequestedDate}
                  onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Objednávky na zvolený den jsou možné nejpozději do 15:00 předchozího dne.
                </p>
              </div>
            </CardContent>
          </Card>

          {deliveryMethod === "DELIVERY" && (
            <Card>
              <CardHeader>
                <CardTitle>Doručovací údaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length > 0 && (
                  <div className="grid gap-2">
                    <Label>Uložené adresy</Label>
                    <Select
                      value={selectedAddressId}
                      onValueChange={(id) => {
                        setSelectedAddressId(id)
                        const addr = addresses.find((a) => a.id === id)
                        if (addr) {
                          setStreet(addr.street)
                          setCity(addr.city)
                          setZip(addr.zipCode)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte adresu" />
                      </SelectTrigger>
                      <SelectContent>
                        {addresses.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.street}, {a.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Adresy spravujete v profilu v sekci Nastavení.</p>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="street">Ulice a číslo</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                    autoComplete="street-address"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="city">Město</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      autoComplete="address-level2"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="zip">PSČ</Label>
                    <Input
                      id="zip"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      required
                      autoComplete="postal-code"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Typ odběru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={orderType}
                onValueChange={(v) => setOrderType(v === "RECURRING" ? "RECURRING" : "ONE_TIME")}
                className="grid gap-3"
              >
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/40">
                  <RadioGroupItem value="ONE_TIME" id="ot-one" className="mt-1" />
                  <span className="space-y-1">
                    <span className="font-medium">Jednorázová objednávka</span>
                    <span className="block text-sm text-muted-foreground">Klasický nákup bez opakování.</span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/40">
                  <RadioGroupItem value="RECURRING" id="ot-rec" className="mt-1" />
                  <span className="space-y-1">
                    <span className="font-medium">Pravidelná objednávka</span>
                    <span className="block text-sm text-muted-foreground">Automaticky opakovaná podle zvolené frekvence.</span>
                  </span>
                </label>
              </RadioGroup>

              {orderType === "RECURRING" && (
                <div className="grid gap-2">
                  <Label>Frekvence</Label>
                  <Select value={recurrence} onValueChange={(v) => setRecurrence(v === "BIWEEKLY" || v === "MONTHLY" ? v : "WEEKLY")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte frekvenci" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEKLY">Každý týden</SelectItem>
                      <SelectItem value="BIWEEKLY">Každé 2 týdny</SelectItem>
                      <SelectItem value="MONTHLY">Jednou měsíčně</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platba</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <RadioGroup
                value={paymentType}
                onValueChange={(v) => setPaymentType(v === "INVOICE" || v === "ONLINE_CARD" ? v : "CASH_ON_DELIVERY")}
                className="grid gap-3"
              >
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/40">
                  <RadioGroupItem value="CASH_ON_DELIVERY" id="pay-cash" className="mt-1" />
                  <span className="space-y-1">
                    <span className="font-medium">Hotově / Kartou při převzetí</span>
                    <span className="block text-sm text-muted-foreground">Nejrychlejší volba pro běžné objednávky.</span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/40">
                  <RadioGroupItem value="INVOICE" id="pay-inv" className="mt-1" />
                  <span className="space-y-1">
                    <span className="font-medium">Na fakturu (Firmy)</span>
                    <span className="block text-sm text-muted-foreground">Dostupné pro firemní zákazníky s údaji.</span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/40">
                  <RadioGroupItem value="ONLINE_CARD" id="pay-card" className="mt-1" />
                  <span className="space-y-1">
                    <span className="font-medium">Online kartou</span>
                    <span className="block text-sm text-muted-foreground">Momentálně nedostupné.</span>
                  </span>
                </label>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Poznámka</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="note" className="sr-only">
                Poznámka
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Např. prosím nekrájet chleba…"
              />
              <p className="text-xs text-muted-foreground">Poznámka je volitelná.</p>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Odesílám…" : `Objednat za ${formatPrice(totalPrice)}`}
          </Button>

          <Button asChild variant="ghost" className="w-full sm:hidden">
            <Link href="/produkty" className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Pokračovat v nákupu
            </Link>
          </Button>
        </form>
      </div>
    </div>
  )
}