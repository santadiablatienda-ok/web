"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { type Product, type Category, finalPrice } from "@/lib/products"
import { getProducts, getCategories } from "@/lib/products-store"
import { ProductCard } from "@/components/product-card"

interface CatalogProps {
  onAddToCart: (product: Product, quantity: number, selectedSize?: string, isBackorder?: boolean, selectedColor?: string) => void
  search: string
  onSearchChange: (value: string) => void
}

type SortOption = "destacados" | "precio-asc" | "precio-desc" | "nombre-asc" | "nombre-desc"

const SORT_LABELS: Record<SortOption, string> = {
  destacados: "Destacados",
  "precio-asc": "Precio: menor a mayor",
  "precio-desc": "Precio: mayor a menor",
  "nombre-asc": "Nombre: A-Z",
  "nombre-desc": "Nombre: Z-A",
}

function sizeSortKey(size: string): number {
  const n = parseFloat(size)
  return Number.isNaN(n) ? Infinity : n
}

export function Catalog({ onAddToCart, search, onSearchChange }: CatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [selectedBrand, setSelectedBrand] = useState("todas")
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [sort, setSort] = useState<SortOption>("destacados")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {})
    getCategories().then(setCategories).catch(() => {})
  }, [])

  const brandsForCategory = Array.from(
    new Set(products.filter((p) => p.category === selectedCategory && p.brand).map((p) => p.brand!))
  ).sort()

  const baseFiltered = products.filter((p) => {
    const matchesCategory = selectedCategory === "todos" || p.category === selectedCategory
    const matchesBrand = selectedBrand === "todas" || p.brand === selectedBrand
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesBrand && matchesSearch
  })

  const sizeOptions = Array.from(new Set(baseFiltered.flatMap((p) => p.sizes ?? []))).sort(
    (a, b) => sizeSortKey(a) - sizeSortKey(b)
  )
  const colorOptions = Array.from(new Set(baseFiltered.flatMap((p) => p.colors ?? []))).sort((a, b) =>
    a.localeCompare(b)
  )

  const filtered = baseFiltered.filter((p) => {
    const matchesSize = selectedSizes.length === 0 || (p.sizes ?? []).some((s) => selectedSizes.includes(s))
    const matchesColor = selectedColors.length === 0 || (p.colors ?? []).some((c) => selectedColors.includes(c))
    return matchesSize && matchesColor
  })

  filtered.sort((a, b) => {
    switch (sort) {
      case "precio-asc":
        return finalPrice(a) - finalPrice(b)
      case "precio-desc":
        return finalPrice(b) - finalPrice(a)
      case "nombre-asc":
        return a.name.localeCompare(b.name)
      case "nombre-desc":
        return b.name.localeCompare(a.name)
      default:
        return 0
    }
  })

  function toggleSize(size: string) {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))
  }
  function toggleColor(color: string) {
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]))
  }

  const activeFilterCount = selectedSizes.length + selectedColors.length + (sort !== "destacados" ? 1 : 0)

  function clearAllFilters() {
    setSelectedSizes([])
    setSelectedColors([])
    setSort("destacados")
  }

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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm outline-none transition-all"
            style={{
              backgroundColor: "#fff",
              border: "1px solid #E0E0E0",
              color: "#000",
            }}
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id)
                setSelectedBrand("todas")
                setSelectedSizes([])
                setSelectedColors([])
              }}
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

        {/* Brand filter (solo si la categoria tiene marcas cargadas) */}
        {brandsForCategory.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            <button
              onClick={() => setSelectedBrand("todas")}
              className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all"
              style={{
                letterSpacing: "0.06em",
                backgroundColor: selectedBrand === "todas" ? "#000" : "transparent",
                color: selectedBrand === "todas" ? "#fff" : "#5C5C5C",
                border: `1px solid ${selectedBrand === "todas" ? "#000" : "#E0E0E0"}`,
              }}
            >
              Todas las marcas
            </button>
            {brandsForCategory.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all"
                style={{
                  letterSpacing: "0.06em",
                  backgroundColor: selectedBrand === brand ? "#000" : "transparent",
                  color: selectedBrand === brand ? "#fff" : "#5C5C5C",
                  border: `1px solid ${selectedBrand === brand ? "#000" : "#E0E0E0"}`,
                }}
              >
                {brand}
              </button>
            ))}
          </div>
        )}

        {/* Orden + filtros de talle y color */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-6" style={{ borderBottom: "1px solid #E0E0E0" }}>
          <div className="flex flex-col gap-4">
            {sizeOptions.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#5C5C5C", letterSpacing: "0.08em" }}>
                  Talle
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className="px-3 py-1 text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: selectedSizes.includes(size) ? "#000" : "#fff",
                        color: selectedSizes.includes(size) ? "#fff" : "#000",
                        border: `1px solid ${selectedSizes.includes(size) ? "#000" : "#E0E0E0"}`,
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colorOptions.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#5C5C5C", letterSpacing: "0.08em" }}>
                  Color
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className="px-3 py-1 text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: selectedColors.includes(color) ? "#000" : "#fff",
                        color: selectedColors.includes(color) ? "#fff" : "#000",
                        border: `1px solid ${selectedColors.includes(color) ? "#000" : "#E0E0E0"}`,
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider self-start"
                style={{ color: "#E63946", letterSpacing: "0.06em" }}
              >
                <X size={13} />
                Limpiar filtros ({activeFilterCount})
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#5C5C5C", letterSpacing: "0.08em" }}>
              Ordenar por
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="px-3 py-2 text-sm font-semibold outline-none"
              style={{ backgroundColor: "#fff", border: "1px solid #E0E0E0", color: "#000" }}
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
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
