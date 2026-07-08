"use client"

import { useState } from "react"
import { ShoppingCart, CheckCircle2, MessageCircle } from "lucide-react"
import { type Product, formatPrice } from "@/lib/products"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number, selectedSize?: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  const hasSizes = product.sizes && product.sizes.length > 0 && !product.isEncargo
  const isEncargo = product.isEncargo
  const outOfStock = product.stock === 0

  function handleAdd() {
    if (hasSizes && !selectedSize) {
      setSizeError(true)
      setTimeout(() => setSizeError(false), 2000)
      return
    }
    onAddToCart(product, 1, selectedSize || undefined)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setSelectedSize("")
    }, 1800)
  }

  function handleEncargo() {
    const msg = `Hola, quiero consultar por el modelo: ${product.name} (${formatPrice(product.price)}). Podrian darme mas informacion?`
    window.open(`https://wa.me/5493456623935?text=${encodeURIComponent(msg)}`, "_blank")
  }

  return (
    <article className="group flex flex-col bg-white overflow-hidden" style={{ border: "1px solid #EBEBEB" }}>
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4", backgroundColor: "#F5F5F5" }}>
        <img
          src={product.image}
          alt={product.imageAlt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.badge && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: product.badge === "Importado" ? "#E63946" : "#000",
              color: "#fff",
              letterSpacing: "0.06em",
            }}
          >
            {product.badge}
          </span>
        )}
        {outOfStock && !isEncargo && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          >
            <span
              className="text-xs font-bold uppercase tracking-widest px-4 py-2 border"
              style={{ borderColor: "#fff", color: "#fff", letterSpacing: "0.15em" }}
            >
              Sin stock
            </span>
          </div>
        )}
        {isEncargo && (
          <div className="absolute top-3 right-3">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-1"
              style={{ backgroundColor: "#E63946", color: "#fff", letterSpacing: "0.06em" }}
            >
              Encargo
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#9E9E9E", letterSpacing: "0.1em" }}>
            {product.category.replace(/-/g, " ")}
          </p>
          <h3 className="text-sm font-bold leading-snug" style={{ color: "#000" }}>
            {product.name}
          </h3>
          <p className="text-xs leading-relaxed mt-1" style={{ color: "#9E9E9E" }}>
            {product.description}
          </p>
        </div>

        <p className="text-lg font-black" style={{ color: "#000" }}>
          {formatPrice(product.price)}
        </p>

        {/* Tallas */}
        {hasSizes && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#5C5C5C", letterSpacing: "0.08em" }}>
              Talle
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes!.map((size) => (
                <button
                  key={size}
                  onClick={() => { setSelectedSize(size); setSizeError(false) }}
                  className="px-2.5 py-1 text-xs font-semibold border transition-all"
                  style={{
                    borderColor: selectedSize === size ? "#000" : sizeError ? "#E63946" : "#E0E0E0",
                    backgroundColor: selectedSize === size ? "#000" : "transparent",
                    color: selectedSize === size ? "#fff" : "#000",
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className="text-xs mt-1.5 font-semibold" style={{ color: "#E63946" }}>
                Selecciona un talle antes de agregar
              </p>
            )}
          </div>
        )}

        {/* CTA */}
        {isEncargo ? (
          <button
            onClick={handleEncargo}
            className="flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "#000",
              color: "#fff",
              letterSpacing: "0.08em",
            }}
          >
            <MessageCircle size={14} />
            Consultar por WhatsApp
          </button>
        ) : (
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: added ? "#111" : "#000",
              color: "#fff",
              letterSpacing: "0.08em",
            }}
          >
            {added ? (
              <><CheckCircle2 size={14} /> Agregado</>
            ) : (
              <><ShoppingCart size={14} /> Comprar</>
            )}
          </button>
        )}
      </div>
    </article>
  )
}
