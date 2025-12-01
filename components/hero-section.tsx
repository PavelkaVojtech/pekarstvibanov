import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FaBreadSlice } from "react-icons/fa"

export function HeroSection() {
  return (
    <section className="relative h-[80dvh] w-full overflow-hidden flex items-center justify-center text-center bg-background text-foreground transition-colors duration-300">
      
      {/* --- PLACEHOLDER POZADÍ (Gradient) --- */}
      {/* OPRAVA: Gradient nyní respektuje téma. Ve světlém režimu je jemný, v tmavém hluboký. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/50 via-background to-background pointer-events-none" />

      {/* --- OBSAH --- */}
      <div className="relative z-10 container px-4 space-y-8 animate-in fade-in zoom-in duration-1000">
        <div className="flex justify-center mb-6">
            {/* Ikona má barvu primary (zlatá) */}
            <FaBreadSlice className="h-16 w-16 text-primary drop-shadow-lg" />
        </div>

        {/* Text používá text-foreground (černá v light, bílá v dark) */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-foreground tracking-tight uppercase drop-shadow-sm font-serif">
          Pečeme s láskou
        </h1>
        <p className="text-lg md:text-2xl text-primary font-light tracking-widest uppercase drop-shadow-sm">
          Chléb &bull; Rohlíky &bull; Tradice
        </p>
        
        <div className="pt-8">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-10 py-7 rounded-full transition-transform hover:scale-105 shadow-lg">
            <Link href="/produkty">
              Naše nabídka
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}