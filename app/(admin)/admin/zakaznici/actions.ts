"use server"

import { prisma } from "@/lib/db"
import { Role, Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getUsers(query?: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // Basic authorization check
  if (session?.user?.role !== "ADMIN") {
    return []
  }

  const where: Prisma.UserWhereInput = {}
  
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ]
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
        _count: {
            select: { orders: true }
        },
        addresses: true
    }
  })

  return users
}

export async function updateUserRole(userId: string, newRole: Role) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (session?.user?.role !== "ADMIN") {
     throw new Error("Neautorizovaný přístup")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  })

  revalidatePath("/admin/zakaznici")
}