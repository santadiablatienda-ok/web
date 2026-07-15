"use client"

import { products, type Product } from "@/lib/products"
import { ProductCard } from "@/components/product-card"

interface FeaturedSectionProps {
  onAddToCart: (product: Product, quantity: number, selectedSize?: string, isBackorder?: boolean, selectedColor?: string) => void
}

export function FeaturedSection({ onAddToCart }: FeaturedSectionProps) {
  const featured = products.filter((p) => p.featured).slice(0, 4)

  return (
    <section id="destacados" className="py-16 px-4 md:px-8" style={{ backgroundColor: "#fff" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#9E9E9E", letterSpacing: "0.2em" }}
            >
              Destacados
            </p>
            <h2
              className="text-3xl md:text-4xl font-black uppercase leading-none"
              style={{ color: "#000", letterSpacing: "-0.02em" }}
            >
              Nuevos ingresos
            </h2>
          </div>
          <a
            href="#catalogo"
            className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-50 whitespace-nowrap"
            style={{ color: "#000", letterSpacing: "0.1em" }}
          >
            Ver todo
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
