import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { prisma } from "@/lib/db"

export async function CategoriesSection() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <section className="py-20 bg-background transition-colors duration-300">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 uppercase font-serif tracking-wider text-foreground">
          Náš sortiment
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link key={category.id} href={`/produkty/${category.slug}`} className="group block">
              <Card className="overflow-hidden border-none shadow-lg bg-card text-card-foreground hover:shadow-primary/10 transition-all duration-300">
                
                <CardContent className="p-0 relative aspect-4/3 flex items-center justify-center bg-muted/30 border border-border group-hover:border-primary/30 transition-colors overflow-hidden">
                  
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                    <h3 className="text-white text-2xl font-serif font-bold uppercase tracking-widest drop-shadow-lg border-b-2 border-transparent group-hover:border-primary pb-1 transition-all">
                      {category.name}
                    </h3>
                  </div>

                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}