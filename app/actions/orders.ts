'use server'

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth" 
import { headers } from "next/headers"
import { z } from "zod"
import { sendEmail } from "@/lib/email"

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
  paymentType: z.enum(["CASH_ON_DELIVERY", "ONLINE_CARD", "INVOICE"]),
  orderType: z.enum(["ONE_TIME", "RECURRING"]),
  recurrence: z.string().optional(),
  note: z.string().optional(),
})


export async function createOrder(rawData: any) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Musíte být přihlášen.")

  const validated = CreateOrderSchema.parse(rawData)

  if (validated.paymentType === "INVOICE") {
    if (!session.user.role && session.user.role !== "ADMIN") { 
    }
  }

  let totalPrice = 0
  const orderItemsData = []

  for (const item of validated.items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product) throw new Error(`Produkt ${item.productId} neexistuje`)
    
    const price = Number(product.price)
    totalPrice += price * item.quantity
    
    orderItemsData.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.price
    })
  }

  // Vytvoření objednávky
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      orderNumber: `OBJ-${Date.now()}`, 
      status: "PENDING",
      type: validated.orderType as any,
      paymentType: validated.paymentType as any,
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

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus as any }
  })

  const emailSubject = `Změna stavu objednávky ${order.orderNumber}`
  let emailBody = ""

  switch (newStatus) {
    case "CONFIRMED":
      emailBody = `Dobrý den, vaše objednávka byla schválena a začínáme na ní pracovat.`
      break
    case "READY":
      emailBody = `Dobrý den, vaše pečivo je připraveno k vyzvednutí/rozvozu.`
      break
    case "CANCELLED":
      emailBody = `Dobrý den, vaše objednávka byla stornována.`
      break
  }

  if (emailBody) {
    await sendEmail({
      to: order.user.email,
      subject: emailSubject,
      text: emailBody
    })
  }

  return { success: true }
}