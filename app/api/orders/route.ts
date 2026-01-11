import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Neautorizováno" }, { status: 401 })

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(
    orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      totalPrice: o.totalPrice,
      createdAt: o.createdAt,
      deliveryMethod: o.deliveryMethod,
      requestedDeliveryDate: o.requestedDeliveryDate,
      paymentType: o.paymentType,
      orderType: o.type,
      recurrence: o.recurrence,
    }))
  )
}
