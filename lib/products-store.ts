import { products as defaultProducts, categories as defaultCategories, type Product, type Category } from "@/lib/products"

const PRODUCTS_KEY = "sd_products"
const CATEGORIES_KEY = "sd_categories"
const DELETED_PRODUCTS_KEY = "sd_deleted_product_ids"

// ─── Productos ────────────────────────────────────────────────────────────────

function getDeletedProductIds(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

export function getProducts(): Product[] {
  if (typeof window === "undefined") return defaultProducts
  const deleted = getDeletedProductIds()
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY)
    if (!raw) return defaultProducts.filter((p) => !deleted.has(p.id))
    const saved: Product[] = JSON.parse(raw)
    const savedMap = new Map(saved.map((p) => [p.id, p]))
    return defaultProducts
      .filter((p) => !deleted.has(p.id))
      .map((p) => savedMap.get(p.id) ?? p)
      .concat(saved.filter((p) => !defaultProducts.find((d) => d.id === p.id) && !deleted.has(p.id)))
  } catch {
    return defaultProducts.filter((p) => !deleted.has(p.id))
  }
}

export function saveProducts(products: Product[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
}

export function deleteProduct(id: string): void {
  if (typeof window === "undefined") return
  const deleted = getDeletedProductIds()
  deleted.add(id)
  localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify([...deleted]))
}

export function resetProducts(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(PRODUCTS_KEY)
  localStorage.removeItem(DELETED_PRODUCTS_KEY)
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
