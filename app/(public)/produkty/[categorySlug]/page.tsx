import { PrismaClient } from "@/lib/generated/prisma/client"
import { notFound } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const prisma = new PrismaClient()

interface CategoryPageProps {
    params: Promise<{ categorySlug: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    // Tady získáváme SLUG kategorie (např. 'chleby'), ne ID produktu
    const { categorySlug } = await params

    const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        include: {
            products: {
                where: { isAvailable: true },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!category) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-12 min-h-[60vh]">
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                <Button variant="ghost" className="w-fit pl-0 hover:bg-transparent hover:text-primary transition-colors" asChild>
                    <Link href="/produkty">
                        <ArrowLeft className="mr-2 h-5 w-5" /> Zpět na kategorie
                    </Link>
                </Button>
                
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold font-serif uppercase tracking-wide text-foreground">
                        {category.name}
                    </h1>
                    <p className="text-muted-foreground">
                        Čerstvě upečeno, s láskou připraveno.
                    </p>
                </div>
            </div>

            {category.products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-muted/20 rounded-2xl border border-dashed border-border text-center">
                    <div className="text-6xl mb-4 opacity-20">🍞</div>
                    <h3 className="text-xl font-semibold mb-2">Zatím je tu prázdno</h3>
                    <p className="text-muted-foreground max-w-md">
                        V této kategorii jsme zatím nic neupekli nebo je vše vyprodáno. 
                        Zkuste se podívat do jiné kategorie.
                    </p>
                    <Button asChild variant="outline" className="mt-6">
                        <Link href="/produkty">Prohlédnout jiné kategorie</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                    {category.products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    )
}