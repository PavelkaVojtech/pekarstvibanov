'use server'

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth" 
import { headers } from "next/headers"
import { z } from "zod"
import { sendEmail } from "@/lib/email"
import { getOrderStatusEmailContent } from "@/lib/order-status-email"
import { Prisma } from "@prisma/client"
import Stripe from "stripe"
import { verifyCaptcha } from "@/lib/captcha"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL není nastaveno v .env")
  }

  return appUrl
}

function mapStripeError(error: unknown) {
  if (error && typeof error === "object" && "code" in error && error.code === "amount_too_small") {
    return new Error("Objednávka musí být minimálně za 15 Kč.")
  }

  return error
}

async function createStripeCheckoutSessionForOrder(order: {
  id: string
  items: Array<{
    quantity: number
    price: Prisma.Decimal
    product: { name: string }
  }>
}) {
  const appUrl = getAppUrl()

  return stripe.checkout.sessions.create({
    mode: "payment",
    currency: "czk",
    line_items: order.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "czk",
        unit_amount: Math.round(item.price.toNumber() * 100),
        product_data: { name: item.product.name },
      },
    })),
    metadata: { orderId: order.id },
    success_url: `${appUrl}/dekujeme?orderId=${order.id}&status=success`,
    cancel_url: `${appUrl}/dekujeme?orderId=${order.id}&status=cancelled`,
  })
}

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
  captchaToken: string
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
      captchaToken: z.string().min(1),
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

  const isCaptchaValid = await verifyCaptcha(validated.captchaToken)
  if (!isCaptchaValid) {
    throw new Error("Ověření CAPTCHA selhalo. Jste robot?")
  }

  const requestedDate = parseLocalDateOnly(validated.requestedDeliveryDate)
  assertDeliveryCutoff(requestedDate)

  const address = validated.deliveryMethod === "DELIVERY" ? validated.deliveryAddress : undefined
  if (validated.deliveryMethod === "DELIVERY" && !address) {
    throw new Error("Chybí doručovací adresa")
  }

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
    select: { id: true, price: true, name: true },
  })

  const productById = new Map(products.map((p) => [p.id, p]))

  let totalPrice = new Prisma.Decimal(0)
  const orderItemsData: Array<{ productId: string; quantity: number; price: Prisma.Decimal }> = []
  const emailItems: Array<{ productName: string; quantity: number; price: number }> = []

  for (const item of validated.items) {
    const product = productById.get(item.productId)
    if (!product) throw new Error(`Produkt ${item.productId} neexistuje`)

    totalPrice = totalPrice.plus(product.price.mul(item.quantity))

    orderItemsData.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
    })

    emailItems.push({
      productName: product.name,
      quantity: item.quantity,
      price: product.price.toNumber(),
    })
  }

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

  // Stripe Checkout pro online platbu kartou
  if (validated.paymentType === "ONLINE_CARD") {
    try {
      const session = await createStripeCheckoutSessionForOrder({
        id: order.id,
        items: orderItemsData.map((item) => {
          const product = productById.get(item.productId)
          if (!product) throw new Error(`Produkt ${item.productId} neexistuje`)

          return {
            quantity: item.quantity,
            price: item.price,
            product: { name: product.name },
          }
        }),
      })

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      })

      return { success: true, orderId: order.id, checkoutUrl: session.url }
    } catch (error) {
      await prisma.order.delete({ where: { id: order.id } })

      throw mapStripeError(error)
    }
  }

  const email = getOrderStatusEmailContent({ 
    orderNumber: order.orderNumber, 
    status: "PENDING",
    items: emailItems,
    totalPrice: totalPrice.toNumber()
  })
  
  if (email && session.user.email) {
    await sendEmail({
      to: session.user.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    })
  }

  return { success: true, orderId: order.id }
}

export async function checkAndUpdatePaymentStatus(orderId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Neautorizováno")

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
    select: { stripeSessionId: true, isPaid: true },
  })

  if (!order) throw new Error("Objednávka nenalezena")
  if (order.isPaid) return { success: true, isPaid: true }

  if (!order.stripeSessionId) {
    return { success: true, isPaid: false }
  }

  // Zkontroluj payment status v Stripe
  const stripeSession = await stripe.checkout.sessions.retrieve(order.stripeSessionId)

  // Zkus payment_status
  if (stripeSession.payment_status === "paid") {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    })
    return { success: true, isPaid: true }
  }

  return { success: true, isPaid: false }
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

export async function createCheckoutSessionForExistingOrder(orderId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("Musíte být přihlášen.")

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
    },
    select: {
      id: true,
      status: true,
      paymentType: true,
      isPaid: true,
      items: {
        select: {
          quantity: true,
          price: true,
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  if (!order) throw new Error("Objednávka nebyla nalezena.")
  if (order.paymentType !== "ONLINE_CARD") {
    throw new Error("Tato objednávka nepodporuje online doplacení.")
  }
  if (order.isPaid) {
    throw new Error("Tato objednávka už je zaplacená.")
  }
  if (order.status === "CANCELLED") {
    throw new Error("Zrušenou objednávku nelze zaplatit.")
  }
  if (order.items.length === 0) {
    throw new Error("Objednávka neobsahuje žádné položky.")
  }

  try {
    const stripeSession = await createStripeCheckoutSessionForOrder(order)

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    })

    if (!stripeSession.url) {
      throw new Error("Nepodařilo se vytvořit platební odkaz.")
    }

    return { checkoutUrl: stripeSession.url }
  } catch (error) {
    throw mapStripeError(error)
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user.role !== "ADMIN" && session?.user.role !== "EMPLOYEE") {
    throw new Error("Přístup zamítnut.")
  }

  const order = await prisma.order.findUnique({ 
    where: { id: orderId },
    include: { user: true, items: { include: { product: true } } }
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
    data: { status, ...milestoneData }
  })

  const email = getOrderStatusEmailContent({ 
    orderNumber: order.orderNumber, 
    status,
    items: order.items.map(item => ({
      productName: item.product.name, quantity: item.quantity, price: item.price.toNumber()
    })),
    totalPrice: order.totalPrice.toNumber()
  })

  if (email) {
    await sendEmail({
      to: order.user.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    })
  }

  return { success: true }
}