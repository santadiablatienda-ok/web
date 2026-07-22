import { supabase } from "@/lib/supabase"
import { products as seedProducts, categories as seedCategories, type Product, type Category } from "@/lib/products"

// ─── Productos ────────────────────────────────────────────────────────────────
// Fuente de verdad: tabla `products` en Supabase (compartida por todos los
// navegadores/dispositivos). Lectura pública, escritura solo admin autenticado (RLS).

interface ProductRow {
  id: string
  name: string
  description: string
  price: number
  cost: number
  category: string
  brand: string
  image: string
  image_alt: string
  gallery: string[]
  video: string
  badge: string | null
  featured: boolean
  sizes: string[]
  stock: number | null
  size_stock: Record<string, number>
  is_encargo: boolean
  colors: string[]
  discount_percent: number | null
  season: string | null
  active: boolean
}

function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: r.price,
    cost: r.cost ?? undefined,
    category: r.category,
    brand: r.brand || undefined,
    image: r.image,
    imageAlt: r.image_alt,
    gallery: r.gallery?.length ? r.gallery : undefined,
    video: r.video || undefined,
    badge: r.badge ?? undefined,
    featured: r.featured,
    sizes: r.sizes?.length ? r.sizes : undefined,
    stock: r.stock ?? undefined,
    sizeStock: r.size_stock && Object.keys(r.size_stock).length ? r.size_stock : undefined,
    isEncargo: r.is_encargo,
    colors: r.colors?.length ? r.colors : undefined,
    discountPercent: r.discount_percent ?? undefined,
    season: r.season ?? undefined,
    active: r.active,
  }
}

function productToRow(p: Product): ProductRow {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    price: p.price ?? 0,
    cost: p.cost ?? 0,
    category: p.category,
    brand: p.brand ?? "",
    image: p.image ?? "",
    image_alt: p.imageAlt ?? "",
    gallery: p.gallery ?? [],
    video: p.video ?? "",
    badge: p.badge ?? null,
    featured: !!p.featured,
    sizes: p.sizes ?? [],
    stock: p.stock ?? null,
    size_stock: p.sizeStock ?? {},
    is_encargo: !!p.isEncargo,
    colors: p.colors ?? [],
    discount_percent: p.discountPercent ?? null,
    season: p.season ?? null,
    active: p.active !== false,
  }
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: true })
  if (error) throw error
  return (data as ProductRow[]).map(rowToProduct)
}

export async function saveProducts(products: Product[]): Promise<void> {
  if (products.length === 0) return
  const { error } = await supabase.from("products").upsert(products.map(productToRow), { onConflict: "id" })
  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw error
}

export async function resetProducts(): Promise<void> {
  const { error: delError } = await supabase.from("products").delete().neq("id", "")
  if (delError) throw delError
  await saveProducts(seedProducts)
}

// ─── Categorías ───────────────────────────────────────────────────────────────

interface CategoryRow {
  id: string
  name: string
  icon: string
  color: string
  sort_order: number
}

function rowToCategory(r: CategoryRow): Category {
  return { id: r.id, name: r.name, icon: r.icon, color: r.color }
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order", { ascending: true })
  if (error) throw error
  return (data as CategoryRow[]).map(rowToCategory)
}

export async function saveCategories(cats: Category[]): Promise<void> {
  if (cats.length === 0) return
  const rows: CategoryRow[] = cats.map((cat, i) => ({ id: cat.id, name: cat.name, icon: cat.icon, color: cat.color, sort_order: i }))
  const { error } = await supabase.from("categories").upsert(rows, { onConflict: "id" })
  if (error) throw error
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id)
  if (error) throw error
}

export async function resetCategories(): Promise<void> {
  const { error: delError } = await supabase.from("categories").delete().neq("id", "")
  if (delError) throw delError
  await saveCategories(seedCategories)
}
