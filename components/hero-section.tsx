import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FaBreadSlice } from "react-icons/fa"
import { getSiteSettings } from "@/app/actions/settings"

export async function HeroSection() {
  const settings = await getSiteSettings()

  return (
    <section className="relative h-[85dvh] min-h-[500px] w-full overflow-hidden flex items-center justify-center text-center bg-background text-foreground transition-colors duration-300">
      
      {settings.heroImageUrl ? (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${settings.heroImageUrl})` }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-accent/50 via-background to-background" />
      )}

      <div className="relative z-10 container px-6 py-12 space-y-8 animate-in fade-in zoom-in duration-1000">
        <div className="flex justify-center mb-4">
            <FaBreadSlice className="h-12 w-12 md:h-20 md:w-20 text-primary drop-shadow-2xl" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase font-serif leading-tight">
            {settings.heroTitle}
          </h1>
          <p className="text-base sm:text-lg md:text-2xl text-primary font-bold tracking-[0.2em] uppercase drop-shadow-md max-w-3xl mx-auto">
            {settings.heroSubtitle}
          </p>
        </div>
        
        <div className="pt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="h-16 px-10 rounded-full text-lg font-black shadow-xl hover:scale-105 transition-transform">
            <Link href={settings.heroButtonLink}>
              {settings.heroButtonText}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}