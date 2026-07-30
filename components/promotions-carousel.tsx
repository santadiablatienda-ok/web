"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Flame } from "lucide-react"
import { type Product } from "@/lib/products"
import { getProducts } from "@/lib/products-store"
import { ProductCard } from "@/components/product-card"

interface PromotionsCarouselProps {
  onAddToCart: (product: Product, quantity: number, selectedSize?: string, isBackorder?: boolean, selectedColor?: string) => void
}

export function PromotionsCarousel({ onAddToCart }: PromotionsCarouselProps) {
  const [promos, setPromos] = useState<Product[]>([])
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getProducts()
      .then((products) => setPromos(products.filter((p) => p.active !== false && !!p.discountPercent && p.discountPercent > 0)))
      .catch(() => {})
  }, [])

  if (promos.length === 0) return null

  function scrollByCards(dir: 1 | -1) {
    trackRef.current?.scrollBy({ left: dir * trackRef.current.clientWidth * 0.9, behavior: "smooth" })
  }

  return (
    <section id="promociones" className="py-16 px-4 md:px-8" style={{ backgroundColor: "#0A0A0A" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#E63946", letterSpacing: "0.2em" }}
            >
              <Flame size={14} /> Ofertas por tiempo limitado
            </p>
            <h2 className="text-3xl md:text-4xl font-black uppercase leading-none" style={{ color: "#fff", letterSpacing: "-0.02em" }}>
              Promociones
            </h2>
          </div>
          {promos.length > 1 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => scrollByCards(-1)}
                aria-label="Promocion anterior"
                className="flex items-center justify-center w-9 h-9 border transition-all hover:bg-white hover:text-black"
                style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scrollByCards(1)}
                aria-label="Siguiente promocion"
                className="flex items-center justify-center w-9 h-9 border transition-all hover:bg-white hover:text-black"
                style={{ borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div ref={trackRef} className="flex gap-4 md:gap-5 overflow-x-auto pb-2" style={{ scrollSnapType: "x mandatory" }}>
          {promos.map((product) => (
            <div key={product.id} className="flex-shrink-0" style={{ width: "260px", scrollSnapAlign: "start" }}>
              <ProductCard product={product} onAddToCart={onAddToCart} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
