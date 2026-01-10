import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product } from "@prisma/client"
import { AddToCart } from "@/components/add-to-cart"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-all duration-300 group relative">
        <Link href={`/produkt/${product.id}`} className="absolute inset-0 z-10" aria-label={`Zobrazit detail ${product.name}`}>
          <span className="sr-only">Zobrazit detail</span>
        </Link>

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

        <CardFooter className="p-4 pt-3 flex items-center justify-between border-t bg-muted/20 relative z-20">
            <span className="text-xl font-bold text-primary">
                {Number(product.price).toFixed(0)} Kč
            </span>
            
            <div className="relative z-30">
               <AddToCart 
                 product={{
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    imageUrl: product.imageUrl
                 }}
                 size="sm"
                 className="font-semibold shadow-sm hover:shadow-md transition-all"
               />
            </div>
        </CardFooter>
    </Card>
  )
}