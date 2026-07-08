"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  LogOut, Search, Plus, Pencil, Trash2, Save, X,
  ShoppingBag, Package, Tag, RotateCcw, CheckCircle2, ExternalLink,
  Users, Building2, BadgePercent, ToggleLeft, ToggleRight, Key,
  Palette, List, FolderPlus, ChevronDown, ChevronUp
} from "lucide-react"
import { ImageUploader } from "@/components/image-uploader"
import { isAuthenticated, logout } from "@/lib/auth"
import { getProducts, saveProducts, resetProducts, getCategories, saveCategories, resetCategories } from "@/lib/products-store"
import { categories as defaultCategories, formatPrice, type Product, type Category } from "@/lib/products"
import { getClients, createClient, updateClient, deleteClient, type WholesaleClient } from "@/lib/wholesale-store"
import { getOrders, updateOrderStatus, deleteOrder, type Order } from "@/lib/orders-store"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BADGE_COLORS = [
  { label: "Rosa", value: "oklch(0.6 0.22 5)" },
  { label: "Naranja", value: "oklch(0.72 0.2 50)" },
  { label: "Verde", value: "oklch(0.62 0.18 145)" },
  { label: "Azul", value: "oklch(0.58 0.18 240)" },
  { label: "Rojo", value: "oklch(0.55 0.22 20)" },
  { label: "Dorado", value: "oklch(0.65 0.18 35)" },
]

function emptyProduct(): Omit<Product, "id"> {
  return {
    name: "", description: "", price: 0, category: "botas",
    image: "", imageAlt: "", badge: "",
    featured: false, colors: [], sizes: [], stock: 10, isEncargo: false,
  }
}

function emptyClient(): Omit<WholesaleClient, "id" | "createdAt"> {
  return {
    businessName: "", ownerName: "", username: "", password: "",
    phone: "", email: "", city: "", businessType: "",
    discount: 15, active: true, notes: "",
  }
}

function generateId(prefix = "prod"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm border outline-none transition-colors focus:border-blue-400"
const inputStyle = { borderColor: "oklch(0.88 0.03 90)", backgroundColor: "oklch(1 0 0)", color: "oklch(0.2 0.02 270)" }

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "wholesale" | "orders" | "metrics">("products")
  const [orders, setOrders] = useState<Order[]>([])
  const [saved, setSaved] = useState(false)

  // Products
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState("todos")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Omit<Product, "id">>(emptyProduct())
  const [isNew, setIsNew] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Categories
  const [categories, setCategories] = useState<Category[]>([])
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [isNewCat, setIsNewCat] = useState(false)
  const [catForm, setCatForm] = useState<Category>({ id: "", name: "", icon: "star", color: "oklch(0.6 0.22 5)" })
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null)

  // Wholesale
  const [clients, setClients] = useState<WholesaleClient[]>([])
  const [editingClient, setEditingClient] = useState<WholesaleClient | null>(null)
  const [isNewClient, setIsNewClient] = useState(false)
  const [clientForm, setClientForm] = useState<Omit<WholesaleClient, "id" | "createdAt">>(emptyClient())
  const [confirmDeleteClient, setConfirmDeleteClient] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/admin/login"); return }
    setProducts(getProducts())
    setCategories(getCategories())
    setClients(getClients())
    setOrders(getOrders())
    setChecking(false)
  }, [router])

  if (checking) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "oklch(0.98 0 0)" }}>
      <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: "oklch(0.38 0.12 248)", borderTopColor: "transparent" }} />
    </main>
  )

  function triggerSaved() { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  // ── Product handlers ────────────────────────────────────────────────────────

  function handleEdit(p: Product) {
    setEditingId(p.id)
    setEditForm({ ...p, colors: p.colors ?? [], features: p.features ?? [] })
    setIsNew(false)
  }

  function handleNew() {
    setEditingId(generateId())
    setEditForm(emptyProduct())
    setIsNew(true)
  }

  function handleSaveProduct() {
    if (!editForm.name.trim() || editForm.price <= 0) return
    const updated = isNew
      ? [...products, { id: editingId!, ...editForm }]
      : products.map((p) => p.id === editingId ? { id: p.id, ...editForm } : p)
    setProducts(updated)
    saveProducts(updated)
    setEditingId(null)
    setIsNew(false)
    triggerSaved()
  }

  function handleDeleteProduct(id: string) {
    const updated = products.filter((p) => p.id !== id)
    setProducts(updated)
    saveProducts(updated)
    setConfirmDelete(null)
    triggerSaved()
  }

  // ── Category handlers ───────────────────────────────────────────────────────

  function handleSaveCat() {
    if (!catForm.name.trim()) return
    const slug = catForm.id || catForm.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const cat: Category = { ...catForm, id: slug }
    const updated = isNewCat
      ? [...categories, cat]
      : categories.map((c) => c.id === editingCat?.id ? cat : c)
    setCategories(updated)
    saveCategories(updated)
    setIsNewCat(false)
    setEditingCat(null)
    triggerSaved()
  }

  function handleDeleteCat(id: string) {
    if (id === "todos") return
    const updated = categories.filter((c) => c.id !== id)
    setCategories(updated)
    saveCategories(updated)
    setConfirmDeleteCat(null)
    triggerSaved()
  }

  // ── Filtered products ───────────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const matchCat = filterCat === "todos" || p.category === filterCat
    const matchSearch = search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id

  return (
    <div className="min-h-screen" style={{ backgroundColor: "oklch(0.97 0.01 90)" }}>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b px-4 md:px-8 py-4 flex items-center justify-between gap-4"
        style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.88 0.03 90)" }}>
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2" style={{ backgroundColor: "oklch(0.38 0.12 248)" }}>
            <ShoppingBag size={18} style={{ color: "oklch(1 0 0)" }} />
          </div>
          <div>
            <p className="text-sm font-extrabold leading-none" style={{ color: "oklch(0.2 0.02 270)" }}>Panel Admin</p>
            <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0 0)" }}>Santa Diabla</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "oklch(0.62 0.18 145 / 0.12)", color: "oklch(0.5 0.18 145)" }}>
              <CheckCircle2 size={13} /> Guardado
            </span>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all hover:opacity-80"
            style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.4 0.03 270)" }}>
            <ExternalLink size={13} /> Ver tienda
          </a>
          <button onClick={() => { logout(); router.replace("/admin/login") }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:opacity-80"
            style={{ backgroundColor: "oklch(0.97 0.01 90)", color: "oklch(0.5 0.03 270)" }}>
            <LogOut size={13} /> Salir
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b px-4 md:px-8" style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.88 0.03 90)" }}>
        <div className="flex gap-1 max-w-6xl mx-auto overflow-x-auto">
          {[
            { id: "products", label: "Productos", icon: Package },
            { id: "categories", label: "Categorias", icon: Tag },
            { id: "orders", label: "Pedidos", icon: ShoppingBag },
            { id: "metrics", label: "Metricas", icon: CheckCircle2 },
            { id: "wholesale", label: "Mayoristas", icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id}
              onClick={() => setActiveTab(id as "products" | "categories" | "wholesale" | "orders" | "metrics")}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap"
              style={{
                borderColor: activeTab === id ? "oklch(0.38 0.12 248)" : "transparent",
                color: activeTab === id ? "oklch(0.38 0.12 248)" : "oklch(0.55 0 0)",
              }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: PRODUCTOS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "products" && (<>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total productos", value: products.length, color: "oklch(0.38 0.12 248)" },
              { label: "Destacados", value: products.filter(p => p.featured).length, color: "oklch(0.72 0.2 50)" },
              { label: "Con colores", value: products.filter(p => p.colors && p.colors.length > 0).length, color: "oklch(0.62 0.18 145)" },
              { label: "Categorías activas", value: categories.filter(c => c.id !== "todos").length, color: "oklch(0.58 0.18 240)" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl p-4 border" style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.88 0.03 90)" }}>
                <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0 0)" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "oklch(0.6 0 0)" }} />
              <input type="text" placeholder="Buscar producto..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm border outline-none"
                style={inputStyle} />
            </div>
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-sm border outline-none"
              style={inputStyle}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={handleNew}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:scale-105"
              style={{ backgroundColor: "oklch(0.38 0.12 248)", color: "oklch(1 0 0)" }}>
              <Plus size={15} /> Nuevo producto
            </button>
            <button onClick={() => { resetProducts(); setProducts(getProducts()); triggerSaved() }}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border transition-all hover:opacity-80"
              style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.5 0.03 270)", backgroundColor: "oklch(1 0 0)" }}
              title="Restablecer productos originales">
              <RotateCcw size={14} /> Restablecer
            </button>
          </div>

          {/* Form nuevo/editar producto */}
          {editingId && (
            <ProductForm
              form={editForm}
              setForm={setEditForm}
              categories={categories}
              isNew={isNew}
              onSave={handleSaveProduct}
              onCancel={() => { setEditingId(null); setIsNew(false) }}
            />
          )}

          {/* Tabla */}
          <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.88 0.03 90)" }}>
            <div className="hidden md:grid grid-cols-[72px_1fr_130px_100px_90px_110px] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wide border-b"
              style={{ color: "oklch(0.55 0 0)", borderColor: "oklch(0.88 0.03 90)", backgroundColor: "oklch(0.98 0.01 90)" }}>
              <span>Foto</span><span>Producto</span><span>Categoría</span>
              <span>Precio</span><span>Destacado</span><span>Acciones</span>
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <Package size={36} className="mx-auto mb-3" style={{ color: "oklch(0.75 0 0)" }} />
                <p className="text-sm font-semibold" style={{ color: "oklch(0.4 0 0)" }}>Sin resultados</p>
              </div>
            )}

            {filtered.map((product) => (
              <div key={product.id}>
                <div className="grid grid-cols-1 md:grid-cols-[72px_1fr_130px_100px_90px_110px] gap-3 md:gap-4 px-5 py-4 items-start md:items-center border-b last:border-b-0"
                  style={{ borderColor: "oklch(0.93 0.01 90)" }}>
                  {/* Foto */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden border flex-shrink-0"
                    style={{ borderColor: "oklch(0.88 0.03 90)" }}>
                    {product.image ? (
                      <img src={product.image} alt={product.imageAlt} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: "oklch(0.93 0.01 90)" }}>
                        <Package size={20} style={{ color: "oklch(0.7 0 0)" }} />
                      </div>
                    )}
                  </div>
                  {/* Nombre */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "oklch(0.2 0.02 270)" }}>{product.name}</p>
                    <p className="text-xs truncate" style={{ color: "oklch(0.55 0 0)" }}>{product.description}</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {product.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ backgroundColor: `${product.badgeColor}22`, color: product.badgeColor }}>
                          {product.badge}
                        </span>
                      )}
                      {product.colors && product.colors.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "oklch(0.58 0.18 240 / 0.1)", color: "oklch(0.38 0.12 248)" }}>
                          {product.colors.length} color{product.colors.length > 1 ? "es" : ""}
                        </span>
                      )}
                      {product.features && product.features.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "oklch(0.62 0.18 145 / 0.1)", color: "oklch(0.5 0.18 145)" }}>
                          {product.features.length} caract.
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Categoria */}
                  <p className="text-xs px-2 py-1 rounded-lg w-fit"
                    style={{ backgroundColor: "oklch(0.93 0.01 90)", color: "oklch(0.45 0.02 270)" }}>
                    {catName(product.category)}
                  </p>
                  {/* Precio */}
                  <p className="text-sm font-bold" style={{ color: "oklch(0.38 0.12 248)" }}>
                    {formatPrice(product.price)}
                  </p>
                  {/* Destacado */}
                  <button onClick={() => {
                    const updated = products.map((p) => p.id === product.id ? { ...p, featured: !p.featured } : p)
                    setProducts(updated); saveProducts(updated); triggerSaved()
                  }} className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80 w-fit"
                    style={{
                      borderColor: product.featured ? "oklch(0.72 0.2 50)" : "oklch(0.88 0.03 90)",
                      color: product.featured ? "oklch(0.72 0.2 50)" : "oklch(0.65 0 0)",
                      backgroundColor: product.featured ? "oklch(0.72 0.2 50 / 0.08)" : "oklch(1 0 0)",
                    }}>
                    {product.featured ? "Destacado" : "Normal"}
                  </button>
                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(product)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all hover:opacity-80"
                      style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.4 0.03 270)", backgroundColor: "oklch(0.98 0.01 90)" }}>
                      <Pencil size={12} /> Editar
                    </button>
                    <button onClick={() => setConfirmDelete(product.id)}
                      className="flex items-center rounded-lg p-1.5 transition-all hover:opacity-80"
                      style={{ backgroundColor: "oklch(0.97 0.05 5)", color: "oklch(0.55 0.22 5)" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {/* Confirm delete */}
                {confirmDelete === product.id && (
                  <div className="px-5 py-3 flex items-center justify-between gap-3 border-b"
                    style={{ backgroundColor: "oklch(0.99 0.03 5)", borderColor: "oklch(0.93 0.01 90)" }}>
                    <p className="text-xs font-medium" style={{ color: "oklch(0.4 0.22 5)" }}>
                      Eliminar <strong>{product.name}</strong>. Esta accion no se puede deshacer.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => handleDeleteProduct(product.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-bold"
                        style={{ backgroundColor: "oklch(0.6 0.22 5)", color: "oklch(1 0 0)" }}>
                        Eliminar
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold border"
                        style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.5 0 0)", backgroundColor: "oklch(1 0 0)" }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-center mt-6" style={{ color: "oklch(0.65 0 0)" }}>
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""} · Los cambios se guardan automáticamente
          </p>
        </>)}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: CATEGORÍAS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "categories" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: "oklch(0.2 0.02 270)" }}>Categorías del catálogo</p>
                <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0 0)" }}>Creá, editá o eliminá categorías. Los cambios se reflejan en la tienda al instante.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { resetCategories(); setCategories(getCategories()); triggerSaved() }}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold border"
                  style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.5 0.03 270)", backgroundColor: "oklch(1 0 0)" }}>
                  <RotateCcw size={13} /> Restablecer
                </button>
                <button onClick={() => { setIsNewCat(true); setEditingCat(null); setCatForm({ id: "", name: "", icon: "star", color: "oklch(0.6 0.22 5)" }) }}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:scale-105"
                  style={{ backgroundColor: "oklch(0.38 0.12 248)", color: "oklch(1 0 0)" }}>
                  <FolderPlus size={15} /> Nueva categoría
                </button>
              </div>
            </div>

            {/* Formulario nueva categoría */}
            {isNewCat && (
              <CategoryForm form={catForm} setForm={setCatForm}
                onSave={handleSaveCat}
                onCancel={() => setIsNewCat(false)}
                title="Nueva categoría" />
            )}

            {/* Lista */}
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.88 0.03 90)" }}>
              <div className="hidden md:grid grid-cols-[40px_1fr_120px_80px_120px] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wide border-b"
                style={{ color: "oklch(0.55 0 0)", borderColor: "oklch(0.88 0.03 90)", backgroundColor: "oklch(0.98 0.01 90)" }}>
                <span>Color</span><span>Nombre</span><span>ID / Slug</span><span>Productos</span><span>Acciones</span>
              </div>

              {categories.map((cat) => (
                <div key={cat.id}>
                  <div className="grid grid-cols-1 md:grid-cols-[40px_1fr_120px_80px_120px] gap-3 md:gap-4 px-5 py-4 items-center border-b last:border-b-0"
                    style={{ borderColor: "oklch(0.93 0.01 90)" }}>
                    <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <p className="text-sm font-bold" style={{ color: "oklch(0.2 0.02 270)" }}>{cat.name}</p>
                    <p className="text-xs font-mono" style={{ color: "oklch(0.6 0 0)" }}>{cat.id}</p>
                    <p className="text-sm font-semibold" style={{ color: "oklch(0.38 0.12 248)" }}>
                      {products.filter(p => p.category === cat.id).length}
                    </p>
                    <div className="flex items-center gap-2">
                      {cat.id !== "todos" && (<>
                        <button onClick={() => { setEditingCat(cat); setCatForm({ ...cat }); setIsNewCat(false) }}
                          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all hover:opacity-80"
                          style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.4 0.03 270)", backgroundColor: "oklch(0.98 0.01 90)" }}>
                          <Pencil size={12} /> Editar
                        </button>
                        <button onClick={() => setConfirmDeleteCat(cat.id)}
                          className="flex items-center rounded-lg p-1.5 transition-all hover:opacity-80"
                          style={{ backgroundColor: "oklch(0.97 0.05 5)", color: "oklch(0.55 0.22 5)" }}>
                          <Trash2 size={13} />
                        </button>
                      </>)}
                      {cat.id === "todos" && (
                        <span className="text-xs px-3 py-1.5 rounded-lg" style={{ color: "oklch(0.65 0 0)", backgroundColor: "oklch(0.95 0 0)" }}>
                          Sistema
                        </span>
                      )}
                    </div>
                  </div>

                  {confirmDeleteCat === cat.id && (
                    <div className="px-5 py-3 flex items-center justify-between gap-3 border-b"
                      style={{ backgroundColor: "oklch(0.99 0.03 5)", borderColor: "oklch(0.93 0.01 90)" }}>
                      <p className="text-xs font-medium" style={{ color: "oklch(0.4 0.22 5)" }}>
                        Eliminar <strong>{cat.name}</strong>. Los productos de esta categoría quedarán sin categoría asignada.
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => handleDeleteCat(cat.id)}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold"
                          style={{ backgroundColor: "oklch(0.6 0.22 5)", color: "oklch(1 0 0)" }}>
                          Eliminar
                        </button>
                        <button onClick={() => setConfirmDeleteCat(null)}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold border"
                          style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.5 0 0)", backgroundColor: "oklch(1 0 0)" }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {editingCat?.id === cat.id && (
                    <CategoryForm form={catForm} setForm={setCatForm}
                      onSave={handleSaveCat}
                      onCancel={() => setEditingCat(null)}
                      title="Editar categoría" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: PEDIDOS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: "oklch(0.2 0.02 270)" }}>Pedidos recibidos</p>
                <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0 0)" }}>{orders.length} pedido{orders.length !== 1 ? "s" : ""} en total</p>
              </div>
              <button onClick={() => setOrders(getOrders())} className="text-xs font-semibold px-3 py-2 border rounded-xl" style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.4 0 0)" }}>
                Actualizar
              </button>
            </div>
            {orders.length === 0 ? (
              <div className="py-20 text-center rounded-2xl border" style={{ borderColor: "oklch(0.88 0.03 90)" }}>
                <ShoppingBag size={36} className="mx-auto mb-3" style={{ color: "oklch(0.75 0 0)" }} />
                <p className="text-sm font-semibold" style={{ color: "oklch(0.4 0 0)" }}>Sin pedidos todavia</p>
                <p className="text-xs mt-1" style={{ color: "oklch(0.65 0 0)" }}>Los pedidos enviados desde la tienda apareceran aqui</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-2xl border p-5" style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.88 0.03 90)" }}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-sm font-extrabold tracking-wider" style={{ color: "oklch(0.2 0.02 270)" }}>{order.id}</p>
                        <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0 0)" }}>{new Date(order.createdAt).toLocaleString("es-AR")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => { updateOrderStatus(order.id, e.target.value as Order["status"]); setOrders(getOrders()) }}
                          className="rounded-xl px-3 py-1.5 text-xs font-semibold border outline-none"
                          style={inputStyle}
                        >
                          {["pendiente","confirmado","enviado","entregado","cancelado"].map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        <button onClick={() => { deleteOrder(order.id); setOrders(getOrders()) }} className="p-1.5 rounded-lg" style={{ backgroundColor: "oklch(0.97 0.05 5)", color: "oklch(0.55 0.22 5)" }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="font-bold mb-1" style={{ color: "oklch(0.4 0 0)" }}>Cliente</p>
                        <p style={{ color: "oklch(0.2 0.02 270)" }}>{order.nombre}</p>
                        <p style={{ color: "oklch(0.55 0 0)" }}>{order.telefono}</p>
                        {order.email && <p style={{ color: "oklch(0.55 0 0)" }}>{order.email}</p>}
                      </div>
                      <div>
                        <p className="font-bold mb-1" style={{ color: "oklch(0.4 0 0)" }}>Productos</p>
                        {order.items.map((item, i) => (
                          <p key={i} style={{ color: "oklch(0.35 0 0)" }}>
                            {item.name}{item.size ? ` T.${item.size}` : ""} x{item.quantity} — {formatPrice(item.price * item.quantity)}
                          </p>
                        ))}
                      </div>
                      <div>
                        <p className="font-bold mb-1" style={{ color: "oklch(0.4 0 0)" }}>Entrega</p>
                        <p style={{ color: "oklch(0.35 0 0)" }}>{order.shippingType === "envio" ? `Envio: ${order.localidad ?? ""}, ${order.provincia ?? ""}` : "Retiro en Concordia"}</p>
                        <p className="mt-1 font-bold" style={{ color: "oklch(0.38 0.12 248)" }}>{formatPrice(order.total)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: METRICAS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "metrics" && (() => {
          const completedOrders = orders.filter(o => o.status !== "cancelado")
          const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0)
          const avgOrder = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0
          const productCounts: Record<string, number> = {}
          completedOrders.forEach(o => o.items.forEach(item => {
            productCounts[item.name] = (productCounts[item.name] ?? 0) + item.quantity
          }))
          const topProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
          return (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Pedidos totales", value: orders.length, color: "oklch(0.38 0.12 248)" },
                  { label: "Pedidos activos", value: completedOrders.length, color: "oklch(0.62 0.18 145)" },
                  { label: "Ingresos estimados", value: formatPrice(totalRevenue), color: "oklch(0.72 0.2 50)" },
                  { label: "Ticket promedio", value: formatPrice(avgOrder), color: "oklch(0.6 0.22 5)" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-2xl p-5 border" style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.88 0.03 90)" }}>
                    <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
                    <p className="text-xs mt-1" style={{ color: "oklch(0.55 0 0)" }}>{label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border p-5" style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.88 0.03 90)" }}>
                <p className="text-sm font-bold mb-4" style={{ color: "oklch(0.2 0.02 270)" }}>Productos mas vendidos</p>
                {topProducts.length === 0 ? (
                  <p className="text-xs" style={{ color: "oklch(0.55 0 0)" }}>Sin datos todavia. Los pedidos completados apareceran aqui.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {topProducts.map(([name, qty], i) => (
                      <div key={name} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black w-5 text-right" style={{ color: "oklch(0.7 0 0)" }}>#{i + 1}</span>
                          <span className="text-sm font-medium" style={{ color: "oklch(0.2 0.02 270)" }}>{name}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: "oklch(0.38 0.12 248)" }}>{qty} ud.</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-2xl border p-5" style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.88 0.03 90)" }}>
                <p className="text-sm font-bold mb-4" style={{ color: "oklch(0.2 0.02 270)" }}>Estado de pedidos</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {["pendiente","confirmado","enviado","entregado","cancelado"].map((status) => {
                    const count = orders.filter(o => o.status === status).length
                    return (
                      <div key={status} className="text-center rounded-xl p-3 border" style={{ borderColor: "oklch(0.88 0.03 90)" }}>
                        <p className="text-2xl font-extrabold" style={{ color: "oklch(0.38 0.12 248)" }}>{count}</p>
                        <p className="text-xs mt-0.5 capitalize" style={{ color: "oklch(0.55 0 0)" }}>{status}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })()}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: MAYORISTAS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "wholesale" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold" style={{ color: "oklch(0.2 0.02 270)" }}>Clientes mayoristas</p>
                <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0 0)" }}>Administrá los accesos y descuentos de cada cliente.</p>
              </div>
              <button onClick={() => { setIsNewClient(true); setEditingClient(null); setClientForm(emptyClient()) }}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:scale-105"
                style={{ backgroundColor: "oklch(0.38 0.12 248)", color: "oklch(1 0 0)" }}>
                <Plus size={15} /> Nuevo cliente
              </button>
            </div>

            {isNewClient && (
              <ClientForm form={clientForm} setForm={setClientForm}
                onSave={() => { createClient(clientForm); setClients(getClients()); setIsNewClient(false); triggerSaved() }}
                onCancel={() => setIsNewClient(false)} title="Nuevo cliente mayorista" />
            )}

            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.88 0.03 90)" }}>
              <div className="hidden md:grid grid-cols-[1fr_130px_100px_80px_80px_120px] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wide border-b"
                style={{ color: "oklch(0.55 0 0)", borderColor: "oklch(0.88 0.03 90)", backgroundColor: "oklch(0.98 0.01 90)" }}>
                <span>Cliente</span><span>Usuario</span><span>Ciudad</span><span>Descuento</span><span>Estado</span><span>Acciones</span>
              </div>

              {clients.length === 0 && (
                <div className="py-16 text-center">
                  <Users size={36} className="mx-auto mb-3" style={{ color: "oklch(0.75 0 0)" }} />
                  <p className="text-sm font-semibold" style={{ color: "oklch(0.4 0 0)" }}>Sin clientes mayoristas</p>
                  <p className="text-xs mt-1" style={{ color: "oklch(0.65 0 0)" }}>Agregá el primer cliente con el botón de arriba</p>
                </div>
              )}

              {clients.map((client) => (
                <div key={client.id}>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_130px_100px_80px_80px_120px] gap-3 md:gap-4 px-5 py-4 items-start md:items-center border-b last:border-b-0"
                    style={{ borderColor: "oklch(0.93 0.01 90)" }}>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-sm font-bold" style={{ color: "oklch(0.2 0.02 270)" }}>{client.businessName}</p>
                      <p className="text-xs" style={{ color: "oklch(0.55 0 0)" }}>{client.ownerName} · {client.phone}</p>
                      {client.notes && <p className="text-xs italic" style={{ color: "oklch(0.65 0 0)" }}>{client.notes}</p>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Key size={12} style={{ color: "oklch(0.65 0 0)" }} />
                      <p className="text-xs font-mono" style={{ color: "oklch(0.35 0.02 270)" }}>{client.username}</p>
                    </div>
                    <p className="text-xs" style={{ color: "oklch(0.5 0 0)" }}>{client.city}</p>
                    <div className="flex items-center gap-1">
                      <BadgePercent size={13} style={{ color: "oklch(0.38 0.12 248)" }} />
                      <p className="text-sm font-extrabold" style={{ color: "oklch(0.38 0.12 248)" }}>{client.discount}%</p>
                    </div>
                    <button onClick={() => { updateClient(client.id, { active: !client.active }); setClients(getClients()) }}>
                      {client.active
                        ? <ToggleRight size={24} style={{ color: "oklch(0.55 0.18 145)" }} />
                        : <ToggleLeft size={24} style={{ color: "oklch(0.7 0 0)" }} />}
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingClient(client); setClientForm({ ...client }); setIsNewClient(false) }}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all hover:opacity-80"
                        style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.4 0.03 270)", backgroundColor: "oklch(0.98 0.01 90)" }}>
                        <Pencil size={12} /> Editar
                      </button>
                      <button onClick={() => setConfirmDeleteClient(client.id)}
                        className="flex items-center rounded-lg p-1.5 transition-all hover:opacity-80"
                        style={{ backgroundColor: "oklch(0.97 0.05 5)", color: "oklch(0.55 0.22 5)" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {confirmDeleteClient === client.id && (
                    <div className="px-5 py-3 flex items-center justify-between gap-3 border-b"
                      style={{ backgroundColor: "oklch(0.99 0.03 5)", borderColor: "oklch(0.93 0.01 90)" }}>
                      <p className="text-xs font-medium" style={{ color: "oklch(0.4 0.22 5)" }}>
                        Eliminar <strong>{client.businessName}</strong>. Esta accion no se puede deshacer.
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => { deleteClient(client.id); setClients(getClients()); setConfirmDeleteClient(null) }}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold"
                          style={{ backgroundColor: "oklch(0.6 0.22 5)", color: "oklch(1 0 0)" }}>
                          Eliminar
                        </button>
                        <button onClick={() => setConfirmDeleteClient(null)}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold border"
                          style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.5 0 0)", backgroundColor: "oklch(1 0 0)" }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {editingClient?.id === client.id && (
                    <ClientForm form={clientForm} setForm={setClientForm}
                      onSave={() => { updateClient(client.id, clientForm); setClients(getClients()); setEditingClient(null); triggerSaved() }}
                      onCancel={() => setEditingClient(null)} title="Editar cliente" />
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-2xl p-4 border text-xs"
              style={{ backgroundColor: "oklch(0.38 0.12 248 / 0.05)", borderColor: "oklch(0.38 0.12 248 / 0.2)", color: "oklch(0.45 0 0)" }}>
              Los clientes mayoristas acceden desde <strong>/mayoristas/login</strong> con su usuario y contraseña.
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── ProductForm ──────────────────────────────────────────────────────────────

interface ProductFormProps {
  form: Omit<Product, "id">
  setForm: (f: Omit<Product, "id">) => void
  categories: Category[]
  isNew: boolean
  onSave: () => void
  onCancel: () => void
}

function ProductForm({ form, setForm, categories, isNew, onSave, onCancel }: ProductFormProps) {
  const [colorInput, setColorInput] = useState("")
  const [featureInput, setFeatureInput] = useState("")
  const [sizeInput, setSizeInput] = useState("")

  const f = (key: keyof typeof form, value: unknown) => setForm({ ...form, [key]: value })

  const addColor = () => {
    const v = colorInput.trim()
    if (v && !(form.colors ?? []).includes(v)) {
      f("colors", [...(form.colors ?? []), v])
      setColorInput("")
    }
  }

  const addSize = () => {
    const v = sizeInput.trim()
    if (v && !(form.sizes ?? []).includes(v)) {
      f("sizes", [...(form.sizes ?? []), v])
      setSizeInput("")
    }
  }

  const removeSize = (s: string) => f("sizes", (form.sizes ?? []).filter((x) => x !== s))

  const removeColor = (c: string) => f("colors", (form.colors ?? []).filter((x) => x !== c))

  const addFeature = () => {
    const v = featureInput.trim()
    if (v && !(form.features ?? []).includes(v)) {
      f("features", [...(form.features ?? []), v])
      setFeatureInput("")
    }
  }

  const removeFeature = (feat: string) => f("features", (form.features ?? []).filter((x) => x !== feat))

  const isValid = form.name.trim() !== "" && form.price > 0

  return (
    <div className="rounded-2xl border overflow-hidden mb-6"
      style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.38 0.12 248 / 0.4)" }}>
      <div className="px-5 py-3 flex items-center gap-2 border-b"
        style={{ backgroundColor: "oklch(0.38 0.12 248 / 0.06)", borderColor: "oklch(0.88 0.03 90)" }}>
        <Package size={15} style={{ color: "oklch(0.38 0.12 248)" }} />
        <p className="text-sm font-bold" style={{ color: "oklch(0.2 0.02 270)" }}>
          {isNew ? "Nuevo producto" : `Editando: ${form.name}`}
        </p>
      </div>

      <div className="px-5 py-6 grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Nombre */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>Nombre *</label>
          <input type="text" value={form.name} onChange={(e) => f("name", e.target.value)}
            placeholder="Nombre del producto" className={inputClass} style={inputStyle} />
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>Descripción</label>
          <textarea value={form.description} onChange={(e) => f("description", e.target.value)}
            placeholder="Descripción del producto..." rows={2}
            className={inputClass + " resize-none"} style={inputStyle} />
        </div>

        {/* Precio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>Precio (ARS) *</label>
          <input type="number" min={0} value={form.price} onChange={(e) => f("price", Number(e.target.value))}
            placeholder="0" className={inputClass} style={inputStyle} />
        </div>

        {/* Categoría */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>Categoría *</label>
          <select value={form.category} onChange={(e) => f("category", e.target.value)}
            className={inputClass} style={inputStyle}>
            {categories.filter(c => c.id !== "todos").map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Imagen */}
        <div className="md:col-span-2">
          <ImageUploader
            value={form.image}
            onChange={(url) => f("image", url)}
            label="Imagen del producto"
            previewSize="md"
          />
        </div>

        {/* Alt imagen */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>Texto alternativo imagen</label>
          <input type="text" value={form.imageAlt} onChange={(e) => f("imageAlt", e.target.value)}
            placeholder="Descripción de la imagen para accesibilidad" className={inputClass} style={inputStyle} />
        </div>

        {/* Badge */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>Etiqueta (badge)</label>
          <input type="text" value={form.badge ?? ""} onChange={(e) => f("badge", e.target.value)}
            placeholder="Ej: Oferta, Nuevo, Más vendido" className={inputClass} style={inputStyle} />
        </div>

        {/* Color badge */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>Color etiqueta</label>
          <div className="flex gap-2 flex-wrap">
            {BADGE_COLORS.map((bc) => (
              <button key={bc.value} onClick={() => f("badgeColor", bc.value)} type="button"
                className="w-7 h-7 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: bc.color,
                  borderColor: form.badgeColor === bc.value ? "oklch(0.2 0.02 270)" : "transparent",
                }}
                title={bc.label} />
            ))}
          </div>
        </div>

        {/* ── Colores disponibles ── */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5" style={{ color: "oklch(0.4 0.03 270)" }}>
            <Palette size={13} /> Colores disponibles
          </label>
          <div className="flex gap-2">
            <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
              placeholder="Ej: Rojo, Azul marino, Dorado..." className={inputClass} style={inputStyle} />
            <button onClick={addColor} type="button"
              className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold flex-shrink-0"
              style={{ backgroundColor: "oklch(0.38 0.12 248)", color: "oklch(1 0 0)" }}>
              <Plus size={14} /> Agregar
            </button>
          </div>
          {(form.colors ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(form.colors ?? []).map((c) => (
                <span key={c} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: "oklch(0.58 0.18 240 / 0.1)", color: "oklch(0.38 0.12 248)" }}>
                  {c}
                  <button onClick={() => removeColor(c)} type="button">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Características ── */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5" style={{ color: "oklch(0.4 0.03 270)" }}>
            <List size={13} /> Características
          </label>
          <div className="flex gap-2">
            <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
              placeholder="Ej: Incluye helio, Para exteriores, 45 seg..." className={inputClass} style={inputStyle} />
            <button onClick={addFeature} type="button"
              className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold flex-shrink-0"
              style={{ backgroundColor: "oklch(0.62 0.18 145)", color: "oklch(1 0 0)" }}>
              <Plus size={14} /> Agregar
            </button>
          </div>
          {(form.features ?? []).length > 0 && (
            <div className="flex flex-col gap-1.5">
              {(form.features ?? []).map((feat) => (
                <div key={feat} className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ backgroundColor: "oklch(0.62 0.18 145 / 0.08)" }}>
                  <span className="text-xs font-medium" style={{ color: "oklch(0.4 0.18 145)" }}>{feat}</span>
                  <button onClick={() => removeFeature(feat)} type="button">
                    <X size={12} style={{ color: "oklch(0.55 0.18 145)" }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Talles disponibles */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>Talles disponibles</label>
          <div className="flex gap-2">
            <input type="text" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
              placeholder="Ej: 36, 37, 38..." className={inputClass} style={inputStyle} />
            <button onClick={addSize} type="button"
              className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold flex-shrink-0"
              style={{ backgroundColor: "oklch(0.38 0.12 248)", color: "oklch(1 0 0)" }}>
              <Plus size={14} /> Agregar
            </button>
          </div>
          {(form.sizes ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(form.sizes ?? []).map((s) => (
                <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border"
                  style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.2 0.02 270)", backgroundColor: "oklch(0.97 0 0)" }}>
                  {s}
                  <button onClick={() => removeSize(s)} type="button"><X size={11} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stock */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>Stock (-1 = encargo puro)</label>
          <input type="number" min={-1} value={form.stock ?? 10} onChange={(e) => f("stock", Number(e.target.value))}
            className={inputClass} style={inputStyle} />
        </div>

        {/* Destacado */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => f("featured", !form.featured)}
            className="relative w-11 h-6 rounded-full transition-all"
            style={{ backgroundColor: form.featured ? "oklch(0.72 0.2 50)" : "oklch(0.82 0 0)" }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
              style={{ left: form.featured ? "calc(100% - 22px)" : "2px", backgroundColor: "oklch(1 0 0)", boxShadow: "0 1px 3px oklch(0 0 0 / 0.2)" }} />
          </button>
          <label className="text-sm font-medium" style={{ color: "oklch(0.35 0.02 270)" }}>Producto destacado</label>
        </div>

        {/* Es encargo */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => f("isEncargo", !form.isEncargo)}
            className="relative w-11 h-6 rounded-full transition-all"
            style={{ backgroundColor: form.isEncargo ? "oklch(0.6 0.22 5)" : "oklch(0.82 0 0)" }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
              style={{ left: form.isEncargo ? "calc(100% - 22px)" : "2px", backgroundColor: "oklch(1 0 0)", boxShadow: "0 1px 3px oklch(0 0 0 / 0.2)" }} />
          </button>
          <label className="text-sm font-medium" style={{ color: "oklch(0.35 0.02 270)" }}>Solo por encargo</label>
        </div>
      </div>

      <div className="flex items-center gap-3 px-5 pb-5 pt-2 border-t" style={{ borderColor: "oklch(0.88 0.03 90)" }}>
        <button onClick={onSave} disabled={!isValid}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:scale-105 disabled:opacity-50"
          style={{ backgroundColor: "oklch(0.38 0.12 248)", color: "oklch(1 0 0)" }}>
          <Save size={14} /> Guardar
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border"
          style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.5 0.03 270)", backgroundColor: "oklch(1 0 0)" }}>
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}

// ─── CategoryForm ─────────────────────────────────────────────────────────────

interface CategoryFormProps {
  form: Category
  setForm: (c: Category) => void
  onSave: () => void
  onCancel: () => void
  title: string
}

const CAT_COLORS = [
  "oklch(0.6 0.22 5)", "oklch(0.72 0.2 50)", "oklch(0.62 0.18 145)",
  "oklch(0.58 0.18 240)", "oklch(0.65 0.18 35)", "oklch(0.55 0.22 20)",
  "oklch(0.6 0.18 280)", "oklch(0.55 0.15 200)",
]

function CategoryForm({ form, setForm, onSave, onCancel, title }: CategoryFormProps) {
  const f = (key: keyof Category, value: string) => setForm({ ...form, [key]: value })
  const isValid = form.name.trim() !== ""

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.38 0.12 248 / 0.4)" }}>
      <div className="px-5 py-3 flex items-center gap-2 border-b"
        style={{ backgroundColor: "oklch(0.38 0.12 248 / 0.06)", borderColor: "oklch(0.88 0.03 90)" }}>
        <Tag size={15} style={{ color: "oklch(0.38 0.12 248)" }} />
        <p className="text-sm font-bold" style={{ color: "oklch(0.2 0.02 270)" }}>{title}</p>
      </div>
      <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>Nombre *</label>
          <input type="text" value={form.name} onChange={(e) => f("name", e.target.value)}
            placeholder="Ej: Piñatas" className={inputClass} style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>Slug / ID</label>
          <input type="text" value={form.id} onChange={(e) => f("id", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            placeholder="se genera automático" className={inputClass} style={inputStyle} />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>Color</label>
          <div className="flex gap-2 flex-wrap">
            {CAT_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => f("color", c)}
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{ backgroundColor: c, borderColor: form.color === c ? "oklch(0.2 0.02 270)" : "transparent" }} />
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <ImageUploader
            value={(form as Category & { image?: string }).image ?? ""}
            onChange={(url) => setForm({ ...form, image: url } as Category)}
            label="Imagen de categoría (opcional)"
            previewSize="sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 px-5 pb-5 pt-2 border-t" style={{ borderColor: "oklch(0.88 0.03 90)" }}>
        <button onClick={onSave} disabled={!isValid}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-50 transition-all hover:scale-105"
          style={{ backgroundColor: "oklch(0.38 0.12 248)", color: "oklch(1 0 0)" }}>
          <Save size={14} /> Guardar
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border"
          style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.5 0.03 270)", backgroundColor: "oklch(1 0 0)" }}>
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}

// ─── ClientForm ───────────────────────────────────────────────────────────────

interface ClientFormProps {
  form: Omit<WholesaleClient, "id" | "createdAt">
  setForm: (f: Omit<WholesaleClient, "id" | "createdAt">) => void
  onSave: () => void
  onCancel: () => void
  title: string
}

function ClientForm({ form, setForm, onSave, onCancel, title }: ClientFormProps) {
  const f = (key: keyof typeof form, value: string | number | boolean) => setForm({ ...form, [key]: value })
  const isValid = form.businessName.trim() !== "" && form.username.trim() !== "" && form.password.trim() !== ""

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: "oklch(1 0 0)", borderColor: "oklch(0.38 0.12 248 / 0.4)" }}>
      <div className="px-5 py-3 flex items-center gap-2 border-b"
        style={{ backgroundColor: "oklch(0.38 0.12 248 / 0.06)", borderColor: "oklch(0.88 0.03 90)" }}>
        <Building2 size={15} style={{ color: "oklch(0.38 0.12 248)" }} />
        <p className="text-sm font-bold" style={{ color: "oklch(0.2 0.02 270)" }}>{title}</p>
      </div>
      <div className="px-5 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: "businessName", label: "Nombre del negocio *", placeholder: "Ej: Kiosco El Sol" },
          { key: "ownerName", label: "Responsable *", placeholder: "Nombre completo" },
          { key: "username", label: "Usuario *", placeholder: "Ej: kioscoelsol" },
          { key: "password", label: "Contraseña *", placeholder: "Mínimo 6 caracteres" },
          { key: "phone", label: "Teléfono", placeholder: "345 412-3456" },
          { key: "email", label: "Email", placeholder: "email@ejemplo.com" },
          { key: "city", label: "Ciudad", placeholder: "Concordia" },
          { key: "businessType", label: "Tipo de negocio", placeholder: "Kiosco, Librería..." },
        ].map(({ key, label, placeholder }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>{label}</label>
            <input type="text" value={String(form[key as keyof typeof form] ?? "")}
              onChange={(e) => f(key as keyof typeof form, e.target.value)}
              placeholder={placeholder} className={inputClass} style={inputStyle} />
          </div>
        ))}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>Descuento (%)</label>
          <input type="number" min={0} max={60} value={form.discount}
            onChange={(e) => f("discount", Number(e.target.value))}
            className={inputClass} style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.4 0.03 270)" }}>Notas internas</label>
          <input type="text" value={form.notes}
            onChange={(e) => f("notes", e.target.value)}
            placeholder="Observaciones..." className={inputClass} style={inputStyle} />
        </div>
        <div className="flex items-center gap-3 md:col-span-2">
          <button type="button" onClick={() => f("active", !form.active)}
            className="relative w-11 h-6 rounded-full transition-all"
            style={{ backgroundColor: form.active ? "oklch(0.55 0.18 145)" : "oklch(0.82 0 0)" }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
              style={{ left: form.active ? "calc(100% - 22px)" : "2px", backgroundColor: "oklch(1 0 0)", boxShadow: "0 1px 3px oklch(0 0 0 / 0.2)" }} />
          </button>
          <label className="text-sm font-medium" style={{ color: "oklch(0.35 0.02 270)" }}>Cuenta activa</label>
        </div>
      </div>
      <div className="flex items-center gap-3 px-5 pb-5 pt-2 border-t" style={{ borderColor: "oklch(0.88 0.03 90)" }}>
        <button onClick={onSave} disabled={!isValid}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-50 transition-all hover:scale-105"
          style={{ backgroundColor: "oklch(0.38 0.12 248)", color: "oklch(1 0 0)" }}>
          <Save size={14} /> Guardar
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border"
          style={{ borderColor: "oklch(0.88 0.03 90)", color: "oklch(0.5 0.03 270)", backgroundColor: "oklch(1 0 0)" }}>
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}
