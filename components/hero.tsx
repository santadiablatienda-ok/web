"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getProducts } from "@/lib/products-store"
import { type Product } from "@/lib/products"

const AUTO_ADVANCE_MS = 4800

export function Hero() {
  const [slides, setSlides] = useState<Product[]>([])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    getProducts().then((products) => {
      const withRealPhotos = products.filter((p) => p.image && p.image.includes("supabase.co"))
      const featured = products.filter((p) => p.featured && p.image)
      const picks = withRealPhotos.length > 0 ? withRealPhotos : featured.length > 0 ? featured : products.slice(0, 5)
      setSlides(picks.slice(0, 8))
    }).catch(() => {})
  }, [])

  const goTo = useCallback((i: number) => {
    setIndex((prev) => {
      const len = slides.length || 1
      return (i + len) % len
    })
  }, [slides.length])

  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  useEffect(() => {
    if (paused || slides.length <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_ADVANCE_MS)
    return () => clearInterval(t)
  }, [paused, slides.length])

  const current = slides[index]

  const fallbackImage = "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1400&q=80"

  const bgImage = useMemo(() => current?.image || fallbackImage, [current])

  return (
    <section
      id="inicio"
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "#000", minHeight: "90vh" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background image crossfade */}
      <div className="absolute inset-0">
        {slides.length > 0 ? (
          slides.map((p, i) => (
            <img
              key={p.id}
              src={p.image || fallbackImage}
              alt={p.imageAlt || p.name}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out"
              style={{ opacity: i === index ? 0.45 : 0 }}
            />
          ))
        ) : (
          <img src={fallbackImage} alt="Calzado de moda Santa Diabla" className="w-full h-full object-cover" style={{ opacity: 0.45 }} />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-start justify-end h-full px-6 md:px-16 py-16 md:py-24" style={{ minHeight: "90vh" }}>
        <div className="max-w-3xl">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: "#9E9E9E", letterSpacing: "0.2em" }}
          >
            Envios a todo el pais
          </p>

          <h1
            className="font-black uppercase leading-none mb-6"
            style={{
              color: "#fff",
              fontSize: "clamp(3.5rem, 10vw, 8rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.92,
            }}
          >
            Santa<br />Diabla.
          </h1>

          <p
            className="text-base md:text-lg font-medium mb-6 max-w-md leading-relaxed"
            style={{ color: "#9E9E9E" }}
          >
            Calzado con caracter. Botas, borcegos, zapatillas e importados para la mujer que sabe lo que quiere.
          </p>

          {/* Nombre del modelo actual */}
          {current && (
            <p
              key={current.id}
              className="text-sm font-bold uppercase tracking-wider mb-8 transition-opacity duration-500"
              style={{ color: "#fff" }}
            >
              Ahora viendo &mdash; {current.name}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#catalogo"
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{
                backgroundColor: "#fff",
                color: "#000",
                letterSpacing: "0.1em",
              }}
            >
              Ver coleccion
            </a>
            <a
              href="#encargo"
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold uppercase tracking-widest border transition-opacity hover:bg-white hover:text-black"
              style={{
                borderColor: "#fff",
                color: "#fff",
                letterSpacing: "0.1em",
              }}
            >
              Pedir por encargo
            </a>
          </div>
        </div>

        {/* Controles del carrusel */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 right-6 md:right-16 flex items-center gap-4">
            <button
              onClick={prev}
              aria-label="Modelo anterior"
              className="flex items-center justify-center w-9 h-9 border transition-all hover:bg-white hover:text-black"
              style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              {slides.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => goTo(i)}
                  aria-label={`Ver ${p.name}`}
                  className="h-1.5 transition-all"
                  style={{
                    width: i === index ? "22px" : "8px",
                    backgroundColor: i === index ? "#fff" : "rgba(255,255,255,0.35)",
                  }}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Siguiente modelo"
              className="flex items-center justify-center w-9 h-9 border transition-all hover:bg-white hover:text-black"
              style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
