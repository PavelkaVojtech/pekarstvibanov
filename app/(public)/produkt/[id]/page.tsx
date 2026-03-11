import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Check, Truck } from "lucide-react"
import { AddToCart } from "@/components/add-to-cart"
import { ProductGallery } from "@/components/product-gallery"

export const dynamic = "force-dynamic"

interface ProductDetailPageProps {
    params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const { id } = await params

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: true,
            images: {
                orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
            },
        },
    })

    if (!product) {
        notFound()
    }

    const primaryImageUrl =
        product.images.find((img) => img.isPrimary)?.imageUrl ||
        product.images[0]?.imageUrl ||
        product.imageUrl

    return (
        <div className="container mx-auto px-4 py-12 min-h-[70vh]">
            <div className="mb-8">
                <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary" asChild>
                    <Link href={`/produkty/${product.category.slug}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> 
                        Zpět na {product.category.name.toLowerCase()}
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                <div className="relative aspect-square md:aspect-4/3 bg-muted rounded-2xl overflow-hidden shadow-lg border border-border">
                    <ProductGallery
                        name={product.name}
                        images={[
                            ...product.images,
                            ...(product.images.length === 0 && product.imageUrl
                                ? [{ id: `${product.id}-legacy`, imageUrl: product.imageUrl, isPrimary: true }]
                                : []),
                        ]}
                    />
                </div>

                <div className="flex flex-col justify-center space-y-6">
                    <div>
                        <Badge variant="secondary" className="mb-4 text-primary bg-primary/10 hover:bg-primary/20 border-primary/20">
                            {product.category.name}
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-4">
                            {product.name}
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {product.description || "Tento produkt zatím nemá podrobný popis."}
                        </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-end gap-4">
                            <span className="text-4xl font-bold text-primary">
                                {Number(product.price).toFixed(0)} Kč
                            </span>
                            <span className="text-sm text-muted-foreground mb-2">
                                / kus
                            </span>
                        </div>

                        {product.isAvailable ? (
                            <div className="flex items-center text-green-600 font-medium text-sm">
                                <Check className="h-4 w-4 mr-2" /> Skladem, čerstvě napečeno
                            </div>
                        ) : (
                            <div className="flex items-center text-destructive font-medium text-sm">
                                Momentálně nedostupné
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 pt-4">
                        {product.isAvailable ? (
                            <div className="flex-1">
                                <AddToCart 
                                    product={{
                                        id: product.id,
                                        name: product.name,
                                        price: Number(product.price),
                                        imageUrl: primaryImageUrl
                                    }} 
                                    size="lg"
                                    className="w-full h-14 text-lg font-bold shadow-md"
                                />
                            </div>
                        ) : (
                            <Button size="lg" disabled className="flex-1">Není skladem</Button>
                        )}
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg border border-border text-sm space-y-2 mt-4">
                        <div className="flex items-start gap-3">
                            <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold block text-foreground">Doprava po Bánově zdarma</span>
                                <span className="text-muted-foreground">Při objednávce nad 300 Kč vám pečivo dovezeme až ke dveřím.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}