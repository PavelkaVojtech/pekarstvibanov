"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

const productSchema = z.object({
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Cena nemůže být záporná"),
  categoryId: z.string().min(1, "Vyberte kategorii"),
  // ZMĚNA: Povolíme cokoliv (File) nebo optional, protože obrázky zatím neřešíme
  image: z.any().optional(), 
  isAvailable: z.boolean().optional(),
})

export async function createProduct(prevState: any, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const role = (session?.user as any)?.role

  if (role !== "ADMIN") {
    return { error: "Nemáte oprávnění přidávat produkty." }
  }

  // Debug: Podíváme se, co nám formulář posílá
  // console.log("Checkbox isAvailable:", formData.get("isAvailable"))

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    image: formData.get("image"), // Tady teď přijde File objekt
    // Checkbox vrací "on" pokud je zaškrtnutý, jinak null
    isAvailable: formData.get("isAvailable") === "on", 
  }

  const result = productSchema.safeParse(rawData)

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  try {
    await prisma.product.create({
      data: {
        name: result.data.name,
        description: result.data.description,
        price: result.data.price,
        categoryId: result.data.categoryId,
        // ZMĚNA: Zatím natvrdo null, protože neřešíme upload
        imageUrl: null, 
        isAvailable: result.data.isAvailable ?? true,
      },
    })
  } catch (e) {
    console.error("Chyba při ukládání produktu:", e)
    return { error: "Nepodařilo se uložit produkt do databáze." }
  }

  revalidatePath("/admin/produkty")
  revalidatePath("/produkty")
  redirect("/admin/produkty")
}

export async function deleteProduct(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if ((session?.user as any)?.role !== "ADMIN") return

  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath("/admin/produkty")
    revalidatePath("/produkty")
  } catch (e) {
    console.error("Chyba při mazání:", e)
  }
}