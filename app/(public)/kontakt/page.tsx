import React from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactForm } from '@/components/contact-form'
import { getSiteSettings } from '@/app/actions/settings'

const KontaktPage = async () => {
  const settings = await getSiteSettings()
  
  // Parsování otevírací doby
  const operatingHours = typeof settings.openingHours === 'string'
    ? JSON.parse(settings.openingHours)
    : settings.openingHours

  const contactInfo = [
    { 
      icon: <MapPin className="text-primary h-6 w-6" />, 
      title: 'Adresa prodejny', 
      value: settings.address, 
    },
    { 
      icon: <Phone className="text-primary h-6 w-6" />, 
      title: 'Telefon', 
      value: settings.phone,
    },
    { 
      icon: <Mail className="text-primary h-6 w-6" />, 
      title: 'Email', 
      value: settings.email, 
    },
  ]

  return (
    <div className="bg-background min-h-screen py-16 md:py-24 transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        {/* Hlavní Nadpis */}
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-serif font-extrabold text-foreground tracking-tight">
            Kontakt a informace
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Máte otázku ke zboží, speciální objednávku, nebo se jen chcete stavit na kávu?
          </p>
        </header>

        {/* Formulář + Info Panel (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Levý sloupec - Kontaktní Formulář (2/3 šířky na desktopu) */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          {/* Pravý sloupec - Informační Panel (1/3 šířky na desktopu) */}
          <div className="space-y-8">
            
            {/* Kontaktní Detaily */}
            <div className="space-y-6">
                {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                        <div className="p-2 rounded-full bg-accent/50">
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            <p className="text-muted-foreground">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Otevírací doba */}
            <Card className="bg-card border-border shadow-md">
                <CardHeader className="p-4 flex-row items-center space-x-4 border-b border-border">
                    <Clock className="text-primary h-6 w-6" />
                    <CardTitle className="text-lg font-serif">Otevírací doba</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-4">
                    <ul className="space-y-2">
                        {operatingHours.map((item: { day: string; hours: string; closed?: boolean }, index: number) => (
                            <li key={index} className="flex justify-between text-sm">
                                <span className={item.closed ? "text-muted-foreground" : "text-foreground"}>
                                    {item.day}
                                </span>
                                <span className={item.closed ? "text-primary font-bold uppercase" : "text-foreground"}>
                                    {item.hours}
                                </span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

          </div>
        </div>

        {/* Mapa - full width section */}
        <section className="mt-16">
            <h2 className="text-3xl font-serif font-bold text-foreground text-center mb-6">
                Najdete nás zde
            </h2>
            <div className="rounded-xl overflow-hidden border border-border shadow-2xl h-[400px]">
                <iframe
                    src={settings.mapIframeSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa pekárny Bánov"
                    className="w-full h-full"
                />
            </div>
        </section>

      </div>
    </div>
  )
}

export default KontaktPage