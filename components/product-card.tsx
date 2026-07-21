"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, CheckCircle2, PackagePlus, ChevronLeft, ChevronRight, X } from "lucide-react"
import { type Product, formatPrice, finalPrice } from "@/lib/products"
import { DEPOSIT_PERCENT } from "@/hooks/use-cart"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product, quantity: number, selectedSize?: string, isBackorder?: boolean, selectedColor?: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const [colorError, setColorError] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const photos = [product.image, ...(product.gallery ?? [])].filter((src, i, arr) => src && arr.indexOf(src) === i)
  const hasGallery = photos.length > 1

  // precarga el resto de las fotos apenas se abre la galeria para que el paso entre fotos sea instantaneo
  useEffect(() => {
    if (!galleryOpen) return
    photos.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galleryOpen])

  function openGallery() {
    setGalleryIndex(0)
    setGalleryOpen(true)
  }
  function nextPhoto() {
    setGalleryIndex((i) => (i + 1) % photos.length)
  }
  function prevPhoto() {
    setGalleryIndex((i) => (i - 1 + photos.length) % photos.length)
  }

  const isInactive = product.active === false
  const hasSizes = product.sizes && product.sizes.length > 0
  const hasColors = product.colors && product.colors.length > 1
  const isEncargo = product.isEncargo
  const usesSizeStock = hasSizes && !!product.sizeStock && Object.keys(product.sizeStock).length > 0
  const hasDiscount = !!product.discountPercent && product.discountPercent > 0
  const priceNow = finalPrice(product)

  function stockForSize(size: string): number {
    if (usesSizeStock) return product.sizeStock![size] ?? 0
    return product.stock ?? 0
  }

  const totalStock = usesSizeStock
    ? Object.values(product.sizeStock!).reduce((a, b) => a + b, 0)
    : (product.stock ?? 0)

  const outOfStock = !isEncargo && totalStock === 0

  // si el producto trackea stock por talle, el estado de "sin stock" depende del talle elegido
  const needsBackorder = isEncargo || (hasSizes && selectedSize ? stockForSize(selectedSize) <= 0 : outOfStock)

  function validateSelection(): boolean {
    let ok = true
    if (hasSizes && !selectedSize) {
      setSizeError(true)
      setTimeout(() => setSizeError(false), 2000)
      ok = false
    }
    if (hasColors && !selectedColor) {
      setColorError(true)
      setTimeout(() => setColorError(false), 2000)
      ok = false
    }
    return ok
  }

  // si hay un solo color no hace falta elegirlo: se manda solo igual
  const singleColor = product.colors && product.colors.length === 1 ? product.colors[0] : undefined
  const effectiveColor = selectedColor || singleColor

  function handleAdd() {
    if (!validateSelection()) return
    onAddToCart(product, 1, selectedSize || undefined, needsBackorder, effectiveColor || undefined)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setSelectedSize("")
      setSelectedColor("")
    }, 1800)
  }

  return (
    <article className="group flex flex-col bg-white overflow-hidden" style={{ border: "1px solid #EBEBEB" }}>
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "3/4", backgroundColor: "#F5F5F5", cursor: hasGallery ? "zoom-in" : undefined }}
        onClick={hasGallery ? openGallery : undefined}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.imageAlt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#B0B0B0", letterSpacing: "0.08em" }}>
              Foto proximamente
            </span>
          </div>
        )}
        {hasGallery && (
          <span
            className="absolute bottom-3 right-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", letterSpacing: "0.06em" }}
          >
            +{photos.length - 1} fotos
          </span>
        )}
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
        {isInactive ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          >
            <span
              className="text-xs font-bold uppercase tracking-widest px-4 py-2 border"
              style={{ borderColor: "#fff", color: "#fff", letterSpacing: "0.15em" }}
            >
              Agotado
            </span>
          </div>
        ) : outOfStock && !isEncargo && (
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
        {!isInactive && isEncargo && (
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

        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-lg font-black" style={{ color: "#000" }}>
            {formatPrice(priceNow)}
          </p>
          {hasDiscount && (
            <>
              <p className="text-sm line-through" style={{ color: "#9E9E9E" }}>
                {formatPrice(product.price)}
              </p>
              <span
                className="text-xs font-bold uppercase tracking-wider px-2 py-0.5"
                style={{ backgroundColor: "#E63946", color: "#fff", letterSpacing: "0.05em" }}
              >
                -{product.discountPercent}%
              </span>
            </>
          )}
        </div>

        {/* Colores disponibles */}
        {!isInactive && product.colors && product.colors.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#5C5C5C", letterSpacing: "0.08em" }}>
              Color
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.colors.map((color) =>
                hasColors ? (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); setColorError(false) }}
                    className="px-2.5 py-1 text-xs font-semibold border transition-all"
                    style={{
                      borderColor: selectedColor === color ? "#000" : colorError ? "#E63946" : "#E0E0E0",
                      backgroundColor: selectedColor === color ? "#000" : "transparent",
                      color: selectedColor === color ? "#fff" : "#000",
                    }}
                  >
                    {color}
                  </button>
                ) : (
                  <span
                    key={color}
                    className="px-2.5 py-1 text-xs font-semibold border"
                    style={{ borderColor: "#E0E0E0", color: "#5C5C5C" }}
                  >
                    {color}
                  </span>
                )
              )}
            </div>
            {colorError && (
              <p className="text-xs mt-1.5 font-semibold" style={{ color: "#E63946" }}>
                Selecciona un color antes de agregar
              </p>
            )}
          </div>
        )}

        {/* Tallas */}
        {!isInactive && hasSizes && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#5C5C5C", letterSpacing: "0.08em" }}>
              Talle
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes!.map((size) => {
                const sizeOut = usesSizeStock && stockForSize(size) <= 0
                return (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(false) }}
                    className="px-2.5 py-1 text-xs font-semibold border transition-all"
                    style={{
                      borderColor: selectedSize === size ? "#000" : sizeError ? "#E63946" : "#E0E0E0",
                      backgroundColor: selectedSize === size ? "#000" : "transparent",
                      color: selectedSize === size ? "#fff" : sizeOut ? "#B0B0B0" : "#000",
                    }}
                  >
                    {size}{sizeOut ? " ·" : ""}
                  </button>
                )
              })}
            </div>
            {sizeError && (
              <p className="text-xs mt-1.5 font-semibold" style={{ color: "#E63946" }}>
                Selecciona un talle antes de agregar
              </p>
            )}
            {usesSizeStock && selectedSize && stockForSize(selectedSize) <= 0 && (
              <p className="text-xs mt-1.5 font-semibold" style={{ color: "#E63946" }}>
                Talle {selectedSize} sin stock — se agrega como pedido por encargo (seña {DEPOSIT_PERCENT}%)
              </p>
            )}
          </div>
        )}

        {/* CTA */}
        {isInactive ? (
          <button
            disabled
            className="flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest cursor-not-allowed"
            style={{ backgroundColor: "#E0E0E0", color: "#9E9E9E", letterSpacing: "0.08em" }}
          >
            Agotado
          </button>
        ) : needsBackorder ? (
          <button
            onClick={handleAdd}
            className="flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{ backgroundColor: added ? "#111" : "#000", color: "#fff", letterSpacing: "0.08em" }}
          >
            {added ? (
              <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Agregado</span>
            ) : (
              <>
                <span className="flex items-center gap-2"><PackagePlus size={14} /> Pedir por encargo</span>
                <span className="text-[10px] font-semibold normal-case tracking-normal opacity-70">
                  Seña del {DEPOSIT_PERCENT}% · {formatPrice(Math.round(priceNow * DEPOSIT_PERCENT / 100))}
                </span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-all"
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

      {galleryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          onClick={() => setGalleryOpen(false)}
        >
          <button
            onClick={() => setGalleryOpen(false)}
            aria-label="Cerrar"
            className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 border transition-all hover:bg-white hover:text-black"
            style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}
          >
            <X size={18} />
          </button>

          <img
            src={photos[galleryIndex]}
            alt={product.imageAlt || product.name}
            className="max-w-[90vw] max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); prevPhoto() }}
            aria-label="Foto anterior"
            className="absolute left-4 md:left-8 flex items-center justify-center w-10 h-10 border transition-all hover:bg-white hover:text-black"
            style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextPhoto() }}
            aria-label="Foto siguiente"
            className="absolute right-4 md:right-8 flex items-center justify-center w-10 h-10 border transition-all hover:bg-white hover:text-black"
            style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-8 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {photos.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setGalleryIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
                className="h-1.5 transition-all"
                style={{
                  width: i === galleryIndex ? "22px" : "8px",
                  backgroundColor: i === galleryIndex ? "#fff" : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
