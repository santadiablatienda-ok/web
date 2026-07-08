"use client"

import { useState, useEffect, useCallback } from "react"
import { type Product } from "@/lib/products"

export interface CartItem {
  product: Product
  quantity: number
  selectedSize?: string
}

const CART_KEY = "santa-diabla-cart"

function cartKey(productId: string, size?: string): string {
  return size ? `${productId}__${size}` : productId
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch { /* ignore */ }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    } catch { /* ignore */ }
  }, [items, loaded])

  const addToCart = useCallback((product: Product, quantity = 1, selectedSize?: string) => {
    setItems((prev) => {
      const key = cartKey(product.id, selectedSize)
      const existing = prev.find((i) => cartKey(i.product.id, i.selectedSize) === key)
      if (existing) {
        return prev.map((i) =>
          cartKey(i.product.id, i.selectedSize) === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { product, quantity, selectedSize }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string, selectedSize?: string) => {
    const key = cartKey(productId, selectedSize)
    setItems((prev) => prev.filter((i) => cartKey(i.product.id, i.selectedSize) !== key))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number, selectedSize?: string) => {
    if (quantity < 1) return
    const key = cartKey(productId, selectedSize)
    setItems((prev) =>
      prev.map((i) => cartKey(i.product.id, i.selectedSize) === key ? { ...i, quantity } : i)
    )
  }, [])

  const clearCart = useCallback(() => { setItems([]) }, [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  return { items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart }
}
