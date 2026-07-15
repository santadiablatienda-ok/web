"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { type Product, type Category } from "@/lib/products"
import { getProducts, getCategories } from "@/lib/products-store"
import { ProductCard } from "@/components/product-card"

interface CatalogProps {
  onAddToCart: (product: Product, quantity: number, selectedSize?: string, isBackorder?: boolean, selectedColor?: string) => void
}

export function Catalog({ onAddToCart }: CatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {})
    getCategories().then(setCategories).catch(() => {})
  }, [])

  const filtered = products.filter((p) => {
    const matchesCategory = selectedCategory === "todos" || p.category === selectedCategory
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <section id="catalogo" className="py-16 px-4 md:px-8" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#9E9E9E", letterSpacing: "0.2em" }}
          >
            Tienda
          </p>
          <h2
            className="text-3xl md:text-4xl font-black uppercase leading-none"
            style={{ color: "#000", letterSpacing: "-0.02em" }}
          >
            Catalogo completo
          </h2>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-8">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#9E9E9E" }} />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm outline-none transition-all"
            style={{
              backgroundColor: "#fff",
              border: "1px solid #E0E0E0",
              color: "#000",
            }}
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all"
              style={{
                letterSpacing: "0.1em",
                backgroundColor: selectedCategory === cat.id ? "#000" : "#fff",
                color: selectedCategory === cat.id ? "#fff" : "#000",
                border: `1px solid ${selectedCategory === cat.id ? "#000" : "#E0E0E0"}`,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-semibold" style={{ color: "#9E9E9E" }}>
              No se encontraron productos
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
