import { Wheat, Clock, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function FeaturesSection() {
  const features = [
    {
      title: "Tradiční receptury",
      description: "Vracíme se ke kořenům poctivého řemesla. Žádné urychlovače, jen čas a kvalitní mouka.",
      icon: <Wheat className="h-10 w-10 text-primary" />,
    },
    {
      title: "Vždy čerstvé",
      description: "Každé ráno pro vás pečeme čerstvé pečivo. Vstáváme dřív než slunce, abyste měli křupavou snídani.",
      icon: <Clock className="h-10 w-10 text-primary" />,
    },
    {
      title: "Rodinný přístup",
      description: "Jsme rodinná pekárna z Bánova. Každý bochník projde našima rukama.",
      icon: <Heart className="h-10 w-10 text-primary" />,
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-none bg-transparent text-center hover:scale-105 transition-transform duration-300">
              <CardHeader className="flex flex-col items-center pb-2">
                <div className="mb-4 p-4 bg-background rounded-full shadow-sm border border-border">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl uppercase tracking-wide font-serif">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}