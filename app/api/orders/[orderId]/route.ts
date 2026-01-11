import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { Prisma } from "@prisma/client"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

const patchSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1),
})

export async function GET(_req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Neautorizováno" }, { status: 401 })

  const isAdmin = session.user.role === "ADMIN"

  const { orderId } = await params

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ...(isAdmin ? {} : { userId: session.user.id }),
    },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  })

  if (!order) return NextResponse.json({ error: "Objednávka nenalezena" }, { status: 404 })

  return NextResponse.json({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentType: order.paymentType,
    items: order.items.map((i) => ({
      productId: i.productId,
      name: i.product.name,
      quantity: i.quantity,
      price: i.price.toString(),
    })),
  })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Neautorizováno" }, { status: 401 })

  const { orderId } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Neplatné JSON" }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Neplatná data" }, { status: 400 })
  }

  const quantityByProductId = new Map<string, number>()
  for (const item of parsed.data.items) {
    quantityByProductId.set(item.productId, (quantityByProductId.get(item.productId) ?? 0) + item.quantity)
  }

  const items = Array.from(quantityByProductId.entries()).map(([productId, quantity]) => ({ productId, quantity }))
  if (items.length === 0) return NextResponse.json({ error: "Objednávka musí obsahovat alespoň jednu položku" }, { status: 400 })

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.id,
    },
    select: {
      id: true,
      status: true,
    },
  })

  if (!order) return NextResponse.json({ error: "Objednávka nenalezena" }, { status: 404 })
  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Objednávku lze upravit jen před schválením" }, { status: 400 })
  }

  const productIds = items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true },
  })

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: "Některé produkty nebyly nalezeny" }, { status: 400 })
  }

  const priceById = new Map<string, Prisma.Decimal>(products.map((p) => [p.id, p.price]))

  let totalPrice = new Prisma.Decimal(0)
  const orderItemsData: Array<{
    orderId: string
    productId: string
    quantity: number
    price: Prisma.Decimal
  }> = []

  for (const item of items) {
    const price = priceById.get(item.productId)
    if (!price) {
      return NextResponse.json({ error: "Některé produkty nebyly nalezeny" }, { status: 400 })
    }
    totalPrice = totalPrice.plus(price.mul(item.quantity))
    orderItemsData.push({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      price,
    })
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({ where: { orderId: order.id } })

    for (const item of orderItemsData) {
      await tx.orderItem.create({
        data: {
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        },
      })
    }

    await tx.order.update({ where: { id: order.id }, data: { totalPrice } })

    return tx.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true } } },
          orderBy: { id: "asc" },
        },
      },
    })
  })

  if (!updated) return NextResponse.json({ error: "Objednávku se nepodařilo uložit" }, { status: 500 })

  return NextResponse.json({
    success: true,
    order: {
      id: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      totalPrice: updated.totalPrice.toString(),
      items: updated.items.map((i) => ({
        productId: i.productId,
        name: i.product.name,
        quantity: i.quantity,
        price: i.price.toString(),
      })),
    },
  })
}
