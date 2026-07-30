"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { type Product } from "@/lib/products"
import { getProducts } from "@/lib/products-store"
import { ProductCard } from "@/components/product-card"

interface SaleCarouselProps {
  onAddToCart: (product: Product, quantity: number, selectedSize?: string, isBackorder?: boolean, selectedColor?: string) => void
}

export function SaleCarousel({ onAddToCart }: SaleCarouselProps) {
  const [items, setItems] = useState<Product[]>([])
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getProducts()
      .then((products) => setItems(products.filter((p) => p.active !== false && p.onSale)))
      .catch(() => {})
  }, [])

  if (items.length === 0) return null

  function scrollByCards(dir: 1 | -1) {
    trackRef.current?.scrollBy({ left: dir * trackRef.current.clientWidth * 0.9, behavior: "smooth" })
  }

  return (
    <section id="sale" className="pt-0 pb-16" style={{ backgroundColor: "#0A0A0A" }}>
      <img
        src="/banners/banner-sale.webp"
        alt="Sale — hasta agotar stock"
        className="w-full h-auto block"
      />

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8">
        {items.length > 1 && (
          <div className="flex items-center justify-end gap-2 mb-4">
            <button
              onClick={() => scrollByCards(-1)}
              aria-label="Anterior"
              className="flex items-center justify-center w-9 h-9 border transition-all hover:bg-white hover:text-black"
              style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollByCards(1)}
              aria-label="Siguiente"
              className="flex items-center justify-center w-9 h-9 border transition-all hover:bg-white hover:text-black"
              style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        <div ref={trackRef} className="flex gap-4 md:gap-5 overflow-x-auto pb-2" style={{ scrollSnapType: "x mandatory" }}>
          {items.map((product) => (
            <div key={product.id} className="flex-shrink-0" style={{ width: "260px", scrollSnapAlign: "start" }}>
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
