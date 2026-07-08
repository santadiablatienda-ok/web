"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { CategoryBanners } from "@/components/category-banners"
import { FeaturedSection } from "@/components/featured-section"
import { Catalog } from "@/components/catalog"
import { EncargoSection } from "@/components/encargo-section"
import { CartDrawer } from "@/components/cart-drawer"
import { ContactBanner } from "@/components/contact-banner"
import { PaymentMethods } from "@/components/payment-methods"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { useCart } from "@/hooks/use-cart"
import { type Product } from "@/lib/products"

export default function HomePage() {
  const [cartOpen, setCartOpen] = useState(false)
  const { items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart } = useCart()

  function handleAddToCart(product: Product, quantity = 1, selectedSize?: string) {
    addToCart(product, quantity, selectedSize)
    setCartOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={totalItems} onCartOpen={() => setCartOpen(true)} />

      <main className="flex-1">
        <Hero />
        <CategoryBanners />
        <FeaturedSection onAddToCart={handleAddToCart} />
        <Catalog onAddToCart={handleAddToCart} />
        <EncargoSection />
        <PaymentMethods />
        <ContactBanner />
      </main>

      <Footer />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        totalPrice={totalPrice}
        onUpdateQuantity={(id, qty, size) => updateQuantity(id, qty, size)}
        onRemove={(id, size) => removeFromCart(id, size)}
        onClear={clearCart}
      />

      <WhatsAppButton />
    </div>
  )
}
