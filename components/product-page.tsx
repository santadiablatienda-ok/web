"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, X, ShoppingCart, CheckCircle2, PackagePlus, Zap } from "lucide-react"
import { type Product, formatPrice, finalPrice, slugify } from "@/lib/products"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { CartDrawer } from "@/components/cart-drawer"
import { useCart } from "@/hooks/use-cart"

interface ProductPageProps {
  product: Product
}

export function ProductPage({ product }: ProductPageProps) {
  const router = useRouter()
  const { items, totalItems, totalPrice, depositTotal, addToCart, removeFromCart, updateQuantity, clearCart } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [added, setAdded] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const [colorError, setColorError] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const photos = [product.image, ...(product.gallery ?? [])].filter((src, i, arr) => src && arr.indexOf(src) === i)

  useEffect(() => {
    photos.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleHeaderSearchSubmit() {
    router.push("/#catalogo")
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

  const needsBackorder = isInactive || (
    usesSizeStock && selectedSize ? stockForSize(selectedSize) <= 0 : (isEncargo || outOfStock)
  )

  const singleColor = product.colors && product.colors.length === 1 ? product.colors[0] : undefined
  const effectiveColor = selectedColor || singleColor

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

  function handleAddToCart() {
    if (!validateSelection()) return
    addToCart(product, 1, selectedSize || undefined, needsBackorder, effectiveColor || undefined)
    setCartOpen(true)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  function handleBuyNow() {
    if (!validateSelection()) return
    const params = new URLSearchParams()
    if (selectedSize) params.set("talle", selectedSize)
    if (effectiveColor) params.set("color", effectiveColor)
    router.push(`/producto/${slugify(product.name)}/pagar?${params.toString()}`)
  }

  function nextPhoto() {
    setPhotoIndex((i) => (i + 1) % photos.length)
  }
  function prevPhoto() {
    setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={totalItems} onCartOpen={() => setCartOpen(true)} onSearchSubmit={handleHeaderSearchSubmit} />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-60" style={{ color: "#5C5C5C", letterSpacing: "0.08em" }}>
            <ChevronLeft size={14} /> Volver a la tienda
          </Link>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Galeria */}
          <div className="flex flex-col gap-3">
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: "3/4", backgroundColor: "#F5F5F5", cursor: photos.length ? "zoom-in" : undefined }}
              onClick={() => photos.length && setLightboxOpen(true)}
            >
              {photos[photoIndex] ? (
                <img src={photos[photoIndex]} alt={product.imageAlt} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#B0B0B0", letterSpacing: "0.08em" }}>
                    Foto proximamente
                  </span>
                </div>
              )}
              {product.badge && (
                <span
                  className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: product.badge === "Importado" ? "#E63946" : "#000", color: "#fff", letterSpacing: "0.06em" }}
                >
                  {product.badge}
                </span>
              )}
              {!isInactive && outOfStock && !isEncargo && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
                  <span className="text-xs font-bold uppercase tracking-widest px-4 py-2 border" style={{ borderColor: "#fff", color: "#fff", letterSpacing: "0.15em" }}>
                    Sin stock
                  </span>
                </div>
              )}
              {(isInactive || isEncargo) && (
                <div className="absolute top-3 right-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1" style={{ backgroundColor: "#E63946", color: "#fff", letterSpacing: "0.06em" }}>
                    Por encargo
                  </span>
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {photos.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setPhotoIndex(i)}
                    className="flex-shrink-0 overflow-hidden"
                    style={{ width: 64, height: 64, border: i === photoIndex ? "2px solid #000" : "2px solid #E0E0E0" }}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#9E9E9E", letterSpacing: "0.1em" }}>
                {product.category.replace(/-/g, " ")}
              </p>
              <h1 className="text-2xl md:text-3xl font-black leading-tight" style={{ color: "#000" }}>
                {product.name}
              </h1>
              {product.description && (
                <p className="text-sm leading-relaxed mt-3" style={{ color: "#5C5C5C" }}>
                  {product.description}
                </p>
              )}
              {product.specs && product.specs.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1">
                  {product.specs.map((spec) => (
                    <li key={spec} className="text-xs leading-relaxed pl-3 relative" style={{ color: "#5C5C5C" }}>
                      <span className="absolute left-0" style={{ color: "#B0B0B0" }}>·</span>
                      {spec}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap py-2 border-y" style={{ borderColor: "#EBEBEB" }}>
              {priceNow > 0 ? (
                <p className="text-3xl font-black" style={{ color: "#000" }}>{formatPrice(priceNow)}</p>
              ) : (
                <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#9E9E9E" }}>Precio a confirmar</p>
              )}
              {hasDiscount && (
                <>
                  <p className="text-base line-through" style={{ color: "#9E9E9E" }}>{formatPrice(product.price)}</p>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5" style={{ backgroundColor: "#E63946", color: "#fff", letterSpacing: "0.05em" }}>
                    -{product.discountPercent}%
                  </span>
                </>
              )}
            </div>

            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#5C5C5C", letterSpacing: "0.08em" }}>Color</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) =>
                    hasColors ? (
                      <button
                        key={color}
                        onClick={() => { setSelectedColor(color); setColorError(false) }}
                        className="px-3 py-1.5 text-xs font-semibold border transition-all"
                        style={{
                          borderColor: selectedColor === color ? "#000" : colorError ? "#E63946" : "#E0E0E0",
                          backgroundColor: selectedColor === color ? "#000" : "transparent",
                          color: selectedColor === color ? "#fff" : "#000",
                        }}
                      >
                        {color}
                      </button>
                    ) : (
                      <span key={color} className="px-3 py-1.5 text-xs font-semibold border" style={{ borderColor: "#000", backgroundColor: "#000", color: "#fff" }}>
                        {color}
                      </span>
                    )
                  )}
                </div>
                {colorError && <p className="text-xs mt-1.5 font-semibold" style={{ color: "#E63946" }}>Selecciona un color antes de continuar</p>}
              </div>
            )}

            {hasSizes && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#5C5C5C", letterSpacing: "0.08em" }}>Talle</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes!.map((size) => {
                    const sizeOut = usesSizeStock && stockForSize(size) <= 0
                    return (
                      <button
                        key={size}
                        onClick={() => { setSelectedSize(size); setSizeError(false) }}
                        className="px-3 py-1.5 text-xs font-semibold border transition-all"
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
                {sizeError && <p className="text-xs mt-1.5 font-semibold" style={{ color: "#E63946" }}>Selecciona un talle antes de continuar</p>}
                {usesSizeStock && selectedSize && stockForSize(selectedSize) <= 0 && (
                  <p className="text-xs mt-1.5 font-semibold" style={{ color: "#E63946" }}>Talle {selectedSize} sin stock — se pide por encargo</p>
                )}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-2 pt-2">
              {needsBackorder ? (
                <button
                  onClick={handleAddToCart}
                  className="flex flex-col items-center justify-center gap-0.5 py-4 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#000", color: "#fff", letterSpacing: "0.08em" }}
                >
                  {added ? (
                    <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Agregado</span>
                  ) : (
                    <>
                      <span className="flex items-center gap-2"><PackagePlus size={14} /> Pedir por encargo</span>
                      <span className="text-[10px] font-semibold normal-case tracking-normal opacity-70">
                        Sin pago por adelantado · te contactamos por WhatsApp
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="flex items-center justify-center gap-2 py-4 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-85"
                    style={{ backgroundColor: "#009EE3", color: "#fff", letterSpacing: "0.08em" }}
                  >
                    <Zap size={16} /> Comprar ahora
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-widest border-2 transition-all hover:bg-black hover:text-white"
                    style={{ borderColor: "#000", color: added ? "#fff" : "#000", backgroundColor: added ? "#000" : "transparent", letterSpacing: "0.08em" }}
                  >
                    {added ? <><CheckCircle2 size={14} /> Agregado</> : <><ShoppingCart size={14} /> Agregar al carrito</>}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        totalPrice={totalPrice}
        depositTotal={depositTotal}
        onUpdateQuantity={(id, qty, size, isBackorder, color) => updateQuantity(id, qty, size, isBackorder, color)}
        onRemove={(id, size, isBackorder, color) => removeFromCart(id, size, isBackorder, color)}
        onClear={clearCart}
      />

      <WhatsAppButton />

      {lightboxOpen && photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar"
            className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 border transition-all hover:bg-white hover:text-black"
            style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}
          >
            <X size={18} />
          </button>
          <img src={photos[photoIndex]} alt={product.imageAlt || product.name} className="max-w-[90vw] max-h-[80vh] object-contain" onClick={(e) => e.stopPropagation()} />
          {photos.length > 1 && (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  )
}
