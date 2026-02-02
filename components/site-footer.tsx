import Link from "next/link"
import { FaFacebookF, FaInstagram, FaBreadSlice, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa"
import { Separator } from "@/components/ui/separator"
import { getSiteSettings } from "@/app/actions/settings"

export async function SiteFooter() {
  const settings = await getSiteSettings()
  
  // Parsování otevírací doby
  const openingHours = typeof settings.openingHours === 'string'
    ? JSON.parse(settings.openingHours)
    : settings.openingHours

  return (
    <footer className="bg-muted border-t border-border pt-16 pb-8 text-muted-foreground font-sans transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-screen-2xl">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2 group w-fit">
                <FaBreadSlice className="h-6 w-6 text-primary group-hover:text-foreground transition-colors" />
                <span className="text-xl font-bold tracking-wider font-serif text-foreground">
                  PEKAŘSTVÍ BÁNOV
                </span>
            </Link>
            <p className="text-sm leading-relaxed opacity-80 max-w-xs">
              Poctivé řemeslo, které voní. Každý den pro vás pečeme z těch nejlepších lokálních surovin.
            </p>
            <div className="flex gap-3 pt-2">
              {settings.facebookUrl && settings.facebookUrl !== '#' && (
                <Link href={settings.facebookUrl} className="h-10 w-10 flex items-center justify-center rounded-md bg-background border border-border hover:border-primary hover:text-primary transition-all shadow-sm">
                  <FaFacebookF />
                </Link>
              )}
              {settings.instagramUrl && settings.instagramUrl !== '#' && (
                <Link href={settings.instagramUrl} className="h-10 w-10 flex items-center justify-center rounded-md bg-background border border-border hover:border-primary hover:text-primary transition-all shadow-sm">
                  <FaInstagram />
                </Link>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-foreground font-serif tracking-wider uppercase mb-6 font-semibold">Menu</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/produkty" className="hover:text-primary transition-colors">Naše produkty</Link></li>
              <li><Link href="/onas" className="hover:text-primary transition-colors">O nás</Link></li>
              <li><Link href="/kontakt" className="hover:text-primary transition-colors">Kontakt</Link></li>
              <li><Link href="/prihlaseni" className="hover:text-primary transition-colors">Zaměstnanecká sekce</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-serif tracking-wider uppercase mb-6 font-semibold">Kontaktujte nás</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-primary" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="text-primary" />
                <a href={`tel:${settings.phone}`} className="hover:text-foreground transition-colors">{settings.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-primary" />
                <a href={`mailto:${settings.email}`} className="hover:text-foreground transition-colors">{settings.email}</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-serif tracking-wider uppercase mb-6 font-semibold">Otevíráme</h3>
            
            <div className="bg-background/50 p-4 rounded-lg border border-border max-w-[260px] shadow-sm">
                <ul className="space-y-3 text-sm">
                    {openingHours.map((item: { day: string; hours: string; closed?: boolean }, index: number) => (
                      <li key={index} className={`flex justify-between items-center ${index < openingHours.length - 1 ? 'border-b border-border pb-2' : 'pt-1'}`}>
                          <span className={item.closed ? "text-muted-foreground" : ""}>{item.day}</span>
                          <span className={item.closed ? "text-primary font-xs uppercase font-bold tracking-wider" : "text-foreground font-medium"}>
                              {item.hours}
                          </span>
                      </li>
                    ))}
                </ul>
            </div>
          </div>

        </div>

        <Separator className="bg-border mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-70">
          <p>&copy; {new Date().getFullYear()} Pekařství Bánov. Všechna práva vyhrazena.</p>
          <div className="flex gap-6">
            <Link href="/podminky" className="hover:text-foreground transition-colors">Obchodní podmínky</Link>
            <Link href="/gdpr" className="hover:text-foreground transition-colors">Ochrana osobních údajů</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}