import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Chybí Stripe podpis" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Neplatný webhook"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.orderId

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
