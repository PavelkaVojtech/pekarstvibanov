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
import { Checkbox } from "@/components/ui/checkbox"
import { createOrder } from "@/app/actions/orders"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ArrowLeft, CalendarDays } from "lucide-react"

type DeliveryMethod = "DELIVERY" | "PICKUP"
type PaymentType = "CASH_ON_DELIVERY" | "INVOICE" | "ONLINE_CARD"

type SavedAddress = {
  id: string
  street: string
  city: string
  zipCode: string
}

const DAYS = [
  { id: "1", label: "Pondělí" },
  { id: "2", label: "Úterý" },
  { id: "3", label: "Středa" },
  { id: "4", label: "Čtvrtek" },
  { id: "5", label: "Pátek" },
  { id: "6", label: "Sobota" },
  { id: "0", label: "Neděle" },
]

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, removeItem, setItemQuantity, incrementItem } = useCart()
  const [loading, setLoading] = useState(false)
  const [orderType, setOrderType] = useState<"ONE_TIME" | "RECURRING">("ONE_TIME")
  const [selectedDays, setSelectedDays] = useState<string[]>([])
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

    if (orderType === "RECURRING" && selectedDays.length === 0) {
      toast({
        variant: "destructive",
        title: "Chybí dny",
        description: "Vyberte prosím alespoň jeden den pro pravidelnou objednávku.",
      })
      setLoading(false)
      return
    }

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
      recurrence: orderType === "RECURRING" ? JSON.stringify({ days: selectedDays }) : undefined,
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
    <div className="container max-w-6xl py-10 px-4 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        <Card className="order-1 lg:order-2 lg:sticky lg:top-24 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Váš košík</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
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
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-md border bg-background h-8">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => incrementItem(item.productId, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>

                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => incrementItem(item.productId, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="shrink-0 font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
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

          <CardFooter className="flex items-center justify-between border-t bg-muted/20 py-4">
            <span className="text-base font-semibold">Celkem</span>
            <span className="text-lg font-bold text-primary">{formatPrice(totalPrice)}</span>
          </CardFooter>
        </Card>

        <form onSubmit={onSubmit} className="order-2 lg:order-1 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Doručení a den</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                <Label htmlFor="requestedDate" className="font-bold uppercase tracking-widest text-xs text-primary">Požadovaný den (první závoz)</Label>
                <Input
                  id="requestedDate"
                  type="date"
                  className="h-11"
                  value={requestedDeliveryDate}
                  min={minRequestedDate}
                  onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                  required
                />
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Objednávky na zvolený den jsou možné nejpozději do 15:00 předchozího dne.
                </p>
              </div>
            </CardContent>
          </Card>

          {deliveryMethod === "DELIVERY" && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Doručovací údaje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length > 0 && (
                  <div className="grid gap-2">
                    <Label className="font-bold uppercase tracking-widest text-xs text-primary">Uložené adresy</Label>
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
                      <SelectTrigger className="h-11">
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
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="street" className="font-bold uppercase tracking-widest text-xs text-primary">Ulice a číslo</Label>
                  <Input
                    id="street"
                    className="h-11"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="city" className="font-bold uppercase tracking-widest text-xs text-primary">Město</Label>
                    <Input
                      id="city"
                      className="h-11"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="zip" className="font-bold uppercase tracking-widest text-xs text-primary">PSČ</Label>
                    <Input
                      id="zip"
                      className="h-11"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-xl">Typ odběru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={orderType}
                onValueChange={(v) => setOrderType(v as "RECURRING" | "ONE_TIME")}
                className="grid gap-4 sm:grid-cols-2"
              >
                <div>
                  <RadioGroupItem value="ONE_TIME" id="ot-one" className="peer sr-only" />
                  <Label
                    htmlFor="ot-one"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <span className="font-bold">Jednorázová</span>
                    <span className="text-[10px] text-muted-foreground text-center mt-1">Klasický nákup</span>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="RECURRING" id="ot-rec" className="peer sr-only" />
                  <Label
                    htmlFor="ot-rec"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <span className="font-bold">Pravidelná</span>
                    <span className="text-[10px] text-muted-foreground text-center mt-1">Opakovat každý týden</span>
                  </Label>
                </div>
              </RadioGroup>

              {orderType === "RECURRING" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 text-primary">
                    <CalendarDays className="h-5 w-5" />
                    <Label className="font-black uppercase tracking-widest text-xs">Vyberte dny doručení</Label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {DAYS.map((day) => (
                      <div key={day.id} className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer">
                        <Checkbox 
                          id={`day-${day.id}`} 
                          checked={selectedDays.includes(day.id)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedDays([...selectedDays, day.id])
                            else setSelectedDays(selectedDays.filter(d => d !== day.id))
                          }}
                        />
                        <Label htmlFor={`day-${day.id}`} className="font-bold text-sm cursor-pointer select-none">{day.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Platba</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <RadioGroup
                value={paymentType}
                onValueChange={(v) => setPaymentType(v as PaymentType)}
                className="grid gap-3"
              >
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/40">
                  <RadioGroupItem value="CASH_ON_DELIVERY" id="pay-cash" className="mt-1" />
                  <span className="space-y-1">
                    <span className="font-medium">Při převzetí objednávky</span>
                    <span className="block text-sm text-muted-foreground">Hotově nebo kartou</span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/40">
                  <RadioGroupItem value="INVOICE" id="pay-inv" className="mt-1" />
                  <span className="space-y-1">
                    <span className="font-medium">Na fakturu</span>
                    <span className="block text-sm text-muted-foreground">Pouze pro ověřené firemní zákazníky.</span>
                  </span>
                </label>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Poznámka</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="note"
                value={note}
                className="min-h-[100px]"
                onChange={(e) => setNote(e.target.value)}
                placeholder="Máte specifické přání? Např. prosím nekrájet chleba…"
              />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-14 text-lg font-black shadow-lg" disabled={loading}>
            {loading ? "Odesílám…" : `DOKONČIT OBJEDNÁVKU (${formatPrice(totalPrice)})`}
          </Button>

          <Button asChild variant="ghost" className="w-full sm:hidden py-6">
            <Link href="/produkty" className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Pokračovat v nákupu
            </Link>
          </Button>
        </form>
      </div>
    </div>
  )
}