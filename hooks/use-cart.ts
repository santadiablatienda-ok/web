"use client"

import { useState, useEffect, useCallback } from "react"
import { type Product, finalPrice } from "@/lib/products"

export interface CartItem {
  product: Product
  quantity: number
  selectedSize?: string
  selectedColor?: string
  isBackorder?: boolean // pedido por encargo por falta de stock: no se abona nada por adelantado, se coordina por WhatsApp una vez confirmado el stock en fabrica
}

const CART_KEY = "santa-diabla-cart"
export const DEPOSIT_PERCENT = 0

function cartKey(productId: string, size?: string, color?: string, isBackorder?: boolean): string {
  return `${productId}__${size ?? ""}__${color ?? ""}__${isBackorder ? "encargo" : "stock"}`
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

  const addToCart = useCallback((product: Product, quantity = 1, selectedSize?: string, isBackorder = false, selectedColor?: string) => {
    setItems((prev) => {
      const key = cartKey(product.id, selectedSize, selectedColor, isBackorder)
      const existing = prev.find((i) => cartKey(i.product.id, i.selectedSize, i.selectedColor, i.isBackorder) === key)
      if (existing) {
        return prev.map((i) =>
          cartKey(i.product.id, i.selectedSize, i.selectedColor, i.isBackorder) === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { product, quantity, selectedSize, selectedColor, isBackorder }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string, selectedSize?: string, isBackorder?: boolean, selectedColor?: string) => {
    const key = cartKey(productId, selectedSize, selectedColor, isBackorder)
    setItems((prev) => prev.filter((i) => cartKey(i.product.id, i.selectedSize, i.selectedColor, i.isBackorder) !== key))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number, selectedSize?: string, isBackorder?: boolean, selectedColor?: string) => {
    if (quantity < 1) return
    const key = cartKey(productId, selectedSize, selectedColor, isBackorder)
    setItems((prev) =>
      prev.map((i) => cartKey(i.product.id, i.selectedSize, i.selectedColor, i.isBackorder) === key ? { ...i, quantity } : i)
    )
  }, [])

  const clearCart = useCallback(() => { setItems([]) }, [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + finalPrice(i.product) * i.quantity, 0)
  const depositTotal = items.reduce((sum, i) => {
    const lineTotal = finalPrice(i.product) * i.quantity
    return sum + (i.isBackorder ? Math.round(lineTotal * DEPOSIT_PERCENT / 100) : lineTotal)
  }, 0)

  return { items, totalItems, totalPrice, depositTotal, addToCart, removeFromCart, updateQuantity, clearCart }
}
