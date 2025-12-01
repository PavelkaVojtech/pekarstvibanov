import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Croissant, Cookie, Wheat } from "lucide-react"

export function CategoriesSection() {
  const categories = [
    { 
      title: 'Chléb', 
      link: '/produkty/chleby', 
      // Ikony se přizpůsobí: v dark mode světlejší, v light mode tmavší šedá
      icon: <Wheat className="h-16 w-16 text-muted-foreground/50 group-hover:text-primary/50 transition-colors duration-500" />,
    },
    { 
      title: 'Běžné pečivo', 
      link: '/produkty/bezne-pecivo', 
      icon: <Croissant className="h-16 w-16 text-muted-foreground/50 group-hover:text-primary/50 transition-colors duration-500" />,
    },
    { 
      title: 'Jemné pečivo', 
      link: '/produkty/jemne-pecivo', 
      icon: <Cookie className="h-16 w-16 text-muted-foreground/50 group-hover:text-primary/50 transition-colors duration-500" />,
    },
  ]

  return (
    // Změna pozadí na bg-background (bílá/černá)
    <section className="py-20 bg-background transition-colors duration-300">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 uppercase font-serif tracking-wider text-foreground">
          Náš sortiment
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((cat) => (
            <Link key={cat.title} href={cat.link} className="group block">
              {/* Karty používají bg-card (bílá v light, tmavá v dark) */}
              <Card className="overflow-hidden border-none shadow-lg bg-card text-card-foreground hover:shadow-primary/10 transition-all duration-300">
                
                <CardContent className="p-0 relative aspect-[4/3] flex items-center justify-center bg-muted/30 border border-border group-hover:border-primary/30 transition-colors">
                  
                  {/* Ikona v pozadí */}
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {cat.icon}
                  </div>

                  {/* Overlay a text */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/5 group-hover:bg-background/0 transition-colors">
                    <h3 className="text-foreground text-2xl font-serif font-bold uppercase tracking-widest drop-shadow-sm border-b-2 border-transparent group-hover:border-primary pb-1 transition-all">
                      {cat.title}
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