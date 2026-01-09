'use server'

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth" 
import { headers } from "next/headers"
import { z } from "zod"
import { sendEmail } from "@/lib/email"
import { getOrderStatusEmailContent } from "../../lib/order-status-email"
import { OrderStatus, OrderType, PaymentType, Prisma } from "@prisma/client"
import { randomUUID } from "crypto"

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1)
  })).min(1),
  deliveryAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    zip: z.string().min(1),
  }),
  paymentType: z.nativeEnum(PaymentType),
  orderType: z.nativeEnum(OrderType),
  recurrence: z.string().optional(),
  note: z.string().optional(),
})


export async function createOrder(rawData: unknown) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Musíte být přihlášen.")

  const validated = CreateOrderSchema.parse(rawData)

  if (validated.paymentType === "INVOICE") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, companyName: true, ico: true, dic: true },
    })

    if (!user) throw new Error("Uživatel nenalezen.")

    const isAdmin = user.role === "ADMIN"
    const hasCompanyBillingData = Boolean(user.companyName && user.ico && user.dic)

    if (!isAdmin && !hasCompanyBillingData) {
      throw new Error("Platba na fakturu je dostupná jen pro firemní zákazníky s vyplněnými fakturačními údaji.")
    }
  }

  const productIds = Array.from(new Set(validated.items.map((i) => i.productId)))
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true },
  })

  const productById = new Map(products.map((p) => [p.id, p]))

  let totalPrice = new Prisma.Decimal(0)
  const orderItemsData: Array<{ productId: string; quantity: number; price: Prisma.Decimal }> = []

  for (const item of validated.items) {
    const product = productById.get(item.productId)
    if (!product) throw new Error(`Produkt ${item.productId} neexistuje`)

    totalPrice = totalPrice.plus(product.price.mul(item.quantity))

    orderItemsData.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
    })
  }

  // Vytvoření objednávky
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      orderNumber: `OBJ-${randomUUID()}`,
      status: OrderStatus.PENDING,
      type: validated.orderType,
      paymentType: validated.paymentType,
      recurrence: validated.recurrence,
      totalPrice: totalPrice,
      note: validated.note,
      deliveryStreet: validated.deliveryAddress.street,
      deliveryCity: validated.deliveryAddress.city,
      deliveryZip: validated.deliveryAddress.zip,
      items: {
        create: orderItemsData
      }
    }
  })


  return { success: true, orderId: order.id }
}

export async function cancelOrder(orderId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Neautorizováno")

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new Error("Objednávka nenalezena")

  if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
    throw new Error("Nemáte právo na tuto objednávku")
  }

  if (order.status !== "PENDING") {
    throw new Error("Objednávku již nelze zrušit (již se zpracovává)")
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" }
  })

  return { success: true }
}


export async function updateOrderStatus(orderId: string, newStatus: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (session?.user.role !== "ADMIN") {
    throw new Error("Přístup zamítnut. Pouze pro administrátory.")
  }

  const order = await prisma.order.findUnique({ 
    where: { id: orderId },
    include: { user: true }
  })
  
  if (!order) throw new Error("Objednávka nenalezena")

  const status = z.nativeEnum(OrderStatus).parse(newStatus)

  await prisma.order.update({
    where: { id: orderId },
    data: { status }
  })

  const email = getOrderStatusEmailContent({ orderNumber: order.orderNumber, status })
  if (email) {
    await sendEmail({
      to: order.user.email,
      subject: email.subject,
      text: email.text,
    })
  }

  return { success: true }
}