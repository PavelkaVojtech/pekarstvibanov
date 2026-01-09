import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProductForm } from "@/components/admin/product-form" // Import nové komponenty
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  // Načteme kategorie pro select box
  const categories = await prisma.category.findMany()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/produkty">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold font-serif">Nový produkt</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Údaje o produktu</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Zde vložíme klientský formulář a předáme mu data */}
          <ProductForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}