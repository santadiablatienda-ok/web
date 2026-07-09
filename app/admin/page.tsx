"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  LogOut, Search, Plus, Pencil, Trash2, Save, X,
  ShoppingBag, Package, Tag, RotateCcw, CheckCircle2, ExternalLink,
  Palette, FolderPlus,
} from "lucide-react"
import { ImageUploader } from "@/components/image-uploader"
import { FolderImporter } from "@/components/folder-importer"
import { isAuthenticated, logout } from "@/lib/auth"
import { getProducts, saveProducts, resetProducts, getCategories, saveCategories, resetCategories } from "@/lib/products-store"
import { categories as defaultCategories, formatPrice, type Product, type Category } from "@/lib/products"
import { getOrders, updateOrderStatus, deleteOrder, type Order } from "@/lib/orders-store"

// ─── Paleta ──────────────────────────────────────────────────────────────────
// Mismo lenguaje visual que la tienda: blanco y negro editorial, sin esquinas
// redondeadas, tipografia en mayusculas para titulos/acciones, rojo como unico acento.

const c = {
  black: "#000000",
  white: "#FFFFFF",
  gray50: "#F5F5F5",
  gray100: "#EBEBEB",
  gray200: "#E0E0E0",
  gray400: "#9E9E9E",
  gray600: "#5C5C5C",
  gray900: "#111111",
  accent: "#E63946",
  success: "#1B8354",
  warning: "#B8790A",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function emptyProduct(): Omit<Product, "id"> {
  return {
    name: "", description: "", price: 0, category: "botas",
    image: "", imageAlt: "", badge: "",
    featured: false, colors: [], sizes: [], stock: 10, isEncargo: false,
    discountPercent: 0, season: "",
  }
}

function generateId(prefix = "prod"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

const inputClass = "w-full px-3.5 py-2.5 text-sm border outline-none transition-colors focus:border-black"
const inputStyle = { borderColor: c.gray200, backgroundColor: c.white, color: c.black }
const labelClass = "text-xs font-bold uppercase tracking-wider"
const labelStyle = { color: c.gray600, letterSpacing: "0.06em" }

function PrimaryButton({ children, onClick, disabled, type = "button" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ backgroundColor: c.black, color: c.white, letterSpacing: "0.08em" }}>
      {children}
    </button>
  )
}

function SecondaryButton({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest border transition-all hover:bg-black hover:text-white"
      style={{ borderColor: c.gray200, color: c.gray600, letterSpacing: "0.08em" }}>
      {children}
    </button>
  )
}

function IconButton({ children, onClick, danger }: { children: React.ReactNode; onClick?: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center justify-center p-2 transition-opacity hover:opacity-70"
      style={{ backgroundColor: danger ? "#FCE9EA" : c.gray50, color: danger ? c.accent : c.gray600 }}>
      {children}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "orders" | "metrics">("products")
  const [orders, setOrders] = useState<Order[]>([])
  const [saved, setSaved] = useState(false)

  // Products
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [filterCat, setFilterCat] = useState("todos")
  const [filterSeason, setFilterSeason] = useState("todas")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Omit<Product, "id">>(emptyProduct())
  const [isNew, setIsNew] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  // Categories
  const [categories, setCategories] = useState<Category[]>([])
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [isNewCat, setIsNewCat] = useState(false)
  const [catForm, setCatForm] = useState<Category>({ id: "", name: "", icon: "star", color: c.black })
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/admin/login"); return }
    setProducts(getProducts())
    setCategories(getCategories())
    setOrders(getOrders())
    setChecking(false)
  }, [router])

  if (checking) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: c.white }}>
      <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: c.black, borderTopColor: "transparent" }} />
    </main>
  )

  function triggerSaved() { setSaved(true); setTimeout(() => setSaved(false), 2500) }

  // ── Product handlers ────────────────────────────────────────────────────────

  function handleEdit(p: Product) {
    setEditingId(p.id)
    setEditForm({ ...p, colors: p.colors ?? [] })
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

  function handleImportProducts(imported: Omit<Product, "id">[]) {
    const withIds: Product[] = imported.map((p) => ({ id: generateId(), ...p }))
    const updated = [...products, ...withIds]
    setProducts(updated)
    saveProducts(updated)
    triggerSaved()
  }

  // ── Category handlers ───────────────────────────────────────────────────────

  function handleSaveCat() {
    if (!catForm.name.trim()) return
    const slug = catForm.id || catForm.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    const cat: Category = { ...catForm, id: slug }
    const updated = isNewCat
      ? [...categories, cat]
      : categories.map((cItem) => cItem.id === editingCat?.id ? cat : cItem)
    setCategories(updated)
    saveCategories(updated)
    setIsNewCat(false)
    setEditingCat(null)
    triggerSaved()
  }

  function handleDeleteCat(id: string) {
    if (id === "todos") return
    const updated = categories.filter((cat) => cat.id !== id)
    setCategories(updated)
    saveCategories(updated)
    setConfirmDeleteCat(null)
    triggerSaved()
  }

  // ── Filtered products ───────────────────────────────────────────────────────
  const seasons = Array.from(new Set(products.map((p) => p.season).filter((s): s is string => !!s && s.trim() !== "")))
  const filtered = products.filter((p) => {
    const matchCat = filterCat === "todos" || p.category === filterCat
    const matchSeason = filterSeason === "todas" || p.season === filterSeason
    const matchSearch = search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSeason && matchSearch
  })

  const catName = (id: string) => categories.find((cat) => cat.id === id)?.name ?? id

  return (
    <div className="min-h-screen" style={{ backgroundColor: c.gray50 }}>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b px-4 md:px-8 py-4 flex items-center justify-between gap-4"
        style={{ backgroundColor: c.white, borderColor: c.gray200 }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9" style={{ backgroundColor: c.black }}>
            <ShoppingBag size={17} style={{ color: c.white }} />
          </div>
          <div>
            <p className="text-sm font-black uppercase leading-none tracking-wide" style={{ color: c.black }}>Panel Admin</p>
            <p className="text-xs mt-1" style={{ color: c.gray400 }}>Santa Diabla</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5"
              style={{ backgroundColor: "#EAF5EF", color: c.success, letterSpacing: "0.06em" }}>
              <CheckCircle2 size={13} /> Guardado
            </span>
          )}
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-2 border transition-all hover:bg-black hover:text-white"
            style={{ borderColor: c.gray200, color: c.gray600 }}>
            <ExternalLink size={13} /> Ver tienda
          </a>
          <button onClick={() => { logout(); router.replace("/admin/login") }}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-2 transition-opacity hover:opacity-70"
            style={{ backgroundColor: c.gray50, color: c.gray600 }}>
            <LogOut size={13} /> Salir
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b px-4 md:px-8" style={{ backgroundColor: c.white, borderColor: c.gray200 }}>
        <div className="flex gap-1 max-w-6xl mx-auto overflow-x-auto">
          {[
            { id: "products", label: "Productos", icon: Package },
            { id: "categories", label: "Categorias", icon: Tag },
            { id: "orders", label: "Pedidos", icon: ShoppingBag },
            { id: "metrics", label: "Metricas", icon: CheckCircle2 },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id}
              onClick={() => setActiveTab(id as "products" | "categories" | "orders" | "metrics")}
              className="flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap"
              style={{
                borderColor: activeTab === id ? c.black : "transparent",
                color: activeTab === id ? c.black : c.gray400,
                letterSpacing: "0.06em",
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px mb-8" style={{ backgroundColor: c.gray200 }}>
            {[
              { label: "Total productos", value: products.length },
              { label: "Destacados", value: products.filter(p => p.featured).length },
              { label: "Con colores", value: products.filter(p => p.colors && p.colors.length > 0).length },
              { label: "Categorías activas", value: categories.filter(cat => cat.id !== "todos").length },
            ].map(({ label, value }) => (
              <div key={label} className="p-4" style={{ backgroundColor: c.white }}>
                <p className="text-2xl font-black" style={{ color: c.black }}>{value}</p>
                <p className="text-xs mt-0.5 uppercase tracking-wide" style={{ color: c.gray400 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-5">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: c.gray400 }} />
              <input type="text" placeholder="Buscar producto..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border outline-none focus:border-black"
                style={inputStyle} />
            </div>
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
              className="px-4 py-2.5 text-sm border outline-none"
              style={inputStyle}>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            {seasons.length > 0 && (
              <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)}
                className="px-4 py-2.5 text-sm border outline-none"
                style={inputStyle}>
                <option value="todas">Todas las temporadas</option>
                {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            <PrimaryButton onClick={handleNew}><Plus size={15} /> Nuevo producto</PrimaryButton>
            <FolderImporter categories={categories} onImport={handleImportProducts} />
            <SecondaryButton title="Restablecer productos originales" onClick={() => { resetProducts(); setProducts(getProducts()); triggerSaved() }}>
              <RotateCcw size={14} /> Restablecer
            </SecondaryButton>
          </div>

          {/* Form nuevo producto (arriba de la lista) */}
          {editingId && isNew && (
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
          <div className="border" style={{ backgroundColor: c.white, borderColor: c.gray200 }}>
            <div className="hidden md:grid grid-cols-[72px_1fr_130px_100px_90px_110px] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wide border-b"
              style={{ color: c.gray400, borderColor: c.gray200, backgroundColor: c.gray50, letterSpacing: "0.06em" }}>
              <span>Foto</span><span>Producto</span><span>Categoría</span>
              <span>Precio</span><span>Destacado</span><span>Acciones</span>
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <Package size={36} className="mx-auto mb-3" style={{ color: c.gray200 }} />
                <p className="text-sm font-bold" style={{ color: c.gray600 }}>Sin resultados</p>
              </div>
            )}

            {filtered.map((product) => (
              <div key={product.id}>
                <div className="grid grid-cols-1 md:grid-cols-[72px_1fr_130px_100px_90px_110px] gap-3 md:gap-4 px-5 py-4 items-start md:items-center border-b last:border-b-0"
                  style={{ borderColor: c.gray100 }}>
                  {/* Foto */}
                  <div className="w-16 h-16 overflow-hidden border flex-shrink-0" style={{ borderColor: c.gray200 }}>
                    {product.image ? (
                      <img src={product.image} alt={product.imageAlt} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: c.gray50 }}>
                        <Package size={20} style={{ color: c.gray200 }} />
                      </div>
                    )}
                  </div>
                  {/* Nombre */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: c.black }}>{product.name}</p>
                    <p className="text-xs truncate" style={{ color: c.gray400 }}>{product.description}</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {product.badge && (
                        <span className="text-xs px-2 py-0.5 font-bold uppercase tracking-wide"
                          style={{ backgroundColor: c.black, color: c.white }}>
                          {product.badge}
                        </span>
                      )}
                      {product.colors && product.colors.length > 0 && (
                        <span className="text-xs px-2 py-0.5 border" style={{ borderColor: c.gray200, color: c.gray600 }}>
                          {product.colors.length} color{product.colors.length > 1 ? "es" : ""}
                        </span>
                      )}
                      {!!product.discountPercent && product.discountPercent > 0 && (
                        <span className="text-xs px-2 py-0.5 font-bold" style={{ backgroundColor: c.accent, color: c.white }}>
                          -{product.discountPercent}%
                        </span>
                      )}
                      {product.season && (
                        <span className="text-xs px-2 py-0.5 border" style={{ borderColor: c.gray200, color: c.gray600 }}>
                          {product.season}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Categoria */}
                  <p className="text-xs px-2 py-1 w-fit" style={{ backgroundColor: c.gray50, color: c.gray600 }}>
                    {catName(product.category)}
                  </p>
                  {/* Precio */}
                  <p className="text-sm font-bold" style={{ color: c.black }}>
                    {formatPrice(product.price)}
                  </p>
                  {/* Destacado */}
                  <button onClick={() => {
                    const updated = products.map((p) => p.id === product.id ? { ...p, featured: !p.featured } : p)
                    setProducts(updated); saveProducts(updated); triggerSaved()
                  }} className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 border transition-all hover:opacity-80 w-fit"
                    style={{
                      borderColor: product.featured ? c.black : c.gray200,
                      color: product.featured ? c.white : c.gray400,
                      backgroundColor: product.featured ? c.black : c.white,
                    }}>
                    {product.featured ? "Destacado" : "Normal"}
                  </button>
                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => editingId === product.id ? setEditingId(null) : handleEdit(product)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide border transition-all hover:bg-black hover:text-white"
                      style={{
                        borderColor: editingId === product.id ? c.black : c.gray200,
                        color: editingId === product.id ? c.white : c.gray600,
                        backgroundColor: editingId === product.id ? c.black : c.white,
                      }}>
                      <Pencil size={12} /> {editingId === product.id ? "Cerrar" : "Editar"}
                    </button>
                    <IconButton danger onClick={() => setConfirmDelete(product.id)}>
                      <Trash2 size={13} />
                    </IconButton>
                  </div>
                </div>

                {/* Form editar (in-place, debajo del producto que se esta editando) */}
                {editingId === product.id && !isNew && (
                  <div className="px-5 pb-5 border-b" style={{ borderColor: c.gray100, backgroundColor: c.gray50 }}>
                    <ProductForm
                      form={editForm}
                      setForm={setEditForm}
                      categories={categories}
                      isNew={false}
                      onSave={handleSaveProduct}
                      onCancel={() => { setEditingId(null); setIsNew(false) }}
                    />
                  </div>
                )}

                {/* Confirm delete */}
                {confirmDelete === product.id && (
                  <div className="px-5 py-3 flex items-center justify-between gap-3 border-b flex-wrap"
                    style={{ backgroundColor: "#FCE9EA", borderColor: c.gray100 }}>
                    <p className="text-xs font-semibold" style={{ color: "#7A1F26" }}>
                      Eliminar <strong>{product.name}</strong>. Esta accion no se puede deshacer.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => handleDeleteProduct(product.id)}
                        className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
                        style={{ backgroundColor: c.accent, color: c.white }}>
                        Eliminar
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide border"
                        style={{ borderColor: c.gray200, color: c.gray600, backgroundColor: c.white }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-center mt-6" style={{ color: c.gray400 }}>
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""} · Los cambios se guardan automáticamente
          </p>
        </>)}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: CATEGORÍAS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "categories" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-wide" style={{ color: c.black }}>Categorías del catálogo</p>
                <p className="text-xs mt-0.5" style={{ color: c.gray400 }}>Creá, editá o eliminá categorías. Los cambios se reflejan en la tienda al instante.</p>
              </div>
              <div className="flex gap-2">
                <SecondaryButton onClick={() => { resetCategories(); setCategories(getCategories()); triggerSaved() }}>
                  <RotateCcw size={13} /> Restablecer
                </SecondaryButton>
                <PrimaryButton onClick={() => { setIsNewCat(true); setEditingCat(null); setCatForm({ id: "", name: "", icon: "star", color: c.black }) }}>
                  <FolderPlus size={15} /> Nueva categoría
                </PrimaryButton>
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
            <div className="border" style={{ backgroundColor: c.white, borderColor: c.gray200 }}>
              <div className="hidden md:grid grid-cols-[40px_1fr_120px_80px_120px] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wide border-b"
                style={{ color: c.gray400, borderColor: c.gray200, backgroundColor: c.gray50, letterSpacing: "0.06em" }}>
                <span>Color</span><span>Nombre</span><span>ID / Slug</span><span>Productos</span><span>Acciones</span>
              </div>

              {categories.map((cat) => (
                <div key={cat.id}>
                  <div className="grid grid-cols-1 md:grid-cols-[40px_1fr_120px_80px_120px] gap-3 md:gap-4 px-5 py-4 items-center border-b last:border-b-0"
                    style={{ borderColor: c.gray100 }}>
                    <div className="w-8 h-8 flex-shrink-0 border" style={{ backgroundColor: cat.color, borderColor: c.gray200 }} />
                    <p className="text-sm font-bold" style={{ color: c.black }}>{cat.name}</p>
                    <p className="text-xs font-mono" style={{ color: c.gray400 }}>{cat.id}</p>
                    <p className="text-sm font-bold" style={{ color: c.black }}>
                      {products.filter(p => p.category === cat.id).length}
                    </p>
                    <div className="flex items-center gap-2">
                      {cat.id !== "todos" && (<>
                        <button onClick={() => { setEditingCat(cat); setCatForm({ ...cat }); setIsNewCat(false) }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide border transition-all hover:bg-black hover:text-white"
                          style={{ borderColor: c.gray200, color: c.gray600, backgroundColor: c.white }}>
                          <Pencil size={12} /> Editar
                        </button>
                        <IconButton danger onClick={() => setConfirmDeleteCat(cat.id)}>
                          <Trash2 size={13} />
                        </IconButton>
                      </>)}
                      {cat.id === "todos" && (
                        <span className="text-xs px-3 py-1.5 uppercase tracking-wide" style={{ color: c.gray400, backgroundColor: c.gray50 }}>
                          Sistema
                        </span>
                      )}
                    </div>
                  </div>

                  {confirmDeleteCat === cat.id && (
                    <div className="px-5 py-3 flex items-center justify-between gap-3 border-b flex-wrap"
                      style={{ backgroundColor: "#FCE9EA", borderColor: c.gray100 }}>
                      <p className="text-xs font-semibold" style={{ color: "#7A1F26" }}>
                        Eliminar <strong>{cat.name}</strong>. Los productos de esta categoría quedarán sin categoría asignada.
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => handleDeleteCat(cat.id)}
                          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
                          style={{ backgroundColor: c.accent, color: c.white }}>
                          Eliminar
                        </button>
                        <button onClick={() => setConfirmDeleteCat(null)}
                          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide border"
                          style={{ borderColor: c.gray200, color: c.gray600, backgroundColor: c.white }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {editingCat?.id === cat.id && (
                    <div className="px-5 pb-5 border-b" style={{ borderColor: c.gray100, backgroundColor: c.gray50 }}>
                      <CategoryForm form={catForm} setForm={setCatForm}
                        onSave={handleSaveCat}
                        onCancel={() => setEditingCat(null)}
                        title="Editar categoría" />
                    </div>
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
                <p className="text-sm font-black uppercase tracking-wide" style={{ color: c.black }}>Pedidos recibidos</p>
                <p className="text-xs mt-0.5" style={{ color: c.gray400 }}>{orders.length} pedido{orders.length !== 1 ? "s" : ""} en total</p>
              </div>
              <SecondaryButton onClick={() => setOrders(getOrders())}>Actualizar</SecondaryButton>
            </div>
            {orders.length === 0 ? (
              <div className="py-20 text-center border" style={{ borderColor: c.gray200 }}>
                <ShoppingBag size={36} className="mx-auto mb-3" style={{ color: c.gray200 }} />
                <p className="text-sm font-bold" style={{ color: c.gray600 }}>Sin pedidos todavia</p>
                <p className="text-xs mt-1" style={{ color: c.gray400 }}>Los pedidos enviados desde la tienda apareceran aqui</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.map((order) => (
                  <div key={order.id} className="border p-5" style={{ backgroundColor: c.white, borderColor: c.gray200 }}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-sm font-black tracking-wider" style={{ color: c.black }}>{order.id}</p>
                        <p className="text-xs mt-0.5" style={{ color: c.gray400 }}>{new Date(order.createdAt).toLocaleString("es-AR")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => { updateOrderStatus(order.id, e.target.value as Order["status"]); setOrders(getOrders()) }}
                          className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide border outline-none"
                          style={inputStyle}
                        >
                          {["pendiente","confirmado","enviado","entregado","cancelado"].map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        <IconButton danger onClick={() => { deleteOrder(order.id); setOrders(getOrders()) }}>
                          <Trash2 size={13} />
                        </IconButton>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="font-bold uppercase tracking-wide mb-1" style={{ color: c.gray600 }}>Cliente</p>
                        <p style={{ color: c.black }}>{order.nombre}</p>
                        <p style={{ color: c.gray400 }}>{order.telefono}</p>
                        {order.email && <p style={{ color: c.gray400 }}>{order.email}</p>}
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-wide mb-1" style={{ color: c.gray600 }}>Productos</p>
                        {order.items.map((item, i) => (
                          <p key={i} style={{ color: c.gray600 }}>
                            {item.name}{item.size ? ` T.${item.size}` : ""} x{item.quantity} — {formatPrice(item.price * item.quantity)}
                            {item.isBackorder && <span style={{ color: c.accent, fontWeight: 700 }}> · Encargo</span>}
                          </p>
                        ))}
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-wide mb-1" style={{ color: c.gray600 }}>Entrega</p>
                        <p style={{ color: c.gray600 }}>{order.shippingType === "envio" ? `Envio: ${order.localidad ?? ""}, ${order.provincia ?? ""}` : "Retiro en Concordia"}</p>
                        <p className="mt-1 font-bold" style={{ color: c.black }}>{formatPrice(order.total)}</p>
                        {order.depositDue !== undefined && order.depositDue < order.total && (
                          <p className="text-xs font-semibold" style={{ color: c.accent }}>
                            Seña abonada: {formatPrice(order.depositDue)} · Saldo: {formatPrice(order.total - order.depositDue)}
                          </p>
                        )}
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
          const confirmedOrders = orders.filter(o => ["confirmado", "enviado", "entregado"].includes(o.status))
          const pendingOrders = orders.filter(o => o.status === "pendiente")
          const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0)
          const confirmedRevenue = confirmedOrders.reduce((sum, o) => sum + o.total, 0)
          const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.total, 0)
          const balancePending = completedOrders.reduce((sum, o) => sum + Math.max(0, o.total - (o.depositDue ?? o.total)), 0)
          const avgOrder = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0

          const productCounts: Record<string, { qty: number; revenue: number }> = {}
          completedOrders.forEach(o => o.items.forEach(item => {
            const entry = productCounts[item.name] ?? { qty: 0, revenue: 0 }
            entry.qty += item.quantity
            entry.revenue += item.price * item.quantity
            productCounts[item.name] = entry
          }))
          const allProductsRanking = Object.entries(productCounts).sort((a, b) => b[1].qty - a[1].qty)

          const categoryRevenue: Record<string, number> = {}
          completedOrders.forEach(o => o.items.forEach(item => {
            const cat = item.category ? catName(item.category) : "Sin categoría"
            categoryRevenue[cat] = (categoryRevenue[cat] ?? 0) + item.price * item.quantity
          }))
          const categoryRanking = Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1])
          const maxCategoryRevenue = Math.max(1, ...categoryRanking.map(([, v]) => v))

          const outOfStockProducts = products.filter(p => !p.isEncargo && p.stock === 0)
          const lowStockProducts = products.filter(p => !p.isEncargo && (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 3)

          return (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-px" style={{ backgroundColor: c.gray200 }}>
                {[
                  { label: "Pedidos totales", value: orders.length },
                  { label: "Pedidos activos", value: completedOrders.length },
                  { label: "Ticket promedio", value: formatPrice(avgOrder) },
                  { label: "Ingresos confirmados", value: formatPrice(confirmedRevenue), accent: c.success },
                  { label: "Ingresos pendientes", value: formatPrice(pendingRevenue), accent: c.warning },
                  { label: "Saldo pendiente (encargos)", value: formatPrice(balancePending), accent: c.accent },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="p-5" style={{ backgroundColor: c.white }}>
                    <p className="text-xl font-black" style={{ color: accent ?? c.black }}>{value}</p>
                    <p className="text-xs mt-1 uppercase tracking-wide" style={{ color: c.gray400 }}>{label}</p>
                  </div>
                ))}
              </div>

              <div className="border p-5" style={{ backgroundColor: c.white, borderColor: c.gray200 }}>
                <p className="text-sm font-black uppercase tracking-wide mb-4" style={{ color: c.black }}>Facturación por categoría</p>
                {categoryRanking.length === 0 ? (
                  <p className="text-xs" style={{ color: c.gray400 }}>Sin datos todavia.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {categoryRanking.map(([cat, revenue]) => (
                      <div key={cat} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold" style={{ color: c.black }}>{cat}</span>
                          <span className="font-bold" style={{ color: c.black }}>{formatPrice(revenue)}</span>
                        </div>
                        <div className="h-1.5" style={{ backgroundColor: c.gray100 }}>
                          <div className="h-full" style={{ width: `${(revenue / maxCategoryRevenue) * 100}%`, backgroundColor: c.black }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border p-5" style={{ backgroundColor: c.white, borderColor: c.gray200 }}>
                <p className="text-sm font-black uppercase tracking-wide mb-4" style={{ color: c.black }}>Ranking completo de productos</p>
                {allProductsRanking.length === 0 ? (
                  <p className="text-xs" style={{ color: c.gray400 }}>Sin datos todavia. Los pedidos completados apareceran aqui.</p>
                ) : (
                  <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                    {allProductsRanking.map(([name, { qty, revenue }], i) => (
                      <div key={name} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-black w-6 text-right flex-shrink-0" style={{ color: i < 3 ? c.black : c.gray200 }}>#{i + 1}</span>
                          <span className="text-sm font-semibold truncate" style={{ color: c.black }}>{name}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-xs" style={{ color: c.gray400 }}>{formatPrice(revenue)}</span>
                          <span className="text-sm font-bold" style={{ color: c.black }}>{qty} ud.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border p-5" style={{ backgroundColor: c.white, borderColor: c.gray200 }}>
                <p className="text-sm font-black uppercase tracking-wide mb-4" style={{ color: c.black }}>Alertas de stock</p>
                {outOfStockProducts.length === 0 && lowStockProducts.length === 0 ? (
                  <p className="text-xs" style={{ color: c.gray400 }}>Todo el stock está en niveles saludables.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {outOfStockProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs px-3 py-2" style={{ backgroundColor: "#FCE9EA" }}>
                        <span className="font-semibold" style={{ color: c.black }}>{p.name}</span>
                        <span className="font-bold uppercase tracking-wide" style={{ color: c.accent }}>Agotado</span>
                      </div>
                    ))}
                    {lowStockProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs px-3 py-2" style={{ backgroundColor: "#FBF1DF" }}>
                        <span className="font-semibold" style={{ color: c.black }}>{p.name}</span>
                        <span className="font-bold uppercase tracking-wide" style={{ color: c.warning }}>Stock bajo · {p.stock} ud.</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border p-5" style={{ backgroundColor: c.white, borderColor: c.gray200 }}>
                <p className="text-sm font-black uppercase tracking-wide mb-4" style={{ color: c.black }}>Estado de pedidos</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-px" style={{ backgroundColor: c.gray200 }}>
                  {["pendiente","confirmado","enviado","entregado","cancelado"].map((status) => {
                    const count = orders.filter(o => o.status === status).length
                    return (
                      <div key={status} className="text-center p-3" style={{ backgroundColor: c.white }}>
                        <p className="text-2xl font-black" style={{ color: c.black }}>{count}</p>
                        <p className="text-xs mt-0.5 uppercase tracking-wide" style={{ color: c.gray400 }}>{status}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })()}

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

  const removeColor = (col: string) => f("colors", (form.colors ?? []).filter((x) => x !== col))

  const isValid = form.name.trim() !== "" && form.price > 0

  return (
    <div className="border mt-4 mb-2" style={{ backgroundColor: c.white, borderColor: c.black }}>
      <div className="px-5 py-3 flex items-center gap-2 border-b" style={{ backgroundColor: c.black, borderColor: c.black }}>
        <Package size={15} style={{ color: c.white }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: c.white, letterSpacing: "0.06em" }}>
          {isNew ? "Nuevo producto" : `Editando: ${form.name}`}
        </p>
      </div>

      <div className="px-5 py-6 grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Nombre */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className={labelClass} style={labelStyle}>Nombre *</label>
          <input type="text" value={form.name} onChange={(e) => f("name", e.target.value)}
            placeholder="Nombre del producto" className={inputClass} style={inputStyle} />
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className={labelClass} style={labelStyle}>Descripción</label>
          <textarea value={form.description} onChange={(e) => f("description", e.target.value)}
            placeholder="Descripción del producto..." rows={2}
            className={inputClass + " resize-none"} style={inputStyle} />
        </div>

        {/* Precio */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} style={labelStyle}>Precio (ARS) *</label>
          <input type="number" min={0} value={form.price} onChange={(e) => f("price", Number(e.target.value))}
            placeholder="0" className={inputClass} style={inputStyle} />
        </div>

        {/* Descuento */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} style={labelStyle}>Descuento (%)</label>
          <input type="number" min={0} max={90} value={form.discountPercent ?? 0} onChange={(e) => f("discountPercent", Number(e.target.value))}
            placeholder="0" className={inputClass} style={inputStyle} />
          {!!form.discountPercent && form.discountPercent > 0 && (
            <p className="text-xs font-semibold" style={{ color: c.success }}>
              Precio final: {formatPrice(Math.round(form.price * (1 - form.discountPercent / 100)))}
            </p>
          )}
        </div>

        {/* Categoría */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} style={labelStyle}>Categoría *</label>
          <select value={form.category} onChange={(e) => f("category", e.target.value)}
            className={inputClass} style={inputStyle}>
            {categories.filter(cat => cat.id !== "todos").map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
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
          <label className={labelClass} style={labelStyle}>Texto alternativo imagen</label>
          <input type="text" value={form.imageAlt} onChange={(e) => f("imageAlt", e.target.value)}
            placeholder="Descripción de la imagen para accesibilidad" className={inputClass} style={inputStyle} />
        </div>

        {/* Badge */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} style={labelStyle}>Etiqueta (badge)</label>
          <input type="text" value={form.badge ?? ""} onChange={(e) => f("badge", e.target.value)}
            placeholder="Ej: Oferta, Nuevo, Más vendido" className={inputClass} style={inputStyle} />
        </div>

        {/* Temporada */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} style={labelStyle}>Temporada</label>
          <input type="text" value={form.season ?? ""} onChange={(e) => f("season", e.target.value)}
            placeholder="Ej: Verano 2026, Invierno 2026" className={inputClass} style={inputStyle} />
        </div>

        {/* ── Colores disponibles ── */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={labelClass + " flex items-center gap-1.5"} style={labelStyle}>
            <Palette size={13} /> Colores disponibles
          </label>
          <div className="flex gap-2">
            <input type="text" value={colorInput} onChange={(e) => setColorInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
              placeholder="Ej: Rojo, Azul marino, Dorado..." className={inputClass} style={inputStyle} />
            <button onClick={addColor} type="button"
              className="flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wide flex-shrink-0"
              style={{ backgroundColor: c.black, color: c.white }}>
              <Plus size={14} /> Agregar
            </button>
          </div>
          {(form.colors ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(form.colors ?? []).map((col) => (
                <span key={col} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border"
                  style={{ borderColor: c.gray200, color: c.black }}>
                  {col}
                  <button onClick={() => removeColor(col)} type="button">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Talles disponibles */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={labelClass} style={labelStyle}>Talles disponibles</label>
          <div className="flex gap-2">
            <input type="text" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
              placeholder="Ej: 36, 37, 38..." className={inputClass} style={inputStyle} />
            <button onClick={addSize} type="button"
              className="flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wide flex-shrink-0"
              style={{ backgroundColor: c.black, color: c.white }}>
              <Plus size={14} /> Agregar
            </button>
          </div>
          {(form.sizes ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(form.sizes ?? []).map((s) => (
                <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border"
                  style={{ borderColor: c.gray200, color: c.black, backgroundColor: c.gray50 }}>
                  {s}
                  <button onClick={() => removeSize(s)} type="button"><X size={11} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stock */}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} style={labelStyle}>Stock (-1 = encargo puro)</label>
          <input type="number" min={-1} value={form.stock ?? 10} onChange={(e) => f("stock", Number(e.target.value))}
            className={inputClass} style={inputStyle} />
        </div>

        {/* Destacado */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => f("featured", !form.featured)}
            className="relative w-11 h-6 rounded-full transition-all"
            style={{ backgroundColor: form.featured ? c.black : c.gray200 }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
              style={{ left: form.featured ? "calc(100% - 22px)" : "2px", backgroundColor: c.white, boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
          </button>
          <label className="text-sm font-semibold" style={{ color: c.gray600 }}>Producto destacado</label>
        </div>

        {/* Es encargo */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => f("isEncargo", !form.isEncargo)}
            className="relative w-11 h-6 rounded-full transition-all"
            style={{ backgroundColor: form.isEncargo ? c.accent : c.gray200 }}>
            <span className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
              style={{ left: form.isEncargo ? "calc(100% - 22px)" : "2px", backgroundColor: c.white, boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }} />
          </button>
          <label className="text-sm font-semibold" style={{ color: c.gray600 }}>Solo por encargo</label>
        </div>
      </div>

      <div className="flex items-center gap-3 px-5 pb-5 pt-2 border-t" style={{ borderColor: c.gray200 }}>
        <PrimaryButton onClick={onSave} disabled={!isValid}><Save size={14} /> Guardar</PrimaryButton>
        <SecondaryButton onClick={onCancel}><X size={14} /> Cancelar</SecondaryButton>
      </div>
    </div>
  )
}

// ─── CategoryForm ─────────────────────────────────────────────────────────────

interface CategoryFormProps {
  form: Category
  setForm: (cat: Category) => void
  onSave: () => void
  onCancel: () => void
  title: string
}

const CAT_COLORS = [
  "#000000", "#E63946", "#5C5C5C", "#8A6D3B",
  "#2F6F62", "#6B4C6E", "#111111", "#B8790A",
]

function CategoryForm({ form, setForm, onSave, onCancel, title }: CategoryFormProps) {
  const f = (key: keyof Category, value: string) => setForm({ ...form, [key]: value })
  const isValid = form.name.trim() !== ""

  return (
    <div className="border" style={{ backgroundColor: c.white, borderColor: c.black }}>
      <div className="px-5 py-3 flex items-center gap-2 border-b" style={{ backgroundColor: c.black, borderColor: c.black }}>
        <Tag size={15} style={{ color: c.white }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: c.white, letterSpacing: "0.06em" }}>{title}</p>
      </div>
      <div className="px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} style={labelStyle}>Nombre *</label>
          <input type="text" value={form.name} onChange={(e) => f("name", e.target.value)}
            placeholder="Ej: Piñatas" className={inputClass} style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} style={labelStyle}>Slug / ID</label>
          <input type="text" value={form.id} onChange={(e) => f("id", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            placeholder="se genera automático" className={inputClass} style={inputStyle} />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={labelClass} style={labelStyle}>Color</label>
          <div className="flex gap-2 flex-wrap">
            {CAT_COLORS.map((col) => (
              <button key={col} type="button" onClick={() => f("color", col)}
                className="w-8 h-8 border-2 transition-all"
                style={{ backgroundColor: col, borderColor: form.color === col ? c.black : "transparent" }} />
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
      <div className="flex items-center gap-3 px-5 pb-5 pt-2 border-t" style={{ borderColor: c.gray200 }}>
        <PrimaryButton onClick={onSave} disabled={!isValid}><Save size={14} /> Guardar</PrimaryButton>
        <SecondaryButton onClick={onCancel}><X size={14} /> Cancelar</SecondaryButton>
      </div>
    </div>
  )
}
