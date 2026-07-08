import { products as defaultProducts, categories as defaultCategories, type Product, type Category } from "@/lib/products"

const PRODUCTS_KEY = "sd_products"
const CATEGORIES_KEY = "sd_categories"

// ─── Productos ────────────────────────────────────────────────────────────────

export function getProducts(): Product[] {
  if (typeof window === "undefined") return defaultProducts
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY)
    if (!raw) return defaultProducts
    const saved: Product[] = JSON.parse(raw)
    const savedMap = new Map(saved.map((p) => [p.id, p]))
    return defaultProducts
      .map((p) => savedMap.get(p.id) ?? p)
      .concat(saved.filter((p) => !defaultProducts.find((d) => d.id === p.id)))
  } catch {
    return defaultProducts
  }
}

export function saveProducts(products: Product[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
}

export function resetProducts(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(PRODUCTS_KEY)
}

// ─── Categorías ───────────────────────────────────────────────────────────────

export function getCategories(): Category[] {
  if (typeof window === "undefined") return defaultCategories
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY)
    if (!raw) return defaultCategories
    return JSON.parse(raw) as Category[]
  } catch {
    return defaultCategories
  }
}

export function saveCategories(cats: Category[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats))
}

export function resetCategories(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(CATEGORIES_KEY)
}
