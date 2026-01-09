"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"
import path from "path"
import fs from "fs/promises"

export type CreateProductState =
  | { error: string; success?: false }
  | { success: true; error?: never }
  | null

const FileSchema = z.custom<File>((value) => value instanceof File)

const productSchema = z.object({
  name: z.string().min(2, "Název musí mít alespoň 2 znaky"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Cena nemůže být záporná"),
  categoryId: z.string().min(1, "Vyberte kategorii"),
  image: z.union([FileSchema, z.null()]).optional(),
  isAvailable: z.boolean().optional(),
})

export async function createProduct(_prevState: CreateProductState, formData: FormData): Promise<CreateProductState> {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const role = (session?.user as { role?: string } | undefined)?.role

  if (role !== "ADMIN") {
    return { error: "Nemáte oprávnění přidávat produkty." }
  }

  // Debug: Podíváme se, co nám formulář posílá
  // console.log("Checkbox isAvailable:", formData.get("isAvailable"))

  const imageValue = formData.get("image")
  const image = imageValue instanceof File && imageValue.size > 0 ? imageValue : null

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    image,
    // Checkbox vrací "on" pokud je zaškrtnutý, jinak null
    isAvailable: formData.get("isAvailable") === "on", 
  }

  const result = productSchema.safeParse(rawData)

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  try {
    let imageUrl: string | null = null

    if (result.data.image instanceof File) {
      if (!result.data.image.type?.startsWith("image/")) {
        return { error: "Obrázek musí být typu image/*" }
      }

      const uploadsDir = path.join(process.cwd(), "public", "uploads")
      await fs.mkdir(uploadsDir, { recursive: true })

      const ext = path.extname(result.data.image.name || "").toLowerCase()
      const safeExt = ext && ext.length <= 10 ? ext : ""
      const fileName = `${randomUUID()}${safeExt}`
      const filePath = path.join(uploadsDir, fileName)

      const arrayBuffer = await result.data.image.arrayBuffer()
      await fs.writeFile(filePath, Buffer.from(arrayBuffer))

      imageUrl = `/uploads/${fileName}`
    }

    await prisma.product.create({
      data: {
        name: result.data.name,
        description: result.data.description,
        price: result.data.price,
        categoryId: result.data.categoryId,
        imageUrl,
        isAvailable: result.data.isAvailable ?? true,
      },
    })
  } catch (e) {
    console.error("Chyba při ukládání produktu:", e)
    return { error: "Nepodařilo se uložit produkt do databáze." }
  }

  revalidatePath("/admin/produkty")
  revalidatePath("/produkty")
  return { success: true }
}

export async function deleteProduct(id: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  const role = (session?.user as { role?: string } | undefined)?.role
  if (role !== "ADMIN") return

  try {
    await prisma.product.delete({ where: { id } })
    revalidatePath("/admin/produkty")
    revalidatePath("/produkty")
  } catch (e) {
    console.error("Chyba při mazání:", e)
  }
}