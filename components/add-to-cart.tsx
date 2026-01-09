"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/components/providers/cart-provider"
import { ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddToCartProps {
  product: {
    id: string
    name: string
    price: number | string
    imageUrl?: string | null
  }
  variant?: "default" | "secondary" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showText?: boolean
}

export function AddToCart({ product, variant = "default", size = "default", className, showText = true }: AddToCartProps) {
  const { addItem } = useCart()

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      imageUrl: product.imageUrl
    })
  }

  return (
    <Button variant={variant} size={size} className={cn("", className)} onClick={handleAdd}>
      <ShoppingCart className={cn("h-4 w-4", showText && "mr-2")} />
      {showText && "Do košíku"}
    </Button>
  )
}