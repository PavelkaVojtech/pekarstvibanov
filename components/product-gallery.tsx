"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

type ProductGalleryImage = {
  id: string
  imageUrl: string
  isPrimary?: boolean
}

interface ProductGalleryProps {
  name: string
  images: ProductGalleryImage[]
}

export function ProductGallery({ name, images }: ProductGalleryProps) {
  const orderedImages = useMemo(
    () => [...images].sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary))),
    [images]
  )

  const [activeIndex, setActiveIndex] = useState(0)

  if (orderedImages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-9xl opacity-10 select-none">
        🥖
      </div>
    )
  }

  const activeImage = orderedImages[activeIndex]

  const previous = () => {
    setActiveIndex((prev) => (prev - 1 + orderedImages.length) % orderedImages.length)
  }

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % orderedImages.length)
  }

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="relative flex-1 min-h-[280px]">
        <Image src={activeImage.imageUrl} alt={name} fill className="object-cover" priority />

        {orderedImages.length > 1 && (
          <>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute top-1/2 left-3 -translate-y-1/2"
              onClick={previous}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute top-1/2 right-3 -translate-y-1/2"
              onClick={next}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {orderedImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2 px-3 pb-3">
          {orderedImages.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square overflow-hidden rounded border ${
                activeIndex === index ? "border-primary" : "border-border"
              }`}
            >
              <Image src={img.imageUrl} alt={`${name} ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
