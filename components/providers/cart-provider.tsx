"use client"

import React, { createContext, useContext, useSyncExternalStore, useEffect, useMemo, useRef, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { authClient } from "@/lib/auth-client"

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
  setItemQuantity: (productId: string, quantity: number) => void
  incrementItem: (productId: string, delta?: number) => void
  clearCart: () => void
  totalPrice: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const GUEST_CART_STORAGE_KEY = "cart"
const CART_UPDATED_EVENT = "cart:updated"

const EMPTY_CART: CartItem[] = []

const cartCache = new Map<string, { cartString: string | null; items: CartItem[] }>()

function getUserCartStorageKey(userId: string) {
  return `cart:user:${userId}`
}

function getCached(key: string) {
  const existing = cartCache.get(key)
  if (existing) return existing
  const init = { cartString: null as string | null, items: EMPTY_CART }
  cartCache.set(key, init)
  return init
}

function readCartFromStorage(key: string): CartItem[] {
  if (typeof window === "undefined") return []
  const saved = window.localStorage.getItem(key)

  const cached = getCached(key)

  if (saved === cached.cartString) return cached.items

  cached.cartString = saved

  if (!saved) {
    cached.items = EMPTY_CART
    return cached.items
  }

  try {
    const parsed = JSON.parse(saved)
    cached.items = Array.isArray(parsed) ? (parsed as CartItem[]) : EMPTY_CART
    return cached.items
  } catch {
    cached.items = EMPTY_CART
    return cached.items
  }
}

function writeCartToStorage(key: string, items: CartItem[]) {
  if (typeof window === "undefined") return
  const cached = getCached(key)
  cached.items = items
  cached.cartString = JSON.stringify(items)
  window.localStorage.setItem(key, cached.cartString)

  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  document.cookie = `cart_count=${count}; path=/; max-age=31536000; samesite=lax`

  window.dispatchEvent(new Event(CART_UPDATED_EVENT))
}

function subscribeToCartStore(key: string, callback: () => void) {
  if (typeof window === "undefined") return () => {}

  const onStorage = (e: StorageEvent) => {
    if (e.key === key) callback()
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
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()
  const { data: session } = authClient.useSession()

  const userId = session?.user?.id
  const storageKey = useMemo(() => {
    if (userId) return getUserCartStorageKey(userId)
    return GUEST_CART_STORAGE_KEY
  }, [userId])

  const previousUserId = useRef<string | null>(null)
  
  const items = useSyncExternalStore(
    (callback) => subscribeToCartStore(storageKey, callback),
    () => readCartFromStorage(storageKey),
    () => EMPTY_CART
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const prev = previousUserId.current

    if (!prev && userId) {
      const guestItems = readCartFromStorage(GUEST_CART_STORAGE_KEY)
      if (guestItems.length > 0) {
        const userKey = getUserCartStorageKey(userId)
        const userItems = readCartFromStorage(userKey)

        const merged = new Map<string, CartItem>()
        for (const item of userItems) merged.set(item.productId, item)
        for (const item of guestItems) {
          const existing = merged.get(item.productId)
          merged.set(
            item.productId,
            existing
              ? { ...existing, quantity: existing.quantity + item.quantity }
              : item
          )
        }

        writeCartToStorage(userKey, Array.from(merged.values()))
        writeCartToStorage(GUEST_CART_STORAGE_KEY, [])
      } else {
        const userKey = getUserCartStorageKey(userId)
        const userItems = readCartFromStorage(userKey)
        const count = userItems.reduce((sum, i) => sum + i.quantity, 0)
        document.cookie = `cart_count=${count}; path=/; max-age=31536000; samesite=lax`
        window.dispatchEvent(new Event(CART_UPDATED_EVENT))
      }
    }

    if (prev && !userId) {
      writeCartToStorage(GUEST_CART_STORAGE_KEY, [])
    }

    previousUserId.current = userId ?? null
  }, [userId])

  const addItem = (newItem: CartItem) => {
    const current = readCartFromStorage(storageKey)
    const existing = current.find((i) => i.productId === newItem.productId)
    const next = existing
      ? current.map((i) =>
          i.productId === newItem.productId
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        )
      : [...current, newItem]

    writeCartToStorage(storageKey, next)
    toast({ title: "Přidáno do košíku", description: `${newItem.name} (${newItem.quantity}ks)` })
  }

  const removeItem = (productId: string) => {
    const current = readCartFromStorage(storageKey)
    writeCartToStorage(storageKey, current.filter((i) => i.productId !== productId))
  }

  const setItemQuantity = (productId: string, quantity: number) => {
    const current = readCartFromStorage(storageKey)
    const safeQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 0

    if (safeQuantity <= 0) {
      writeCartToStorage(storageKey, current.filter((i) => i.productId !== productId))
      return
    }

    const next = current.map((i) => (i.productId === productId ? { ...i, quantity: safeQuantity } : i))
    writeCartToStorage(storageKey, next)
  }

  const incrementItem = (productId: string, delta: number = 1) => {
    const current = readCartFromStorage(storageKey)
    const item = current.find((i) => i.productId === productId)
    if (!item) return
    setItemQuantity(productId, item.quantity + delta)
  }

  const clearCart = () => writeCartToStorage(storageKey, [])

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const derivedItemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  
  const itemCount = isMounted ? derivedItemCount : initialItemCount

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        setItemQuantity,
        incrementItem,
        clearCart,
        totalPrice,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}