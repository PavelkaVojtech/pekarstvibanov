import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductForm } from "@/components/admin/product-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

interface EditProductPageProps {
  params: Promise<{ productId: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = await params

  const [categories, product] = await Promise.all([
    prisma.category.findMany(),
    prisma.product.findUnique({ where: { id: productId } }),
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/produkty">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-serif">Upravit produkt</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Údaje o produktu</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            categories={categories}
            product={{
              id: product.id,
              name: product.name,
              description: product.description ?? "",
              price: Number(product.price),
              categoryId: product.categoryId,
              isAvailable: product.isAvailable,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
