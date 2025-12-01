import { MapPin, Wheat, Leaf, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AboutSection() {
  const values = [
    {
      icon: <Wheat className="h-10 w-10 text-primary" />,
      title: 'Tradiční receptury',
      description: 'Vracíme se ke kořenům poctivého pekařského řemesla a používáme osvědčené postupy.',
    },
    {
      icon: <Leaf className="h-10 w-10 text-primary" />,
      title: 'Čerstvé suroviny',
      description: 'Každý den vybíráme ty nejlepší lokální suroviny, protože na kvalitě záleží.',
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: 'Rodinný přístup',
      description: 'Jsme rodinná pekárna a naši zákazníci jsou pro nás jako součást rodiny.',
    },
  ]

  const adresaPekarny = "Bánov 52, 687 54 Bánov, Česká republika"
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(adresaPekarny)}&t=&z=15&ie=UTF8&iwloc=&output=embed`

  return (
    <div className="flex flex-col gap-16 py-16 md:py-24 bg-background text-foreground transition-colors duration-300">
      
      <section className="container mx-auto px-4 text-center max-w-3xl space-y-6">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary tracking-wide uppercase drop-shadow-sm">
          Vůně, která spojuje generace
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Naše pekařství z Bánova vzniklo z jedné jednoduché myšlenky – vrátit lidem chuť na <strong className="text-foreground font-medium">opravdové, poctivé pečivo</strong>. Každé ráno začínáme dřív než slunce, v naší malé pekárně to voní moukou, kváskem a poctivou prací.
        </p>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((item) => (
            <Card key={item.title} className="bg-card border-border shadow-md hover:border-primary/50 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-col items-center pb-2">
                <div className="p-4 bg-accent/50 rounded-full border border-border mb-4">
                    {item.icon}
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
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-serif text-foreground uppercase tracking-wider mb-4">
                Kde nás najdete
            </h2>
            <p className="text-muted-foreground flex items-center justify-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> {adresaPekarny}
            </p>
        </div>
        
        <div className="rounded-xl overflow-hidden border border-border shadow-xl h-[450px]">
            <iframe
                src={mapEmbedUrl}
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