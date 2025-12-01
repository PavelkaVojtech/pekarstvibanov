import React from 'react'
import { CategoriesSection } from '@/components/categories-section'

const ProduktyPage = () => {
  return (
    // Opraveno: bg-background místo bg-gray-950
    <div className="min-h-screen bg-background pt-10 transition-colors duration-300">
      
      <div className="container mx-auto px-4 text-center mb-4">
        <h1 className="text-4xl font-bold text-foreground font-serif tracking-wider uppercase">
          Kompletní nabídka
        </h1>
        <p className="text-muted-foreground mt-2">Vyberte si z našich čerstvých kategorií</p>
      </div>

      <CategoriesSection />
    </div>
  )
}

export default ProduktyPage