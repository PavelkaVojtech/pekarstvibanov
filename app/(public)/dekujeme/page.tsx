import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { CheckCircle2, CreditCard, Package } from "lucide-react"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

function paymentLabel(type: string) {
  switch (type) {
    case "CASH_ON_DELIVERY":
      return "Hotově / na místě"
    case "ONLINE_CARD":
      return "Online kartou"
    case "INVOICE":
      return "Faktura"
    default:
      return type
  }
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/prihlaseni")

  const { orderId } = await searchParams

  const order = orderId
    ? await prisma.order.findFirst({
        where: { id: orderId, userId: session.user.id },
        select: {
          orderNumber: true,
          totalPrice: true,
          paymentType: true,
          status: true,
        },
      })
    : null

  return (
    <div className="min-h-[70vh] bg-muted/30 py-10">
      <div className="container mx-auto max-w-2xl px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle2 className="h-6 w-6 text-primary" /> Děkujeme za objednávku
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {order ? (
              <div className="space-y-2 text-sm">
                <p>
                  Vaše objednávka byla úspěšně odeslána. Číslo objednávky: <span className="font-semibold">{order.orderNumber}</span>
                </p>
                <div className="grid gap-2 rounded-md border bg-background p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Částka</span>
                    <span className="font-medium">{Number(order.totalPrice)} Kč</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Platba</span>
                    <span className="font-medium">{paymentLabel(order.paymentType)}</span>
                  </div>
                </div>

                {order.paymentType === "ONLINE_CARD" && (
                    <div className="rounded-md border bg-background p-4 text-sm">
                      <p className="font-medium">Online platba není momentálně dostupná.</p>
                      <p className="text-muted-foreground">Objednávku můžete uhradit jiným způsobem platby.</p>
                      <div className="mt-3">
                        <Button disabled variant="outline" title="Online platba není momentálně dostupná.">
                          <CreditCard className="mr-2 h-4 w-4" /> Zaplatit online
                        </Button>
                      </div>
                    </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Objednávka byla odeslána. Detaily najdete ve svém profilu v historii objednávek.
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/profil">
                  <Package className="mr-2 h-4 w-4" /> Zobrazit moje objednávky
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/produkty">Pokračovat v nákupu</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
