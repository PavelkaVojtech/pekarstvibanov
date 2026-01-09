import Link from "next/link"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit } from "lucide-react"
import { deleteProduct } from "./actions" // Import serverové akce pro smazání

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  // Načteme produkty včetně názvu kategorie
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-serif">Produkty</h2>
            <p className="text-muted-foreground">Správa sortimentu ({products.length})</p>
        </div>
        <Button asChild>
            <Link href="/admin/produkty/novy">
                <Plus className="mr-2 h-4 w-4" /> Přidat produkt
            </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Seznam produktů</CardTitle>
            <CardDescription>Přehled všech produktů v pekárně.</CardDescription>
        </CardHeader>
        <CardContent>
            {products.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    Zatím zde nejsou žádné produkty.
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Název</TableHead>
                            <TableHead>Kategorie</TableHead>
                            <TableHead>Cena</TableHead>
                            <TableHead>Stav</TableHead>
                            <TableHead className="text-right">Akce</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product: (typeof products)[number]) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.category.name}</TableCell>
                                <TableCell>{Number(product.price).toFixed(0)} Kč</TableCell>
                                <TableCell>
                                    {product.isAvailable ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aktivní</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Skryto</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* Tlačítko pro smazání (Server Action ve formuláři) */}
                                        <form action={deleteProduct.bind(null, product.id)}>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  )
}