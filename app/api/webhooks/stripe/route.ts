import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  console.log("[Webhook] Přijatý webhook", {
    timestamp: new Date().toISOString(),
    hasSignature: !!signature,
  })

  if (!signature) {
    console.log("[Webhook] Chybí signature - vracím 400")
    return NextResponse.json({ error: "Chybí Stripe podpis" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log("[Webhook] Event validován a zparsován:", event.type)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Neplatný webhook"
    console.log("[Webhook] Validace selhala:", message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId

    console.log("[Webhook] checkout.session.completed event", {
      orderId,
      sessionId: session.id,
    })

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      })
      console.log("[Webhook] Objednávka aktualizována:", orderId)
    }
  } else {
    console.log("[Webhook] Ignoruji event typu:", event.type)
  }

  console.log("[Webhook] Vracím 200 OK")
  return NextResponse.json({ received: true })
}
