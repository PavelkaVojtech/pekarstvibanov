import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { CategoriesSection } from "@/components/categories-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      
      <section className="bg-primary text-primary-foreground py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 font-serif">Máte speciální přání?</h2>
          <p className="mb-8 text-lg opacity-90">Zavolejte nám nebo se zastavte osobně v Bánově.</p>
          <p className="text-2xl font-bold">+420 735 290 268</p>
        </div>
      </section>
    </div>
  )
}