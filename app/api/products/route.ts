import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, price: true },
  })

  return NextResponse.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price.toString(),
    }))
  )
}
