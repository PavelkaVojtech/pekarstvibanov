import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FaBreadSlice } from "react-icons/fa"
import { getSiteSettings } from "@/app/actions/settings"

export async function HeroSection() {
  const settings = await getSiteSettings()

  return (
    <section className="relative h-[80dvh] w-full overflow-hidden flex items-center justify-center text-center bg-background text-foreground transition-colors duration-300">
      
      {/* Pozadí */}
      {settings.heroImageUrl ? (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${settings.heroImageUrl})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-accent/50 via-background to-background pointer-events-none" />
      )}

      <div className="relative z-10 container px-4 space-y-8 animate-in fade-in zoom-in duration-1000">
        <div className="flex justify-center mb-6">
            <FaBreadSlice className="h-16 w-16 text-primary drop-shadow-lg" />
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-foreground tracking-tight uppercase drop-shadow-sm font-serif">
          {settings.heroTitle}
        </h1>
        <p className="text-lg md:text-2xl text-primary font-light tracking-widest uppercase drop-shadow-sm">
          {settings.heroSubtitle}
        </p>
        
        <div className="pt-8">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-10 py-7 rounded-full transition-transform hover:scale-105 shadow-lg">
            <Link href={settings.heroButtonLink}>
              {settings.heroButtonText}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}