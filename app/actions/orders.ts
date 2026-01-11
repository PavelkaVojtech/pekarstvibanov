'use server'

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth" 
import { headers } from "next/headers"
import { z } from "zod"
import { sendEmail } from "@/lib/email"
import { getOrderStatusEmailContent } from "../../lib/order-status-email"
import { Prisma } from "@prisma/client"

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "BAKING",
  "READY",
  "COMPLETED",
  "CANCELLED",
] as const

const ORDER_TYPES = ["ONE_TIME", "RECURRING"] as const
const PAYMENT_TYPES = ["CASH_ON_DELIVERY", "ONLINE_CARD", "INVOICE"] as const
const DELIVERY_METHODS = ["DELIVERY", "PICKUP"] as const

type CreateOrderInput = {
  items: Array<{ productId: string; quantity: number }>
  deliveryMethod: (typeof DELIVERY_METHODS)[number]
  requestedDeliveryDate: string
  deliveryAddress?: { street: string; city: string; zip: string }
  paymentType: (typeof PAYMENT_TYPES)[number]
  orderType: (typeof ORDER_TYPES)[number]
  recurrence?: string
  note?: string
}

let createOrderSchema: z.ZodType<CreateOrderInput> | null = null

function getCreateOrderSchema() {
  if (createOrderSchema) return createOrderSchema

  createOrderSchema = z
    .object({
      items: z
        .array(
          z.object({
            productId: z.string(),
            quantity: z.number().min(1),
          })
        )
        .min(1),
      deliveryMethod: z.enum(DELIVERY_METHODS),
      requestedDeliveryDate: z.string().min(1),
      deliveryAddress: z
        .object({
          street: z.string().min(1),
          city: z.string().min(1),
          zip: z.string().min(1),
        })
        .optional(),
      paymentType: z.enum(PAYMENT_TYPES),
      orderType: z.enum(ORDER_TYPES),
      recurrence: z.string().optional(),
      note: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.deliveryMethod === "DELIVERY") {
        if (!data.deliveryAddress) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Pro doručení na adresu je nutné vyplnit doručovací údaje.",
            path: ["deliveryAddress"],
          })
        }
      }
    })

  return createOrderSchema
}

function parseLocalDateOnly(dateStr: string) {
  // Accepts YYYY-MM-DD and creates a Date at local midnight.
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dateStr)
  if (!match) throw new Error("Neplatné datum")
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const d = new Date(year, month - 1, day, 0, 0, 0, 0)
  if (Number.isNaN(d.getTime())) throw new Error("Neplatné datum")
  return d
}

function assertDeliveryCutoff(requestedDateLocal: Date) {
  const now = new Date()

  // Cutoff is 15:00 the previous day (local time).
  const cutoff = new Date(
    requestedDateLocal.getFullYear(),
    requestedDateLocal.getMonth(),
    requestedDateLocal.getDate() - 1,
    15,
    0,
    0,
    0
  )

  if (now.getTime() > cutoff.getTime()) {
    throw new Error("Objednávku na zvolený den lze vytvořit nejpozději do 15:00 předchozího dne.")
  }
}


export async function createOrder(rawData: unknown) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Musíte být přihlášen.")

  const validated = getCreateOrderSchema().parse(rawData)

  const requestedDate = parseLocalDateOnly(validated.requestedDeliveryDate)
  assertDeliveryCutoff(requestedDate)

  const address = validated.deliveryMethod === "DELIVERY" ? validated.deliveryAddress : undefined
  if (validated.deliveryMethod === "DELIVERY" && !address) {
    throw new Error("Chybí doručovací adresa")
  }

  // Pokud je osobní odběr a uživatel má uloženou doručovací adresu v profilu,
  // uložíme ji jako snapshot (užitečné pro admina), ale nikdy nevymýšlíme "prodejnu/00000".
  const fallbackAddress =
    validated.deliveryMethod === "PICKUP"
      ? await prisma.address.findFirst({
          where: { userId: session.user.id, type: "DELIVERY" },
          select: { street: true, city: true, zipCode: true, country: true },
        })
      : null

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
  const { randomUUID } = await import("crypto")

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      orderNumber: `OBJ-${randomUUID()}`,
      status: "PENDING",
      type: validated.orderType,
      paymentType: validated.paymentType,
      deliveryMethod: validated.deliveryMethod,
      requestedDeliveryDate: requestedDate,
      recurrence: validated.recurrence,
      totalPrice: totalPrice,
      note: validated.note,
      deliveryStreet: address?.street ?? fallbackAddress?.street ?? null,
      deliveryCity: address?.city ?? fallbackAddress?.city ?? null,
      deliveryZip: address?.zip ?? fallbackAddress?.zipCode ?? null,
      deliveryCountry: fallbackAddress?.country ?? null,
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

  const status = z.enum(ORDER_STATUSES).parse(newStatus)

  const now = new Date()

  const milestoneData: Record<string, Date> = {
    ...(status === "CONFIRMED" && !order.confirmedAt ? { confirmedAt: now } : {}),
    ...(status === "BAKING" && !order.bakingAt ? { bakingAt: now } : {}),
    ...(status === "READY" && !order.readyAt ? { readyAt: now } : {}),
    ...(status === "COMPLETED" && !order.completedAt ? { completedAt: now } : {}),
    ...(status === "CANCELLED" && !order.cancelledAt ? { cancelledAt: now } : {}),
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...milestoneData,
    }
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