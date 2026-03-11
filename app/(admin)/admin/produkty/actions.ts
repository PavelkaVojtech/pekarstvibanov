"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"

export type CreateProductState =
  | { error: string; success?: false }
  | { success: true; error?: never }
  | null

const FileSchema = z.custom<File>((value) => value instanceof File)

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.preprocess(
    (value) => {
      if (typeof value === "string") {
        return value.replace(/\s+/g, "").replace(",", ".")
      }
      return value
    },
    z.coerce.number().min(0)
  ),
  categoryId: z.string().min(1),
  isAvailable: z.boolean().optional(),
})

const MAX_IMAGE_SIZE = 3 * 1024 * 1024

function getFilesFromFormData(formData: FormData) {
  return formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0)
}

function parseIds(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || !value) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0)
  } catch {
    return []
  }
}

function validateImages(files: File[]) {
  for (const file of files) {
    if (!FileSchema.safeParse(file).success) {
      return { error: "Neplatný soubor" as const }
    }

    if (!file.type?.startsWith("image/")) {
      return { error: "Chybný formát" as const }
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return { error: "Příliš velké" as const }
    }
  }

  return { error: null }
}

async function uploadImages(files: File[]) {
  const uploaded: string[] = []

  for (const file of files) {
    const blob = await put(`produkty/${Date.now()}-${file.name}`, file, {
      access: "public",
    })
    uploaded.push(blob.url)
  }

  return uploaded
}

async function setPrimaryImage(productId: string, preferredPrimaryId?: string | null) {
  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  })

  if (images.length === 0) {
    await prisma.product.update({ where: { id: productId }, data: { imageUrl: null } })
    return
  }

  const desiredPrimary =
    (preferredPrimaryId ? images.find((img) => img.id === preferredPrimaryId) : undefined) ||
    images.find((img) => img.isPrimary) ||
    images[0]

  await prisma.$transaction([
    prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    }),
    prisma.productImage.update({
      where: { id: desiredPrimary.id },
      data: { isPrimary: true },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { imageUrl: desiredPrimary.imageUrl },
    }),
  ])
}

export async function createProduct(_prevState: CreateProductState, formData: FormData): Promise<CreateProductState> {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const role = (session?.user as { role?: string } | undefined)?.role

  if (role !== "ADMIN") {
    return { error: "Odepřeno" }
  }

  const files = getFilesFromFormData(formData)

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    isAvailable: formData.get("isAvailable") === "on", 
  }

  const result = productSchema.safeParse(rawData)

  if (!result.success) {
    return { error: "Neplatná data" }
  }

  const imageValidation = validateImages(files)
  if (imageValidation.error) {
    return { error: imageValidation.error }
  }

  try {
    const uploadedImageUrls = await uploadImages(files)
    const primaryImageUrl = uploadedImageUrls[0] ?? null

    await prisma.product.create({
      data: {
        name: result.data.name,
        description: result.data.description,
        price: result.data.price,
        categoryId: result.data.categoryId,
        imageUrl: primaryImageUrl,
        isAvailable: result.data.isAvailable ?? true,
        images: {
          create: uploadedImageUrls.map((imageUrl, index) => ({
            imageUrl,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
      },
    })
  } catch {
    return { error: "Chyba" }
  }

  revalidatePath("/admin/produkty")
  revalidatePath("/produkty")
  return { success: true }
}

export async function updateProduct(productId: string, _prevState: CreateProductState, formData: FormData): Promise<CreateProductState> {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const role = (session?.user as { role?: string } | undefined)?.role

  if (role !== "ADMIN") {
    return { error: "Odepřeno" }
  }

  const files = getFilesFromFormData(formData)
  const removedImageIds = parseIds(formData.get("removedImageIds"))
  const primaryImageId = typeof formData.get("primaryImageId") === "string" ? String(formData.get("primaryImageId")) : null

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    isAvailable: formData.get("isAvailable") === "on",
  }

  const result = productSchema.safeParse(rawData)

  if (!result.success) {
    return { error: "Neplatná data" }
  }

  const imageValidation = validateImages(files)
  if (imageValidation.error) {
    return { error: imageValidation.error }
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    })

    if (!existingProduct) {
      return { error: "Nenalezeno" }
    }

    const toRemove = existingProduct.images.filter((img) => removedImageIds.includes(img.id))
    for (const image of toRemove) {
      try {
        await del(image.imageUrl)
      } catch {
      }
    }

    if (toRemove.length > 0) {
      await prisma.productImage.deleteMany({
        where: {
          id: {
            in: toRemove.map((img) => img.id),
          },
        },
      })
    }

    const remainingImagesCount = await prisma.productImage.count({ where: { productId } })
    const uploadedImageUrls = await uploadImages(files)

    for (let index = 0; index < uploadedImageUrls.length; index += 1) {
      await prisma.productImage.create({
        data: {
          productId,
          imageUrl: uploadedImageUrls[index],
          sortOrder: remainingImagesCount + index,
          isPrimary: false,
        },
      })
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        name: result.data.name,
        description: result.data.description,
        price: result.data.price,
        categoryId: result.data.categoryId,
        isAvailable: result.data.isAvailable ?? true,
      },
    })

    await setPrimaryImage(productId, primaryImageId)
  } catch {
    return { error: "Chyba" }
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
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    })

    for (const image of product?.images ?? []) {
      try {
        await del(image.imageUrl)
      } catch {
      }
    }
    
    await prisma.product.delete({ where: { id } })
    revalidatePath("/admin/produkty")
    revalidatePath("/produkty")
  } catch (e) {
  }
}