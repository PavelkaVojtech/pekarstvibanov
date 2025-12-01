import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { Prisma } from "@/lib/generated/prisma/client"

type Product = Prisma.ProductGetPayload<{}>

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300 group relative">
        
        {/* Odkaz na detail */}
        <Link href={`/produkt/${product.id}`} className="absolute inset-0 z-10" aria-label={`Zobrazit detail ${product.name}`}>
          <span className="sr-only">Zobrazit detail</span>
        </Link>

        {/* Obrázek - opravená třída aspect-4/3 */}
        <div className="relative aspect-4/3 bg-muted flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
                 <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                 />
            ) : (
                <div className="text-6xl select-none opacity-20 group-hover:scale-110 transition-transform duration-300">
                    🥖
                </div>
            )}
        </div>

        {/* Obsah */}
        <CardHeader className="p-4 pb-2">
            <CardTitle className="text-lg font-serif tracking-wide group-hover:text-primary transition-colors">
                {product.name}
            </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 pt-0 flex-1">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {product.description || "Tradiční pečivo z naší pece."}
            </p>
        </CardContent>

        {/* Patička */}
        <CardFooter className="p-4 pt-3 flex items-center justify-between border-t bg-muted/20 relative z-20">
            <span className="text-xl font-bold text-primary">
                {Number(product.price).toFixed(0)} Kč
            </span>
            
            <Button size="sm" className="font-semibold shadow-sm hover:shadow-md transition-all relative z-20">
                <ShoppingCart className="mr-2 h-4 w-4" /> Do košíku
            </Button>
        </CardFooter>
    </Card>
  )
}