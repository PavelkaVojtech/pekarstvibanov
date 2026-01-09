"use client"

import React, { createContext, useContext, useSyncExternalStore } from "react"
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

const CART_STORAGE_KEY = "cart"
const CART_UPDATED_EVENT = "cart:updated"

const EMPTY_CART: CartItem[] = []

let cachedCartString: string | null = null
let cachedCartItems: CartItem[] = EMPTY_CART

function readCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return []
  const saved = window.localStorage.getItem(CART_STORAGE_KEY)

  if (saved === cachedCartString) return cachedCartItems

  cachedCartString = saved

  if (!saved) {
    cachedCartItems = EMPTY_CART
    return cachedCartItems
  }

  try {
    const parsed = JSON.parse(saved)
    cachedCartItems = Array.isArray(parsed) ? (parsed as CartItem[]) : EMPTY_CART
    return cachedCartItems
  } catch {
    cachedCartItems = EMPTY_CART
    return cachedCartItems
  }
}

function writeCartToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return
  cachedCartItems = items
  cachedCartString = JSON.stringify(items)
  window.localStorage.setItem(CART_STORAGE_KEY, cachedCartString)

  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  document.cookie = `cart_count=${count}; path=/; max-age=31536000; samesite=lax`

  window.dispatchEvent(new Event(CART_UPDATED_EVENT))
}

function subscribeToCartStore(callback: () => void) {
  if (typeof window === "undefined") return () => {}

  const onStorage = (e: StorageEvent) => {
    if (e.key === CART_STORAGE_KEY) callback()
  }

  const onUpdated = () => callback()

  window.addEventListener("storage", onStorage)
  window.addEventListener(CART_UPDATED_EVENT, onUpdated)

  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(CART_UPDATED_EVENT, onUpdated)
  }
}

export function CartProvider({
  children,
  initialItemCount = 0,
}: {
  children: React.ReactNode
  initialItemCount?: number
}) {
  const { toast } = useToast()
  const items = useSyncExternalStore(subscribeToCartStore, readCartFromStorage, () => EMPTY_CART)

  const addItem = (newItem: CartItem) => {
    const current = readCartFromStorage()
    const existing = current.find((i) => i.productId === newItem.productId)
    const next = existing
      ? current.map((i) =>
          i.productId === newItem.productId
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        )
      : [...current, newItem]

    writeCartToStorage(next)
    toast({ title: "Přidáno do košíku", description: `${newItem.name} (${newItem.quantity}ks)` })
  }

  const removeItem = (productId: string) => {
    const current = readCartFromStorage()
    writeCartToStorage(current.filter((i) => i.productId !== productId))
  }

  const clearCart = () => writeCartToStorage([])

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const derivedItemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const itemCount = typeof window === "undefined" ? initialItemCount : derivedItemCount

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