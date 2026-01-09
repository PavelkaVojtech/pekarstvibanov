"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string | null
}

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  totalPrice: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem("cart")
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {
        console.error("Chyba při načítání košíku", e)
      }
    }
  }, [])

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, isMounted])

  const addItem = (newItem: CartItem) => {
    setItems((current) => {
      const existing = current.find((i) => i.productId === newItem.productId)
      if (existing) {
        return current.map((i) =>
          i.productId === newItem.productId
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        )
      }
      return [...current, newItem]
    })
    toast({ title: "Přidáno do košíku", description: `${newItem.name} (${newItem.quantity}ks)` })
  }

  const removeItem = (productId: string) => {
    setItems((current) => current.filter((i) => i.productId !== productId))
  }

  const clearCart = () => setItems([])

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  if (!isMounted) return null

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalPrice, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}