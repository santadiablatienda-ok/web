"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { type Product, formatPrice, finalPrice, slugify } from "@/lib/products"
import { getProducts } from "@/lib/products-store"

const AUTO_ADVANCE_MS = 3800

// Medido a mano sobre BANNERS/BANNER DE SALE.webp (3840x608): el texto ocupa hasta ~28.7%
// del ancho, la foto arranca en ~67%, y el espacio en blanco del medio es ese rango.
const BLANK_LEFT_PCT = 28.7
const BLANK_WIDTH_PCT = 38.3
const BANNER_ASPECT = "3840 / 608"

export function SaleCarousel() {
  const [items, setItems] = useState<Product[]>([])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    getProducts()
      .then((products) => setItems(products.filter((p) => p.active !== false && p.onSale)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (paused || items.length <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), AUTO_ADVANCE_MS)
    return () => clearInterval(t)
  }, [paused, items.length])

  if (items.length === 0) return null

  return (
    <section id="sale" style={{ backgroundColor: "#0A0A0A" }}>
      {/* Desktop: el carrusel vive integrado en el espacio en blanco del banner */}
      <div
        className="relative w-full hidden md:block"
        style={{ aspectRatio: BANNER_ASPECT }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <img src="/banners/banner-sale.webp" alt="Sale — hasta agotar stock" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-y-0" style={{ left: `${BLANK_LEFT_PCT}%`, width: `${BLANK_WIDTH_PCT}%` }}>
          {items.map((product, i) => (
            <SaleSlide key={product.id} product={product} active={i === index} />
          ))}
          {items.length > 1 && <SaleDots count={items.length} index={index} onSelect={setIndex} onLight />}
        </div>
      </div>

      {/* Mobile: el banner queda muy bajo de alto para superponer texto legible,
          asi que el mismo carrusel se muestra debajo, a todo lo ancho */}
      <img src="/banners/banner-sale.webp" alt="Sale — hasta agotar stock" className="w-full h-auto block md:hidden" />
      <div className="relative md:hidden" style={{ height: "150px" }}>
        {items.map((product, i) => (
          <SaleSlide key={product.id} product={product} active={i === index} compact />
        ))}
        {items.length > 1 && <SaleDots count={items.length} index={index} onSelect={setIndex} />}
      </div>
    </section>
  )
}

function SaleSlide({ product, active, compact }: { product: Product; active: boolean; compact?: boolean }) {
  const priceNow = finalPrice(product)
  const hasDiscount = !!product.discountPercent && product.discountPercent > 0

  return (
    <Link
      href={`/producto/${slugify(product.name)}`}
      className="absolute inset-0 flex items-center gap-3 md:gap-4 px-4 md:px-0 transition-opacity duration-700"
      style={{ opacity: active ? 1 : 0, pointerEvents: active ? "auto" : "none", backgroundColor: compact ? "#0A0A0A" : "transparent" }}
    >
      <div className="flex-shrink-0 overflow-hidden" style={{ aspectRatio: "1", height: compact ? "70%" : "72%", backgroundColor: "#1a1a1a" }}>
        {product.image ? (
          <img src={product.image} alt={product.imageAlt || product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[9px] font-bold uppercase text-center px-1" style={{ color: "#666" }}>Foto pronto</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex flex-col gap-0.5 md:gap-1">
        <p className="text-xs md:text-sm lg:text-base font-black uppercase tracking-wide truncate" style={{ color: compact ? "#fff" : "#111" }}>
          {product.name}
        </p>
        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
          {priceNow > 0 && (
            <span className="text-sm md:text-lg lg:text-xl font-black" style={{ color: compact ? "#fff" : "#111" }}>
              {formatPrice(priceNow)}
            </span>
          )}
          {hasDiscount && (
            <>
              <span className="text-xs md:text-sm line-through" style={{ color: compact ? "#777" : "#9E9E9E" }}>{formatPrice(product.price)}</span>
              <span className="text-[10px] md:text-xs font-bold uppercase px-1.5 py-0.5" style={{ backgroundColor: "#E63946", color: "#fff" }}>
                -{product.discountPercent}%
              </span>
            </>
          )}
        </div>
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest hidden md:inline" style={{ color: "#E63946", letterSpacing: "0.1em" }}>
          Ver oferta →
        </span>
      </div>
    </Link>
  )
}

function SaleDots({ count, index, onSelect, onLight }: { count: number; index: number; onSelect: (i: number) => void; onLight?: boolean }) {
  const activeColor = onLight ? "#111" : "#fff"
  const inactiveColor = onLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.35)"
  return (
    <div className="absolute bottom-1.5 md:bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={(e) => { e.preventDefault(); onSelect(i) }}
          aria-label={`Ver oferta ${i + 1}`}
          className="h-1 transition-all"
          style={{ width: i === index ? "14px" : "5px", backgroundColor: i === index ? activeColor : inactiveColor }}
        />
      ))}
    </div>
  )
}
