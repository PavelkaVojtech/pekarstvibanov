import { MapPin, Wheat, Leaf, Users, Star, Heart, Award, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSiteSettings } from "@/app/actions/settings"

// Mapa ikon pro dynamické zobrazení
const iconMap = {
  Wheat,
  Leaf,
  Users,
  Star,
  Heart,
  Award,
  Sparkles,
  MapPin,
}

export async function AboutSection() {
  const settings = await getSiteSettings()
  
  // Parsování JSON polí
  const values = typeof settings.aboutCards === 'string' 
    ? JSON.parse(settings.aboutCards)
    : settings.aboutCards

  return (
    <div className="flex flex-col gap-16 py-16 md:py-24 bg-background text-foreground transition-colors duration-300">
      
      <section className="container mx-auto px-4 text-center max-w-3xl space-y-6">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary tracking-wide uppercase drop-shadow-sm">
          {settings.aboutTitle}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          {settings.aboutDescription}
        </p>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((item: { title: string; description: string; icon: string }) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Star
            
            return (
              <Card key={item.title} className="bg-card border-border shadow-md hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-col items-center pb-2">
                  <div className="p-4 bg-accent/50 rounded-full border border-border mb-4">
                    <IconComponent className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-foreground uppercase tracking-wide font-serif text-center">
                      {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">
                      {item.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-serif text-foreground uppercase tracking-wider mb-4">
                Kde nás najdete
            </h2>
            <p className="text-muted-foreground flex items-center justify-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> {settings.address}
            </p>
        </div>
        
        <div className="rounded-xl overflow-hidden border border-border shadow-xl h-[450px]">
            <iframe
                src={settings.mapIframeSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa pekárny"
                className="w-full h-full"
            />
        </div>
      </section>

    </div>
  )
}