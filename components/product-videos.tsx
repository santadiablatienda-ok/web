"use client"

import { useEffect, useState } from "react"
import { type Product } from "@/lib/products"
import { getProducts } from "@/lib/products-store"

export function ProductVideos() {
  const [videos, setVideos] = useState<Product[]>([])

  useEffect(() => {
    getProducts().then((products) => setVideos(products.filter((p) => p.video))).catch(() => {})
  }, [])

  if (videos.length === 0) return null

  return (
    <section className="py-16 px-4 md:px-8" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="max-w-6xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "#9E9E9E", letterSpacing: "0.2em" }}
        >
          Mira mas de cerca
        </p>
        <h2
          className="text-3xl md:text-4xl font-black uppercase leading-none mb-8"
          style={{ color: "#000", letterSpacing: "-0.02em" }}
        >
          Videos de los productos
        </h2>

        <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollSnapType: "x mandatory" }}>
          {videos.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-56 md:w-64 bg-white"
              style={{ border: "1px solid #EBEBEB", scrollSnapAlign: "start" }}
            >
              <video
                src={product.video}
                poster={product.image || undefined}
                controls
                playsInline
                preload="metadata"
                className="w-full block"
                style={{ aspectRatio: "9/16", backgroundColor: "#000", objectFit: "cover" }}
              />
              <a href="#catalogo" className="block px-3 py-2 transition-opacity hover:opacity-60">
                <p className="text-xs font-bold uppercase tracking-wide truncate" style={{ color: "#000" }}>
                  {product.name}
                </p>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
